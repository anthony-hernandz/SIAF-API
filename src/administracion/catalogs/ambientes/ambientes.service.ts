import { 
  BadRequestException,
  forwardRef, 
  Inject, 
  Injectable, 
  NotFoundException
} from '@nestjs/common';
import { 
  ActivarAmbienteDto,
  CreateAmbienteDto, 
  DesactivarAmbienteDto, 
  UpdateAmbienteDto 
} from './dto/ambiente.dto';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoAct, MntAmbiente } from './entities/ambiente.entity';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { UsersService } from '@users/services/users.service';
import { IAmbientesPaginatedResponse, IAmbientesResponse } from './ambientes.interface';
import { paginationAmbienteDTO } from './dto/ambiente-pagination.dto';

@Injectable()
export class AmbientesService {
  constructor(
    @InjectRepository(MntAmbiente)
    private readonly ambienteRepository: Repository <MntAmbiente>,
    @Inject (forwardRef (()=> UsersService))
    private readonly usersService: UsersService,
  ){}

  private transformInterface(ambiente: MntAmbiente): IAmbientesResponse{
      return{
        id: ambiente.id,
        nombre: ambiente.nombre,
        //Especificación del dato que se requiere del usuario (nombre y apellido)
        registro: `${ambiente.registro?.primerNombre ?? ''} ${ambiente.registro?.primerApellido ?? ''}`.trim(),
        estado: ambiente.estado,
        motivo_inactivar: ambiente.motivo_inactivar,
        es_nuevo: ambiente.es_nuevo,
    
      };
    }

  async findAll(params: paginationAmbienteDTO): Promise<IAmbientesPaginatedResponse> {
    const {per_page, page, paginate, directionOrder, nombre} = params;
      
    const findOptions: FindManyOptions<MntAmbiente> = {};
    const where: FindOptionsWhere<MntAmbiente> = {};
      
      //Busqueda por nombre
      if (nombre && nombre.length >= 3) {
        where.nombre = ILike(`%${nombre}%`);
      }
      
      if (paginate) {
        findOptions.take = per_page;
        findOptions.skip = per_page * (page - 1);
      }
      
      if (directionOrder) findOptions.order = { nombre: directionOrder };
      
      findOptions.relations = { 
          registro: true 
      };
      
      findOptions.select = {
        id: true,
        nombre: true,
        registro: { primerNombre: true, primerApellido: true },
        active: true,
        estado: true,
        motivo_inactivar: true,
        es_nuevo: true,
      };
      
      findOptions.where = where;
      
      const [ambiente, count] = await this.ambienteRepository.findAndCount(findOptions);
      
      const resultado: IAmbientesResponse[] = ambiente.map(ambiente => this.transformInterface(ambiente));
      
      return {
        ambiente: resultado,
        pagination: {
          limit: paginate ? per_page : count,
          offset: paginate ? (page || 1) : 1,
          total: count,
        },
        };
      } 


  async findOne(id: string): Promise<IAmbientesResponse> {
    const ambiente = await this.ambienteRepository.findOne({ 
      where: { id },
      relations: {registro: true }
    });
          
    if (!ambiente) {
      throw new NotFoundException('Ambiente not found')
    }
    return this.transformInterface(ambiente);
  }

  async create(createAmbienteDto: CreateAmbienteDto, userId: string): Promise<IAmbientesResponse> {
    const {nombre} = createAmbienteDto;

    if (await this.ambienteRepository.findOne({
      where: {nombre}, 
    })){
      throw new BadRequestException('Ambiente already exists');
    }
      
    const usuario = await this.usersService.findOne(userId);
      
    const ambiente = this.ambienteRepository.create({
      id: uuidv4(),
      nombre,
      registro: usuario,
      estado: estadoAct.Inactivo, //el registro siempre iniciara como 'inactivo'
      motivo_inactivar: null,
      es_nuevo: true,
      createAt: moment().tz('America/El_Salvador').format(),
    });

    const savedAmbiente = await this.ambienteRepository.save(ambiente);
      
    //Busca relación para ejecurtar transformInterface
    const ambienteRelation = await this.ambienteRepository.findOne({
      where: {id: savedAmbiente.id},
      relations: { registro: true }
    })
  
    return this.transformInterface(ambienteRelation);
  }

  async update(id: string, updateAmbienteDto: UpdateAmbienteDto, userId?: string): Promise<IAmbientesResponse> {
    const {nombre} = updateAmbienteDto;
      
      if (await this.ambienteRepository.findOne({where: {nombre}})){
        throw new BadRequestException('Ambiente already exists');
      }
      
      const ambiente = await this.ambienteRepository.preload({
        id,
        nombre,
        updateAt: moment().tz('America/El_Salvador').format(),
      });
      
      if(!ambiente){
        throw new NotFoundException('Ambiente not found')
      }
          
      await this.ambienteRepository.save(ambiente);
      
      //Busca relación para ejecurtar transformInterface
      const ambienteRelation = await this.ambienteRepository.findOne({
        where: {id},
        relations: { registro: true }
      })
      return this.transformInterface(ambienteRelation);
  }

  async activar(id: string, activarDto: ActivarAmbienteDto, userId?: string): Promise<IAmbientesResponse> {
    if(!activarDto.confirmar){
      throw new BadRequestException('Debe confirmar la activación del Ambiente');
    }
    
    const ambiente = await this.ambienteRepository.findOne({
      where: {id},
      relations: { registro: true}
    });
    
    if(!ambiente){
        throw new NotFoundException('Ambiente not found')
      }
    
    if(ambiente.estado === estadoAct.Activo) {
      throw new BadRequestException('El Ambiente ya esta activada');
    }
    
    const usuario = await this.usersService.findOne(userId);
        
    ambiente.registro = usuario;
    ambiente.estado = estadoAct.Activo;
    ambiente.es_nuevo = false;
    ambiente.motivo_inactivar = null;
    
    await this.ambienteRepository.save(ambiente);
    return this.transformInterface(ambiente);
    }

    async desactivar(id: string, desactivarmbienteDto: DesactivarAmbienteDto, userId?: string): Promise<IAmbientesResponse> {
          
      const ambiente = await this.ambienteRepository.findOne({
        where: {id},
        relations: { registro: true}
      });
      
      if(!ambiente){
          throw new NotFoundException('Ambiente not found')
        }
      
      if(ambiente.estado === estadoAct.Inactivo) {
        throw new BadRequestException('El ambiente ya esta desactivado');
      }
      
      const usuario = await this.usersService.findOne(userId);
          
      ambiente.registro = usuario;
      ambiente.estado = estadoAct.Inactivo;
      ambiente.motivo_inactivar = desactivarmbienteDto.justificacion;
      
      await this.ambienteRepository.save(ambiente);
      return this.transformInterface(ambiente);
    }

  async delete(id: string): Promise <void>{
    const ambiente = await this.ambienteRepository.findOne({
          where:{id}
        });
    
        if(!ambiente){
            throw new NotFoundException('Ambiente not found')
          }
        
        if (!ambiente.es_nuevo) {
            throw new BadRequestException('No se puede eliminar el registro que ya no es nuevo');
        }
    
        if(ambiente.estado === estadoAct.Activo) {
          throw new BadRequestException('No se puede eliminar un Ambiente "activada"');
        }
    
        await this.ambienteRepository.softDelete(id);
      }
  }

