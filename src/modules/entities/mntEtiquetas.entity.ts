import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntMenu } from './MntMenu.entity';

@Entity('mnt_etiquetas')
export class MntEtiquetas {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({ type: 'varchar', length: 50 })
  icono: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  visible: boolean;

  @Column({ type: 'boolean', nullable: true, default: true })
  activo: boolean;

  @Column({ type: 'int4', nullable: true })
  prioridad: boolean;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;

  @OneToMany(() => MntMenu, (menu) => menu.etiqueta)
  etiquetaMenu: MntMenu[];
}
