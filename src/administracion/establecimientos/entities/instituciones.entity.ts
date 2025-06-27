import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { CtlEstablecimiento } from './establecimientos.entity';

@Entity('ctl_institucion')
export class CtlInstituciones {
  @PrimaryColumn('int4')
  id: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;
  @OneToMany(
    () => CtlEstablecimiento,
    (establecimiento) => establecimiento.institucion,
  )
  establecimientos: CtlEstablecimiento[];
}
