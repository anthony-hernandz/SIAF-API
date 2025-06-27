import { MntUsers } from 'src/users/entities';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { CtlInstituciones } from './instituciones.entity';

@Entity('ctl_establecimiento')
export class CtlEstablecimiento {
  @PrimaryColumn('int4')
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  @Column({ type: 'int4', name: 'id_tipo_establecimiento' })
  tipo_establecimiento: number;

  @ManyToOne(
    () => CtlEstablecimiento,
    (establecimiento) => establecimiento.establecimiento_hijo,
  )
  @JoinColumn({ name: 'id_establecimiento_padre' })
  establecimiento_padre: CtlEstablecimiento;

  @OneToMany(
    () => CtlEstablecimiento,
    (establecimiento) => establecimiento.establecimiento_padre,
  )
  establecimiento_hijo: CtlEstablecimiento[];

  @OneToMany(() => MntUsers, (user) => user.establecimiento)
  user: MntUsers[];

  @ManyToOne(
    () => CtlInstituciones,
    (institucion) => institucion.establecimientos,
  )
  @JoinColumn({ name: 'id_institucion' })
  institucion: CtlInstituciones;
}
