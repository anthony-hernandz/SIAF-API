import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MntRolUser, MntUsers } from 'src/users/entities';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment-timezone';

import { UsersService } from './users.service';
import { paginationRolsDTO } from 'src/users/dtos/rols-pagination.dto';
import { MntPermissionsUser } from '@auth/entities/MntPermissionsUser.entity';
import { MntPermissionsRol } from '@auth/entities/MntPermissionsRol.entity';
import { MntPermissionModules } from '@modules/entities/mntPermissionsModules.entity';
import { ModulesService } from '@modules/services/modules.service';
import { MntModules } from '@modules/entities/mntModules.entity';
import { PermissionsService } from '@auth/services/permissions.service';

@Injectable()
export class RolsService {
  constructor(
    @InjectRepository(MntRolUser)
    private readonly rolRepository: Repository<MntRolUser>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly moduleServices: ModulesService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async findAll(params: paginationRolsDTO) {
    const { per_page, page, paginate, directionOrder, name } = params;

    const findOptions: FindManyOptions<MntRolUser> = {};
    const where: FindOptionsWhere<MntRolUser> = {};

    if (name) where.name = ILike(`%${name || ''}%`);

    if (paginate) {
      findOptions.take = per_page;
      findOptions.skip = per_page * (page - 1);
    }

    if (directionOrder) findOptions.order = { name: directionOrder };

    findOptions.where = where;

    const [rols, count] = await this.rolRepository.findAndCount(findOptions);
    return {
      rols,
      pagination: {
        limit: paginate ? per_page : count,
        offset: paginate ? page : 1,
        total: count,
      },
    };
  }

  async findOne(id: string): Promise<MntRolUser> {
    const rol: MntRolUser = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol not found');
    }
    return rol;
  }

  /**
   * Esta funcion servira para poder actualizar los permisos
   * de un tipo de usuario en especifico, y a su vez actualizar
   * el permiso de todos los usuarios
   */
  async permisos(id: string, array: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const tipoUsuario: MntRolUser = await this.findOne(id);
      const arrayNew: any = JSON.parse(array);
      const usersChanged: MntUsers[] = await this.usersService.findAllByRol(id);
      const arrayPadre: Array<MntPermissionsUser> = [];
      const arrayPadreRol: Array<MntPermissionsRol> = [];
      await queryRunner.manager.delete(MntPermissionsRol, {
        specialAssignee: false,
        rol: tipoUsuario,
      });
      // let count = 0;
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
          await this.moduleServices.findById(moduloId);
        const arrayHijoRol: MntPermissionsRol = {
          specialAssignee: false,
          module: moduloRegister,
          rol: tipoUsuario,
          id: uuidv4(),
          createAt: moment().tz('America/El_Salvador').format(),
          updateAt: undefined,
        };
        arrayPadreRol.push(arrayHijoRol);
      }
      for (const usuarioRegister of usersChanged) {
        await queryRunner.manager.delete(MntPermissionsUser, {
          specialAssignee: false,
          user: usuarioRegister,
        });
        for (const moduloId of arrayModulosFinal) {
          const moduloRegister: MntModules =
            await this.moduleServices.findById(moduloId);
          const arrayHijo: MntPermissionsUser = {
            user: usuarioRegister,
            module: moduloRegister,
            specialAssignee: false,
            id: uuidv4(),
            createAt: moment().tz('America/El_Salvador').format(),
            updateAt: undefined,
          };
          arrayPadre.push(arrayHijo);
        }
        // count++;
      }
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MntPermissionsUser)
        .values(arrayPadre)
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MntPermissionsRol)
        .values(arrayPadreRol)
        .execute();
      await queryRunner.commitTransaction();
      return tipoUsuario;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
  /**
   * Esta funcion servira para poder actualizar los permisos
   * de un tipo de usuario en especifico, y a su vez actualizar
   * el permiso de todos los usuarios
   */
  async permisosCatalogos(id: string, array: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const tipoUsuario: MntRolUser = await this.findOne(id);
      const arrayNew: any = JSON.parse(array);
      const usersChanged: MntUsers[] = await this.usersService.findAllByRol(id);
      const arrayPadre: Array<MntPermissionsUser> = [];
      const arrayPadreRol: Array<MntPermissionsRol> = [];
      await queryRunner.manager.delete(MntPermissionsRol, {
        specialAssignee: false,
        rol: tipoUsuario,
      });
      // let count = 0;
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
        const vistasAdmin: any[] = await this.dataSource
          .getRepository(MntModules)
          .createQueryBuilder('mnt_modulos')
          .select(['mnt_modulos.id'])
          .where(
            'mnt_modulos.id_padre = :idPadre and mnt_modulos.frontend = true',
            {
              idPadre: moduloId,
            },
          )
          .getRawMany();
        for (const idModAgregar of vistasAdmin) {
          arrayModulos.push(idModAgregar['id']);
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
          await this.moduleServices.findById(moduloId);
        const arrayHijoRol: MntPermissionsRol = {
          specialAssignee: false,
          module: moduloRegister,
          rol: tipoUsuario,
          id: uuidv4(),
          createAt: moment().tz('America/El_Salvador').format(),
          updateAt: undefined,
        };
        arrayPadreRol.push(arrayHijoRol);
      }
      for (const usuarioRegister of usersChanged) {
        await queryRunner.manager.delete(MntPermissionsUser, {
          specialAssignee: false,
          user: usuarioRegister,
        });
        for (const moduloId of arrayModulosFinal) {
          const moduloRegister: MntModules =
            await this.moduleServices.findById(moduloId);
          const arrayHijo: MntPermissionsUser = {
            user: usuarioRegister,
            module: moduloRegister,
            specialAssignee: false,
            id: uuidv4(),
            createAt: moment().tz('America/El_Salvador').format(),
            updateAt: undefined,
          };
          arrayPadre.push(arrayHijo);
        }
        // count++;
      }
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MntPermissionsUser)
        .values(arrayPadre)
        .execute();
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MntPermissionsRol)
        .values(arrayPadreRol)
        .execute();
      await queryRunner.commitTransaction();
      return tipoUsuario;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }
  async findPermissionsById(id: string) {
    const { name } = await this.findOne(id);
    const permisos = await this.permissionsService.permisosByRol(id);

    return {
      rol: name,
      permisos,
    };
  }
}
