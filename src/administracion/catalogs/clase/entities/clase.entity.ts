import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Grupo } from '../../grupo/entities/grupo.entity';
import { Subclase } from '../../subclase/entities/subclase.entity';

export enum EstadoRegistro {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity({ name: 'mnt_clase' })
@Unique(['codigo'])
@Unique(['nombre', 'grupo'])
export class Clase {
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
    default: EstadoRegistro.INACTIVO,
  })
  estado: EstadoRegistro;

  @Column({ type: 'boolean', default: true })
  es_nuevo: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_actualizacion: Date;

  @ManyToOne(() => Grupo, (g) => g.clases, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  grupo: Grupo;

  @OneToMany(() => Subclase, (s) => s.clase)
  subclases: Subclase[];

  @Column({ type: 'varchar', length: 300, nullable: true })
  motivo_desactivacion: string | null;
}
