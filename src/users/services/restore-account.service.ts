import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { envs } from '@config/envs';
import * as moment from 'moment-timezone';

import { MntRestoreAccount, MntUsers } from 'src/users/entities';

@Injectable()
export class RestoreAccountService {
  constructor(
    @InjectRepository(MntRestoreAccount)
    private restoreAccountRepository: Repository<MntRestoreAccount>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(
    usuario: MntUsers,
    ip: string,
    route: string,
    useQueryRunner?: QueryRunner,
  ) {
    const urlApplication = envs.urlApplicationFront;
    const dateTime = new Date().getTime();
    const dataTimeExpiration =
      dateTime + parseInt(envs.emailRecoverPasswordTime) * 1000;
    const expirationDateTime =
      String(new Date(dataTimeExpiration).toLocaleDateString()) +
      ' ' +
      String(new Date(dataTimeExpiration).toLocaleTimeString());
    const fechaHoraActual =
      String(new Date(dateTime).toLocaleDateString()) +
      ' ' +
      String(new Date(dateTime).toLocaleTimeString());

    const saltOrRounds = 10;
    const password = fechaHoraActual + `${usuario.id}`;
    const token = await bcrypt.hash(password, saltOrRounds);
    const tokenNew = token.split('/').join('');
    const tokenNew2 = tokenNew.split('.').join('');
    const tokenNew3 = tokenNew2.split('$').join('');
    const linkRecuperacion = `${urlApplication}${route}${tokenNew3}`;
    const attemps = await this.restoreAccountRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select(['recuperacion_cuenta.id'])
      .where('recuperacion_cuenta.id_user = :usuarioId', {
        usuarioId: usuario.id,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere(
        'recuperacion_cuenta.dataTimeExpiration >= :dataTimeExpiration',
        { dataTimeExpiration: fechaHoraActual },
      )
      .getCount();
    if (attemps >= parseInt(envs.maxAttempsRecoverPasswordEmail)) {
      throw new BadRequestException(
        `No se pueden enviar mas de ${envs.maxAttempsRecoverPasswordEmail} peticiones de restablecimiento de password. Intente mas tarde.`,
      );
    }
    let queryRunner: QueryRunner = useQueryRunner;
    if (!useQueryRunner) {
      queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
    }
    let ipAddress: string = ip || '';
    if (ipAddress.substr(0, 7) == '::ffff:') {
      ipAddress = ipAddress.substr(7);
    }
    try {
      await queryRunner.manager.insert(MntRestoreAccount, [
        {
          id: uuidv4(),
          ip: ipAddress,
          linkRestore: linkRecuperacion,
          tokenRestore: tokenNew3,
          active: true,
          user: usuario,
          dataTimeExpiration: expirationDateTime,
          createAt: moment().tz('America/El_Salvador').format(),
        },
      ]);

      if (!useQueryRunner) {
        await queryRunner.commitTransaction();
      }
      return linkRecuperacion;
    } catch (err) {
      if (!useQueryRunner) {
        await queryRunner.rollbackTransaction();
      }
      throw new ConflictException('Error al enviar el email');
    } finally {
      if (!useQueryRunner) {
        await queryRunner.release();
      }
    }
  }

  async searchToken(token: string) {
    const dateTime = new Date().getTime();
    const fechaHoraActual =
      String(new Date(dateTime).toLocaleDateString()) +
      ' ' +
      String(new Date(dateTime).toLocaleTimeString());
    const attemps = await this.restoreAccountRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select([
        'recuperacion_cuenta.id',
        'recuperacion_cuenta.dataTimeExpiration',
        'recuperacion_cuenta.active',
        'recuperacion_cuenta.id_user',
        'usuarios.id',
        'usuarios.email',
      ])
      .innerJoin('recuperacion_cuenta.user', 'usuarios')
      .where('recuperacion_cuenta.tokenRestore = :token', {
        token: token,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere(
        'recuperacion_cuenta.dataTimeExpiration >= :dataTimeExpiration',
        { dataTimeExpiration: fechaHoraActual },
      )
      .getRawOne();
    if (!attemps) {
      return {
        status: false,
        message: `No se encontró una petición de recuperación de cuenta con esa URL`,
      };
    }
    return attemps;
  }

  async searchTokenByUser(idUser: string) {
    const dateTime = new Date().getTime();
    const fechaHoraActual =
      String(new Date(dateTime).toLocaleDateString()) +
      ' ' +
      String(new Date(dateTime).toLocaleTimeString());
    const attemps = await this.restoreAccountRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select([
        'recuperacion_cuenta.id',
        'recuperacion_cuenta.dataTimeExpiration',
        'recuperacion_cuenta.tokenRestore',
      ])
      .innerJoin('recuperacion_cuenta.user', 'usuarios')
      .where('usuarios.id = :idUser', {
        idUser,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere('recuperacion_cuenta.dataTimeExpiration >= :fechaHoraActual', {
        fechaHoraActual,
      })
      .getRawOne();
    if (!attemps) {
      throw new NotFoundException(
        `No se encontró una petición de recuperación de cuenta para este usuario.`,
      );
    }

    return attemps;
  }
}
