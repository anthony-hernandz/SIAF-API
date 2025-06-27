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
import { MntUsers } from '@users/entities/mntUsers.entity';
import { MntModules } from '@modules/entities/mntModules.entity';

@Entity('mnt_permisos_usuarios')
export class MntPermissionsUser {
  @PrimaryColumn('text')
  id: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'asignado_especial',
    default: false,
  })
  specialAssignee: boolean;

  @ManyToOne(() => MntModules, (module) => module.permissionUser, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_modulo' })
  module: MntModules;

  @ManyToOne(() => MntUsers, (user) => user.permissions)
  @JoinColumn({ name: 'id_usuario' })
  user: MntUsers;

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
