import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, Unique, UpdateDateColumn } from "typeorm";

import { MntUsers } from "@users/entities";
import { Exclude } from "class-transformer";
import { MntTipoActivo } from "../../tipo_activos/entities/tipo_activo.entity";

export enum estadoAct{
  Activo = 'Activo',
  Inactivo = 'Inactivo'
}

@Unique(['nombre', 'tipoActivo'])
@Entity('mnt_caracteristicas')
export class MntCaracteristicas {

    @PrimaryColumn('text')
    id: string;

    @Column({type: 'varchar', length: 20, nullable:true})
    nombre: string;
    
    @Column({type: 'boolean', default: true, name: 'activo'})
    active: boolean;

    //Estado del registro: inactivo o activo
    @Column({type:'enum', enum: estadoAct, default:estadoAct.Inactivo})
    estado: estadoAct;
    
    //Justificación al inactivar un registro
    @Column({type: 'text', nullable: true})
    motivo_inactivar: string;
    
    //Verificar si un registro es nuevo (creando la opción eliminar)
    @Column({type: 'boolean', default: true})
    es_nuevo: boolean;

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

    @ManyToOne(() => MntUsers, {eager: true})
    @JoinColumn({name: 'id_registro'})
    registro: MntUsers;

    @ManyToOne(
      () => MntTipoActivo, 
      (tipoActivo) => tipoActivo.caracteristicas, { nullable: false })
    @JoinColumn({ name: 'id_tipoactivo'})
    tipoActivo: MntTipoActivo;
}
   
