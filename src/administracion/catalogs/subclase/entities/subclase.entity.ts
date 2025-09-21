import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Clase } from '../../clase/entities/clase.entity';

export enum EstadoRegistro {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity({ name: 'mnt_subclase' })
@Unique(['codigo'])
@Unique(['nombre', 'clase'])
export class Subclase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 5 })
  codigo: string;

  @Column({ type: 'varchar', length: 20 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  personal_que_registro: string | null;

  @Column({
    type: 'enum',
    enum: EstadoRegistro,
    default: EstadoRegistro.INACTIVO
  })
  estado: EstadoRegistro;

  @Column({ type: 'boolean', default: true })
  es_nuevo: boolean;

  @Column({ type: 'varchar', length: 300, nullable: true })
  motivo_desactivacion: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Clase, (c) => c.subclases, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'clase_id' })
  clase: Clase;
}
