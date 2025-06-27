import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntModules } from './mntModules.entity';
import { MntEtiquetas } from './mntEtiquetas.entity';

@Entity('mnt_menu')
export class MntMenu {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', nullable: true })
  visible: boolean;

  @Column({ type: 'boolean', nullable: true })
  activo: boolean;

  @Column({ type: 'varchar', length: 100 })
  icono: string;

  @Column({ type: 'varchar', length: 150 })
  filename: string;

  @Column({ type: 'boolean', nullable: true })
  admin: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'super_admin' })
  superAdmin: boolean;

  @Column({ type: 'int4' })
  prioridad: number;

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

  @ManyToOne(() => MntEtiquetas, (menu) => menu.etiquetaMenu)
  @JoinColumn({ name: 'id_etiqueta' })
  etiqueta: MntEtiquetas;

  @OneToMany(() => MntModules, (modulos) => modulos.menu)
  modulos: MntModules[];
}
