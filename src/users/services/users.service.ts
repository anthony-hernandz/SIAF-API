import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { MntRestoreAccount, MntRolUser, MntUsers } from '../entities';
import { paginationUsersDTO } from 'src/users/dtos/users-pagination.dto';
import { createUserDTO, updateUserDTO } from 'src/users/dtos/users.dto';
import { RolsService } from 'src/users/services/rols.service';
import { MntPermissionsUser } from '@auth/entities/MntPermissionsUser.entity';
import { MntPermissionModules } from '@modules/entities/mntPermissionsModules.entity';
import { ModulesService } from '@modules/services/modules.service';
import { PermissionsService } from '@auth/services/permissions.service';
import { MntPermissionsRol } from '@auth/entities/MntPermissionsRol.entity';
import { MntModules } from '@modules/entities/mntModules.entity';
import { IChangePassword } from 'src/users/interfaces/change-password.interface';
import { RestoreAccountService } from 'src/users/services/restore-account.service';
import { EmailService } from '@email/services/email.service';
import { CtlPaises } from 'src/administracion/catalogs/entities/paises.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(MntUsers)
    private readonly usersRepository: Repository<MntUsers>,
    @InjectRepository(CtlPaises)
    private readonly paisesRepository: Repository<CtlPaises>,
    private readonly rolService: RolsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly moduleService: ModulesService,
    private readonly permissionsService: PermissionsService,
    private readonly restoreAccountService: RestoreAccountService,
    private readonly emailService: EmailService,
  ) {}

  async findAll(params: paginationUsersDTO) {
    const { per_page, page, paginate, directionOrder, username } = params;

    // Validacion para que el valor de busqueda tenga minimo 3 caracteres
    if (username && username.length < 3) {
      throw new BadRequestException('El término de búsqueda debe tener al menos 3 caracteres');
    }
    
    const findOptions: FindManyOptions<MntUsers> = {};

    // Si hay valor de busqueda, filtramos tanto por los nombres y apellidos
    if (username) {
      findOptions.where = [
        { primerNombre: ILike(`%${username}%`) },
        { segundoNombre: ILike(`%${username}%`) },
        { tercerNombre: ILike(`%${username}%`) },
        { primerApellido: ILike(`%${username}%`) },
        { segundoApellido: ILike(`%${username}%`) },
      ];
    }

    if (paginate) {
      findOptions.take = per_page;
      findOptions.skip = per_page * (page - 1);
    }

    if (directionOrder) findOptions.order = { email: directionOrder };

    findOptions.relations = {
      rol: true,
      establecimiento: { institucion: true },
    };
    findOptions.select = {
      id: true,
      primerNombre: true,
      primerApellido: true,
      n_documento: true,
      active: true,
      createAt: true,
      updateAt: true,
      rol: { id: true, name: true },
      establecimiento: { nombre: true, institucion: { nombre: true } },
    };

    const [users, count] = await this.usersRepository.findAndCount(findOptions);
    return {
      users,
      pagination: {
        limit: paginate ? per_page : count,
        offset: paginate ? page : 1,
        total: count,
      },
    };
  }

  async findByEmail(email: string): Promise<MntUsers> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: { rol: true, establecimiento: true },
    });
  }

  async findOne(id: string): Promise<MntUsers> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        rol: true,
        establecimiento: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDTO: createUserDTO): Promise<MntUsers> {
    const { idRol, password, email, primerNombre, segundoNombre, 
      tercerNombre, primerApellido,segundoApellido , fecha_nacimiento, n_documento, establecimiento,username, pais, dependencia} = createUserDTO;

    await this.rolService.findOne(idRol);

    if (await this.findByEmail(email)) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      id: uuidv4(),
      password: hashPassword,
      email,
      rol: { id: idRol },
      primerNombre,
      segundoNombre,
      tercerNombre,
      primerApellido,
      segundoApellido,
      // Convierte la string de fecha a objeto Date para la entidad
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
      n_documento,
      establecimiento: establecimiento ? { id: establecimiento } : null, 
      dependencia: dependencia ? { id: dependencia } : null, 
      username,
      pais: pais ? { id: pais } : null,
      createAt: moment().tz('America/El_Salvador').format(),
    });

    await this.usersRepository.save(user);

    return user;
  }

  async update(id: string, updateUserDTO: updateUserDTO): Promise<MntUsers> {
    const { idRol, email, primerNombre, segundoNombre,tercerNombre, primerApellido, segundoApellido,
      fecha_nacimiento,n_documento, establecimiento, pais, dependencia, username} = updateUserDTO;
    const oldUser = await this.findOne(id);

    if (email) {
      if ((await this.findByEmail(email)) && email !== oldUser.email) {
        throw new BadRequestException('Email already exists');
      }
    }
    await this.rolService.findOne(idRol);
    const user = await this.usersRepository.preload({
      id,
      rol: { id: idRol },
      email,
      primerNombre,
      segundoNombre,
      tercerNombre,
      primerApellido,
      segundoApellido,
      // Convierte la string de fecha a objeto Date para la entidad
      fecha_nacimiento: fecha_nacimiento ? new Date(fecha_nacimiento) : null,
      n_documento,
      establecimiento: establecimiento ? { id: establecimiento } : null, 
      dependencia: dependencia ? { id: dependencia } : null, 
      username,
      pais: pais ? { id: pais } : null,
      updateAt: moment().tz('America/El_Salvador').format(),
    });

    await this.usersRepository.save(user);
    return user;
  }

  async delete(id: string): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }

  /**
   * Esta funcion servira para poder actualizar los permisos
   * de un usuario en especifico
   */
  async permisos(id: string, array: string) {
    const usuario = await this.findOne(id);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const rol: MntRolUser = await this.rolService.findOne(usuario.rol.id);
      const permisosTipoUsuario: MntPermissionsRol[] =
        await this.permissionsService.findPermissionUserByRol(rol.id);
      const arrayPermisosTipoUsuario: any[] = [];
      for (const element of permisosTipoUsuario) {
        arrayPermisosTipoUsuario.push(element.module.id);
      }
      const arrayNew: any = JSON.parse(array);
      const arrayPadre: Array<MntPermissionsUser> = [];
      await queryRunner.manager.delete(MntPermissionsUser, {
        user: usuario,
      });
      const arrayModulos: string[] = [];
      const arrayModulosFinal: string[] = [];

      for (const key in arrayNew) {
        if (Object.prototype.hasOwnProperty.call(arrayNew, key)) {
          const element: any = arrayNew[key];
          arrayModulos.push(element);
          arrayModulosFinal.push(element);
        }
      }
      for (const moduloId of arrayModulos) {
        const repositoryEtiqueta: any[] = await this.dataSource
          .getRepository(MntPermissionModules)
          .createQueryBuilder('mnt_permisos_modulos')
          .innerJoin('mnt_permisos_modulos.moduleView', 'mnt_modulo')
          .select(['mnt_permisos_modulos.id_modulo_endpoint'])
          .distinct(true)
          .where('mnt_modulo.id = :idVista', {
            idVista: moduloId,
          })
          .getRawMany();
        for (const idModAgregar of repositoryEtiqueta) {
          arrayModulosFinal.push(idModAgregar['id_modulo_endpoint']);
        }
      }
      for (const moduloId of arrayModulosFinal) {
        const moduloRegister: MntModules =
          await this.moduleService.findById(moduloId);
        let asignadoEspecialVar: boolean = false;
        if (arrayPermisosTipoUsuario.indexOf(moduloRegister.id) == -1) {
          asignadoEspecialVar = true;
        }
        const arrayHijo: MntPermissionsUser = {
          id: uuidv4(),
          user: usuario,
          module: moduloRegister,
          specialAssignee: asignadoEspecialVar,
          createAt: moment().tz('America/El_Salvador').format(),
          updateAt: undefined,
        };
        arrayPadre.push(arrayHijo);
      }
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MntPermissionsUser)
        .values(arrayPadre)
        .execute();
      await queryRunner.commitTransaction();
      return usuario;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAllByRol(id: string) {
    return await this.usersRepository.find({
      where: {
        rol: { id },
      },
    });
  }

  async findPermissionsById(id: string) {
    const user = await this.findOne(id);
    const permisos = await this.permissionsService.permisosByUser(id);

    return {
      permisos,
      user: user.email,
    };
  }

  async changePasswordReset(payload: IChangePassword) {
    if (payload.newPassword != payload.repeatPassword) {
      throw new BadRequestException('Las contraseñas enviadas no coinciden.');
    } else {
      const tokenRegister = await this.restoreAccountService.searchToken(
        payload.tokenReset,
      );
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const hashPassword = await bcrypt.hash(payload.newPassword, 10);
        const user = await queryRunner.manager.update(
          MntUsers,
          {
            id: tokenRegister.usuarios_id,
          },
          {
            password: hashPassword,
          },
        );
        await queryRunner.manager.update(
          MntRestoreAccount,
          {
            id: tokenRegister.recuperacion_cuenta_id,
          },
          {
            active: false,
          },
        );
        await queryRunner.commitTransaction();
        return user;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new NotFoundException('Error al cambiar la contraseña.' + err);
      } finally {
        await queryRunner.release();
      }
    }
  }

  async changePasswordResetByUser(payload: any) {
    if (payload.newPassword != payload.repeatPassword) {
      throw new BadRequestException('Las contraseñas enviadas no coinciden.');
    } else {
      const user = await this.findOne(payload.user.id);
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        const hashPassword = await bcrypt.hash(payload.newPassword, 10);
        await queryRunner.manager.update(
          MntUsers,
          {
            id: user.id,
          },
          {
            password: hashPassword,
          },
        );
        await queryRunner.commitTransaction();
        return user;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new NotFoundException('Error al cambiar la contraseña.' + err);
      } finally {
        await queryRunner.release();
      }
    }
  }

  async updateTwoFaSecret(email: string, secret: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Email no existe');
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    await queryRunner.manager.update(
      MntUsers,
      {
        id: user.id,
      },
      {
        secretKey: secret,
      },
    );
    await this.emailService.sendEmail(
      user.email,
      'SIAF - Código de autentificación',
      'twofactorpass',
      {
        name: user.email,
        token: secret,
      },
      [
        {
          filename: 'Logo_SIAF.png',
          path: __dirname + '/../../../static/Logo_SIAF.png',
          cid: 'logo',
        },
      ],
    );

    await queryRunner.commitTransaction();
    return {
      message: 'Se ha enviado un correo para la doble verificación',
    };
  }
  async getPaises() {
    return await this.paisesRepository.find();
  }

  //Cambiando el estado de un usuario
  async changeEstado(id: string, activo: boolean) {
  const user = await this.findOne(id); //Asegurando que el usuario existe.

  user.active = activo;
  user.updateAt = moment().tz('America/El_Salvador').toDate();

  return await this.usersRepository.save(user);
}




}
