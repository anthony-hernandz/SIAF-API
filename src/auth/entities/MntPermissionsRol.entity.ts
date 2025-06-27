import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntRolUser } from '@users/entities';
import { MntModules } from '@modules/entities/mntModules.entity';

@Entity('mnt_permisos_roles')
export class MntPermissionsRol {
  @PrimaryColumn('text')
  id: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'asignado_especial',
    default: false,
  })
  specialAssignee: boolean;

  @ManyToOne(() => MntModules, (module) => module.permissionRol, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_modulo' })
  module: MntModules;

  @ManyToOne(() => MntRolUser, (rol) => rol.permissions, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_rol' })
  rol: MntRolUser;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createAt: string;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
  })
  updateAt: string;
}
