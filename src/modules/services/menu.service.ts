import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { MntMenu } from '@modules/entities/MntMenu.entity';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment-timezone';

import { MntModules } from '@modules/entities/mntModules.entity';
import { IMenu } from '@modules/interfaces/menu.interface';
import { MntEtiquetas } from '@modules/entities/mntEtiquetas.entity';
import { classSessionUser } from '@common/class/userSession.class';
import { MntPermissionModules } from '@modules/entities/mntPermissionsModules.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MntMenu) private menuRepository: Repository<MntMenu>,
    @InjectDataSource()
    private dataSource: DataSource,
    private readonly sessionUser: classSessionUser,
  ) {}

  async findAll() {
    try {
      const array = [];
      const menu: IMenu[] = [];
      const idUsuario = this.sessionUser.idUser;
      const repositoryEtiqueta = await this.dataSource
        .getRepository(MntEtiquetas)
        .createQueryBuilder('mnt_etiquetas')
        .select([
          'mnt_etiquetas.id',
          'mnt_etiquetas.nombre',
          'mnt_etiquetas.visible',
          'mnt_etiquetas.activo',
          'mnt_etiquetas.prioridad',
          'mnt_etiquetas.icono',
        ])
        .distinct(true)
        .innerJoin('mnt_etiquetas.etiquetaMenu', 'mnt_menu')
        .innerJoin('mnt_menu.modulos', 'mnt_modulo')
        .innerJoin('mnt_modulo.permissionUser', 'mnt_permisos_usuario')
        .innerJoin('mnt_permisos_usuario.user', 'mnt_usuarios')
        .where('mnt_menu.activo is true')
        .andWhere('mnt_menu.visible is true')
        .andWhere('mnt_usuarios.id = :idUsuario', {
          idUsuario,
        })
        .andWhere('mnt_etiquetas.visible is true')
        .andWhere('mnt_modulo.visible is true')
        .andWhere('mnt_modulo.active is true')
        .andWhere('mnt_modulo.frontend is true')
        .orderBy('mnt_etiquetas.prioridad', 'ASC')
        .getRawMany();

      for (const elementEtiqueta in repositoryEtiqueta) {
        const dataEtiqueta = repositoryEtiqueta[elementEtiqueta];
        const idEtiqueta = dataEtiqueta['mnt_etiquetas_id'];
        const nombreEtiqueta = dataEtiqueta['mnt_etiquetas_nombre'];
        const iconoEtiqueta = dataEtiqueta['mnt_etiquetas_icono'];
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
          .innerJoin('mnt_modulo.permissionUser', 'mnt_permisos_usuario')
          .innerJoin('mnt_permisos_usuario.user', 'mnt_usuarios')
          .where('mnt_menu.activo is true')
          .andWhere('mnt_menu.visible is true')
          .andWhere('mnt_menu.activo is true')
          .andWhere('mnt_usuarios.id = :idUsuario', {
            idUsuario,
          })
          .andWhere('mnt_menu.id_etiqueta = :idEtiqueta', {
            idEtiqueta,
          })
          .andWhere('mnt_modulo.visible is true')
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
          const repositoryModulo = await this.dataSource
            .getRepository(MntModules)
            .createQueryBuilder('mnt_modulo')
            .select([
              'mnt_modulo.id',
              'mnt_modulo.name',
              'mnt_modulo.visible',
              'mnt_modulo.active',
              'mnt_modulo.icono',
              'mnt_modulo.filename',
              'mnt_modulo.isFather',
              'mnt_modulo.priority',
            ])
            .distinct(true)
            .innerJoin('mnt_modulo.permissionUser', 'mnt_permisos_usuario')
            .innerJoin('mnt_permisos_usuario.user', 'mnt_usuarios')
            .andWhere('mnt_usuarios.id = :idUsuario', {
              idUsuario: idUsuario,
            })
            .andWhere('mnt_modulo.id_menu = :menuId', {
              menuId: idMenu,
            })
            .andWhere('mnt_modulo.visible is true')
            .andWhere('mnt_modulo.active is true')
            .andWhere('mnt_modulo.frontend is true')
            .orderBy('mnt_modulo.priority', 'ASC')
            .getRawMany();
          for (const modulo in repositoryModulo) {
            // const nombreModulo = repositoryModulo[modulo]['mnt_modulo_nombre'];
            // const iconoModulo = repositoryModulo[modulo]['mnt_modulo_icono'];
            const filenameModulo =
              repositoryModulo[modulo]['mnt_modulo_filename'];

            const newItem = {
              name: nombreMenu,
              uri: filenameModulo,
              icon: iconoMenu,
            };
            arrayGeneral.push(newItem);
            array.push(newItem);
          }
        }
        const newArrayOther = {
          name: nombreEtiqueta,
          icon: iconoEtiqueta,
          children: arrayGeneral,
        };
        menu.push(newArrayOther);
      }
      return menu;
    } catch (error) {
      throw new NotFoundException(
        'No se encontráron registros pasando esos parámetros' + error,
        error,
      );
    }
  }

  // todo: delete for production
  async createEtiqueta(data: any) {
    const repo = this.dataSource.getRepository(MntEtiquetas);

    return await repo.save({
      id: uuidv4(),
      createAt: moment().tz('America/El_Salvador').format(),
      ...data,
    });
  }

  // todo: delete for production
  async createMenu(data: any) {
    const repo = this.dataSource.getRepository(MntMenu);

    return await repo.save({
      id: uuidv4(),
      etiqueta: { id: data.idEtiqueta },
      ...data,
      createAt: moment().tz('America/El_Salvador').format(),
    });
  }

  // todo: delete for production
  async createModule(data: any) {
    const repo = this.dataSource.getRepository(MntModules);

    return await repo.save({
      id: uuidv4(),
      menu: { id: data.idMenu },
      padre: { id: data.idPadre },
      ...data,
      createAt: moment().tz('America/El_Salvador').format(),
    });
  }

  async createPermisosModulos(data: any) {
    const repo = this.dataSource.getRepository(MntPermissionModules);

    return await repo.save({
      id: uuidv4(),
      moduleView: { id: data.idVista },
      moduleEndpoint: { id: data.idEndpoint },
    });
  }

  async createPermisosArrayModulos(idVista: string, endpoints: string[]) {
    const repo = this.dataSource.getRepository(MntPermissionModules);

    for (const endpoint of endpoints) {
      await repo.save({
        id: uuidv4(),
        moduleView: { id: idVista },
        moduleEndpoint: { id: endpoint },
      });
    }
  }
}
