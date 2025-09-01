
import { 
    Column, 
    CreateDateColumn, 
    DeleteDateColumn,
    UpdateDateColumn,
    Entity, 
    JoinColumn, 
    ManyToOne, 
    PrimaryColumn,
    OneToMany
} from "typeorm";
import { Exclude } from "class-transformer";
import { MntUsers } from "@users/entities";
//import { MntCaracteristicas } from "../../caracteristicas/entities/caracteristica.entity";

@Entity('mnt_tipo_activo')
export class MntTipoActivo {

    @PrimaryColumn('text')
    id:string;

    @Column({type: 'varchar', length: 20, unique: true, nullable:true})
    nombre: string;

    @Column({type: 'boolean', default: true, name: 'activo'})
    active: boolean;

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

    // @ManyToOne(() => MntCaracteristicas, (caracteristica) => caracteristica.tiposActivo)
    // @JoinColumn({name: 'id_caracteristica'})
    // caracteristica: MntCaracteristicas;
}
