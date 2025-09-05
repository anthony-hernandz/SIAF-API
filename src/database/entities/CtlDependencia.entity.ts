import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { MntUsers } from 'src/users/entities/mntUsers.entity';

@Entity('ctl_dependencia')
export class CtlDependencia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ default: true })
  habilitado: boolean;

  @Column()
  id_usuario_reg: number;

  @Column()
  fecha_hora_reg: Date;

  @Column({ nullable: true })
  id_usuario_mod: number;

  @Column({ nullable: true })
  fecha_hora_mod: Date;

  @OneToMany(() => MntUsers, usuario => usuario.dependencia)
usuarios: MntUsers[];
}