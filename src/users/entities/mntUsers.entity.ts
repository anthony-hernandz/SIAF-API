import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn, OneToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { MntTokens } from 'src/auth/entities/MntTokens.entity';
import { MntPermissionsUser } from 'src/auth/entities/MntPermissionsUser.entity';
import { MntRestoreAccount } from './mntRestoreAccount.entity';
import { MntRolUser } from './mntRolUser.entity';
import { CtlEstablecimiento } from 'src/administracion/establecimientos/entities/establecimientos.entity';
import { CtlPaises } from 'src/administracion/catalogs/entities/paises.entity';//se agrega ctlPaises
import { CtlDependencia } from 'src/database/entities/CtlDependencia.entity'

@Entity('mnt_usuarios')
export class MntUsers {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primerNombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segundoNombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tercerNombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  primerApellido: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  segundoApellido: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string;
//agregado nombre de usuario
  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  username: string;

  @Exclude()
  @Column({ type: 'text' })
  password: string; // Encriptado

  @Column({ type: 'boolean', default: true, name: 'activo' })
  active: boolean;

  @Column({ nullable: true, type: 'text' })
  secretKey: string; // Secret key for 2FA

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento: Date;

  @Column({ type: 'varchar', nullable: true })
  n_documento: string;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
  })
  updateAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;

  @ManyToOne(() => MntRolUser, (rol) => rol.users, { nullable: false })
  @JoinColumn({ name: 'id_rol' })
  rol: MntRolUser;

  @ManyToOne(
    () => CtlEstablecimiento,
    (establecimientoUser) => establecimientoUser.user,
  )
  @JoinColumn({ name: 'id_establecimiento' })
  establecimiento: CtlEstablecimiento;

  //Agregando el id_pais
   @ManyToOne(() => CtlPaises)
  @JoinColumn({ name: 'id_pais' }) //  columna que está en la tabla mnt_usuarios
  pais: CtlPaises;


  @OneToMany(() => MntPermissionsUser, (permission) => permission.user)
  permissions: MntPermissionsUser[];

  @OneToMany(() => MntTokens, (tokens) => tokens.user)
  tokens: MntTokens[];

  @OneToMany(() => MntRestoreAccount, (restore) => restore.user)
  restoreAccount: MntRestoreAccount[];
  
  @ManyToOne(() => CtlDependencia)
  @JoinColumn({ name: 'id_dependencia' })
  dependencia: CtlDependencia;

}
