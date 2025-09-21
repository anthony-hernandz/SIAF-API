import { MntUsers } from "@users/entities";
import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";

export enum estadoAct{
  Activo = 'Activo',
  Inactivo = 'Inactivo'
}

@Entity ('mnt_ambientes')
export class MntAmbiente {

    @PrimaryColumn('text')
    id:string;
        
    @Column({type: 'varchar', length: 20, unique: true, nullable:true})
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
        
    @ManyToOne(() => MntUsers, {eager: true, nullable: true})
    @JoinColumn({name: 'id_registro'})
    registro: MntUsers;

}
