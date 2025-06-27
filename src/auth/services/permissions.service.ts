import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MntPermissionsUser } from '@auth/entities/MntPermissionsUser.entity';
import { DataSource, Repository } from 'typeorm';
import { MntPermissionsRol } from '@auth/entities/MntPermissionsRol.entity';
import { MntEtiquetas } from '@modules/entities/mntEtiquetas.entity';
import { MntMenu } from '@modules/entities/MntMenu.entity';
import { MntModules } from '@modules/entities/mntModules.entity';
import { classSessionUser } from '@common/class/userSession.class';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(MntPermissionsUser)
    private readonly usersPermissionsRepository: Repository<MntPermissionsUser>,
    @InjectRepository(MntPermissionsRol)
    private readonly rolPermissionsRepository: Repository<MntPermissionsRol>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly sessionUser: classSessionUser,
  ) {}

  async findPermissionsToUser(idUser: string, path: string, method: string) {
    path = path.split('/api/v1')[1];

    if (!path.startsWith('/menu') && !path.startsWith('/auth')) {
      const permiso = await this.usersPermissionsRepository
        .createQueryBuilder('mnt_permissions_users')
        .select(['mnt_permissions_users.id'])
        .innerJoin('mnt_permissions_users.user', 'mnt_users')
        .innerJoin('mnt_permissions_users.module', 'mnt_module')
        .where('mnt_users.id = :idUser', {
          idUser,
        })
        .andWhere('mnt_module.filename = :filename', { filename: path })
        .andWhere('mnt_module.method = :method', { method })
        .getOne();

      if (!permiso)
        throw new ForbiddenException(
          'You do not have permission to access this route',
        );
    }
  }

  async findPermissionUserByRol(id: string) {
    return await this.rolPermissionsRepository.find({
      where: {
        rol: { id },
      },
      relations: {
        module: true,
      },
    });
  }

  async permisosByUser(id: string) {
    const permisos = [];
    const repositoryEtiqueta = await this.dataSource
      .getRepository(MntEtiquetas)
      .createQueryBuilder('mnt_etiquetas')
      .select([
        'mnt_etiquetas.id',
        'mnt_etiquetas.nombre',
        'mnt_etiquetas.visible',
        'mnt_etiquetas.activo',
        'mnt_etiquetas.prioridad',
      ])
      .distinct(true)
      .innerJoin('mnt_etiquetas.etiquetaMenu', 'mnt_menu')
      .innerJoin('mnt_menu.modulos', 'mnt_modulo')
      .where('mnt_etiquetas.activo is true')
      .andWhere('mnt_menu.activo is true')
      .andWhere('mnt_modulo.active is true')
      .andWhere('mnt_modulo.frontend is true')
      .orderBy('mnt_etiquetas.prioridad', 'ASC')
      .getRawMany();
    for (const elementEtiqueta in repositoryEtiqueta) {
      const dataEtiqueta = repositoryEtiqueta[elementEtiqueta];
      const idEtiqueta = dataEtiqueta['mnt_etiquetas_id'];
      const nombreEtiqueta = dataEtiqueta['mnt_etiquetas_nombre'];
      const repositoryMenu = await this.dataSource
        .getRepository(MntMenu)
        .createQueryBuilder('mnt_menu')
        .select([
          'mnt_menu.id',
          'mnt_menu.nombre',
          'mnt_menu.visible',
          'mnt_menu.activo',
          'mnt_menu.icono',
          'mnt_menu.filename',
          'mnt_menu.admin',
          'mnt_menu.super_admin',
          'mnt_menu.prioridad',
        ])
        .distinct(true)
        .innerJoin('mnt_menu.modulos', 'mnt_modulo')
        .where('mnt_menu.activo is true')
        .andWhere('mnt_menu.id_etiqueta = :idetiqueta', {
          idetiqueta: idEtiqueta,
        })
        .andWhere('mnt_modulo.active is true')
        .andWhere('mnt_modulo.frontend is true')
        .orderBy('mnt_menu.prioridad', 'ASC')
        .getRawMany();
      const arrayGeneral = [];
      for (const element in repositoryMenu) {
        const data = repositoryMenu[element];
        const idMenu = data['mnt_menu_id'];
        const nombreMenu = data['mnt_menu_nombre'];
        const iconoMenu = data['mnt_menu_icono'];
        const itemsArray = [];
        const repositoryModulo = await this.dataSource
          .getRepository(MntModules)
          .createQueryBuilder('mnt_modulo')
          .select([
            'mnt_modulo.id',
            'mnt_modulo.name',
            'mnt_modulo.visible',
            'mnt_modulo.active as activo',
            'mnt_modulo.icono',
            'mnt_modulo.filename',
            'mnt_modulo.isFather',
            'mnt_modulo.priority as prioridad',
            'mnt_permisos_usuario.id_usuario as idPermisoUsuario',
          ])
          .distinct(true)
          .leftJoin(
            'mnt_modulo.permissionUser',
            'mnt_permisos_usuario',
            'mnt_permisos_usuario.id_usuario = :usuarioId',
            {
              usuarioId: id,
            },
          )
          .leftJoin('mnt_permisos_usuario.user', 'mnt_usuarios')
          .andWhere('mnt_modulo.id_menu = :menuId', {
            menuId: idMenu,
          })
          .andWhere('mnt_modulo.active is true')
          .andWhere('mnt_modulo.frontend is true')
          .orderBy('mnt_modulo.priority', 'ASC')
          .getRawMany();
        let activo_completo = true;
        for (const modulo in repositoryModulo) {
          const idModulo = repositoryModulo[modulo]['mnt_modulo_id'];
          const nombreModulo = repositoryModulo[modulo]['mnt_modulo_nombre'];
          const iconoModulo = repositoryModulo[modulo]['mnt_modulo_icono'];
          const idPermisoUsuario = repositoryModulo[modulo]['idpermisousuario'];
          const filenameModulo =
            repositoryModulo[modulo]['mnt_modulo_filename'];
          const newItem = {
            activo: !!idPermisoUsuario,
            idModulo: idModulo,
            label: nombreModulo,
            to: filenameModulo,
            icon: iconoModulo,
          };
          if (!idPermisoUsuario) {
            activo_completo = false;
          }
          itemsArray.push(newItem);
        }
        const newArray = {
          id: idMenu,
          label: nombreMenu,
          icon: iconoMenu,
          items: itemsArray,
          activo_completo: activo_completo,
        };
        arrayGeneral.push(newArray);
      }
      const newArrayOther = {
        label: nombreEtiqueta,
        items: arrayGeneral,
      };

      permisos.push(newArrayOther);
    }

    return permisos;
  }

  async permisosByRol(id: string) {
    const permisos = [];
    const repositoryEtiqueta = await this.dataSource
      .getRepository(MntEtiquetas)
      .createQueryBuilder('mnt_etiquetas')
      .select([
        'mnt_etiquetas.id',
        'mnt_etiquetas.nombre',
        'mnt_etiquetas.visible',
        'mnt_etiquetas.activo',
        'mnt_etiquetas.prioridad',
      ])
      .distinct(true)
      .innerJoin('mnt_etiquetas.etiquetaMenu', 'mnt_menu')
      .innerJoin('mnt_menu.modulos', 'mnt_modulo')
      .where('mnt_etiquetas.activo is true')
      .andWhere('mnt_menu.activo is true')
      .andWhere('mnt_modulo.active is true')
      .andWhere('mnt_modulo.frontend is true')
      .orderBy('mnt_etiquetas.prioridad', 'ASC')
      .getRawMany();
    for (const elementEtiqueta in repositoryEtiqueta) {
      const dataEtiqueta = repositoryEtiqueta[elementEtiqueta];
      const idEtiqueta = dataEtiqueta['mnt_etiquetas_id'];
      const nombreEtiqueta = dataEtiqueta['mnt_etiquetas_nombre'];
      const repositoryMenu = await this.dataSource
        .getRepository(MntMenu)
        .createQueryBuilder('mnt_menu')
        .select([
          'mnt_menu.id',
          'mnt_menu.nombre',
          'mnt_menu.visible',
          'mnt_menu.activo',
          'mnt_menu.icono',
          'mnt_menu.filename',
          'mnt_menu.admin',
          'mnt_menu.superAdmin',
          'mnt_menu.prioridad',
        ])
        .distinct(true)
        .innerJoin('mnt_menu.modulos', 'mnt_modulo')
        .where('mnt_menu.activo is true')
        .andWhere('mnt_menu.id_etiqueta = :idetiqueta', {
          idetiqueta: idEtiqueta,
        })
        .andWhere('mnt_modulo.active is true')
        .andWhere('mnt_modulo.frontend is true')
        .orderBy('mnt_menu.prioridad', 'ASC')
        .getRawMany();
      const arrayGeneral = [];
      for (const element in repositoryMenu) {
        const data = repositoryMenu[element];
        const idMenu = data['mnt_menu_id'];
        const nombreMenu = data['mnt_menu_nombre'];
        const iconoMenu = data['mnt_menu_icono'];
        const itemsArray = [];
        const repositoryModulo = await this.dataSource
          .getRepository(MntModules)
          .createQueryBuilder('mnt_modulo')
          .select([
            'mnt_modulo.id',
            'mnt_modulo.name',
            'mnt_modulo.visible',
            'mnt_modulo.active as activo',
            'mnt_modulo.icono',
            'mnt_modulo.filename',
            'mnt_modulo.isFather',
            'mnt_modulo.priority as prioridad',
            'mnt_permisos_rol.id_rol as id_permiso_rol',
          ])
          .distinct(true)
          .leftJoin(
            'mnt_modulo.permissionRol',
            'mnt_permisos_rol',
            'mnt_permisos_rol.id_rol = :rolId',
            {
              rolId: id,
            },
          )
          .leftJoin('mnt_permisos_rol.rol', 'mnt_rol_usuarios')
          .andWhere('mnt_modulo.id_menu = :menuId', {
            menuId: idMenu,
          })
          .andWhere('mnt_modulo.active is true')
          .andWhere('mnt_modulo.frontend is true')
          .orderBy('mnt_modulo.priority', 'ASC')
          .getRawMany();
        let activo_completo = true;
        for (const modulo in repositoryModulo) {
          const idModulo = repositoryModulo[modulo]['mnt_modulo_id'];
          const nombreModulo = repositoryModulo[modulo]['mnt_modulo_nombre'];
          const iconoModulo = repositoryModulo[modulo]['mnt_modulo_icono'];
          const idPermisoRol = repositoryModulo[modulo]['id_permiso_rol'];
          const filenameModulo =
            repositoryModulo[modulo]['mnt_modulo_filename'];
          const newItem = {
            activo: !!idPermisoRol,
            idModulo: idModulo,
            label: nombreModulo,
            to: filenameModulo,
            icon: iconoModulo,
          };
          if (!idPermisoRol) {
            activo_completo = false;
          }
          itemsArray.push(newItem);
        }
        const newArray = {
          id: idMenu,
          label: nombreMenu,
          icon: iconoMenu,
          items: itemsArray,
          activo_completo: activo_completo,
        };
        arrayGeneral.push(newArray);
      }
      const newArrayOther = {
        label: nombreEtiqueta,
        items: arrayGeneral,
      };
      permisos.push(newArrayOther);
    }

    return permisos;
  }

  async hassPermission(name: any) {
    const object = name['data'];
    const dataReturn = [];
    for (const value in object) {
      const nameValue = Object.values(object[value]);
      const keyValue = Object.keys(object[value]);
      const idUsuario = this.sessionUser.idUser;

      const repositoryMenu = await this.dataSource
        .getRepository(MntMenu)
        .createQueryBuilder('mnt_menu')
        .select([
          'mnt_menu.id',
          'mnt_menu.nombre',
          'mnt_menu.visible',
          'mnt_menu.activo',
          'mnt_menu.icono',
          'mnt_menu.filename',
          'mnt_menu.admin',
          'mnt_menu.superAdmin as superAdmin',
          'mnt_menu.prioridad',
        ])
        .distinct(true)
        .innerJoin('mnt_menu.modulos', 'mnt_modulo')
        .innerJoin('mnt_modulo.permissionUser', 'mnt_permisos_usuario')
        .innerJoin('mnt_permisos_usuario.user', 'mnt_usuarios')
        .where('mnt_menu.activo is true')
        .andWhere('mnt_usuarios.id = :idUsuario', {
          idUsuario: idUsuario,
        })
        .andWhere('mnt_modulo.filename = :filename', {
          filename: nameValue[0],
        })
        .andWhere('mnt_modulo.active is true')
        .andWhere('mnt_modulo.frontend is true')
        .orderBy('mnt_menu.prioridad', 'ASC')
        .getRawMany();

      if (repositoryMenu.length > 0) {
        dataReturn.push({
          keyValue: keyValue[0],
          status: true,
        });
      } else {
        dataReturn.push({
          keyValue: keyValue[0],
          status: false,
        });
      }
      // }
    }
    return dataReturn;
  }
}
