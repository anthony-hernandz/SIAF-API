import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Clase } from '../../clase/entities/clase.entity';

export enum EstadoRegistro {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity({ name: 'mnt_grupo' })
@Unique(['nombre'])
@Unique(['codigo'])
export class Grupo {
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

  @OneToMany(() => Clase, (c) => c.grupo)
  clases: Clase[];

}