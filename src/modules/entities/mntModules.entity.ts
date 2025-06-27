import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntPermissionsRol } from '@auth/entities/MntPermissionsRol.entity';
import { MntPermissionsUser } from '@auth/entities/MntPermissionsUser.entity';
import { MntMenu } from '@modules/entities/MntMenu.entity';

@Entity('mnt_modulos')
export class MntModules {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'nombre' })
  name: string;

  @Column({ type: 'text', nullable: true, name: 'descripcion' })
  description: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  visible: boolean;

  @Column({ type: 'boolean', nullable: true, default: true, name: 'activo' })
  active: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icono: string;

  @Column({ type: 'varchar', length: 150 })
  filename: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  method: string;

  @Column({ type: 'boolean', nullable: true, name: 'is_father' })
  isFather: boolean;

  @Column({ type: 'int4', nullable: true, name: 'prioridad' })
  priority: number;

  @Column({ type: 'boolean', nullable: true, default: false })
  frontend: boolean;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updateAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;

  @OneToMany(() => MntModules, (module) => module.padre, { nullable: true })
  hijos: MntModules[];

  @ManyToOne(() => MntModules, (modulo) => modulo.hijos, { nullable: true })
  @JoinColumn({ name: 'id_padre' })
  padre: MntModules;

  @OneToMany(() => MntPermissionsRol, (permissionRol) => permissionRol.module)
  permissionRol: MntPermissionsRol[];

  @OneToMany(
    () => MntPermissionsUser,
    (permissionUser) => permissionUser.module,
  )
  permissionUser: MntPermissionsUser[];

  @ManyToOne(() => MntMenu, (menu) => menu.modulos)
  @JoinColumn({ name: 'id_menu' })
  menu: MntMenu;
}
