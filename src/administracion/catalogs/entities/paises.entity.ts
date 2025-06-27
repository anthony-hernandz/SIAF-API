import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('ctl_pais')
export class CtlPaises {
  @PrimaryColumn('int4')
  id: number;

  @Column({ type: 'varchar', nullable: true })
  nombre: string;
}
