import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EstadoEnum {
  ACTIVO = 'activo',
  INACTIVO = 'inactivo',
}

@Entity({ name: 'tipofinanciamiento' })
export class Tipofinanciamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'tipo_de_financiamiento',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  nombre: string;

  @Column({
    name: 'personal_que_registro',
    type: 'varchar',
    length: 255,
  })
  personal_que_registro: string;

  @Column({
    name: 'estado',
    type: 'enum',
    enum: EstadoEnum,
    default: EstadoEnum.INACTIVO,
  })
  estado: EstadoEnum;

  @Column({
    name: 'es_nuevo',
    type: 'boolean',
    default: true,
  })
  esNuevo: boolean;

  @CreateDateColumn({
    name: 'fecha_creacion',
    type: 'timestamptz',
  })
  fechaCreacion: Date;

  @UpdateDateColumn({
    name: 'fecha_actualizacion',
    type: 'timestamptz',
  })
  fechaActualizacion: Date;

  @Column({
    name: 'fecha_activacion',
    type: 'timestamptz',
    nullable: true,
  })
  fechaActivacion: Date | null;

  @Column({
    name: 'fecha_desactivacion',
    type: 'timestamptz',
    nullable: true,
  })
  fechaDesactivacion: Date | null;

  @Column({
    name: 'motivo_desactivacion',
    type: 'text',
    nullable: true,
  })
  motivoDesactivacion?: string | null;
}
