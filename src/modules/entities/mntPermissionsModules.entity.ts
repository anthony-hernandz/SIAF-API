import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MntModules } from './mntModules.entity';

@Entity('mnt_permisos_modulos')
export class MntPermissionModules {
  @PrimaryColumn('text')
  id: string;

  @ManyToOne(() => MntModules, { nullable: false })
  @JoinColumn({ name: 'id_modulo_visa' })
  moduleView: MntModules;

  @ManyToOne(() => MntModules, { nullable: false })
  @JoinColumn({ name: 'id_modulo_endpoint' })
  moduleEndpoint: MntModules;
}
