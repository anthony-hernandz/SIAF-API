import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ActivarEstadoFisicoActivoDto, CreateEstadoFisicoActivoDto, DesactivarEstadoFisicoActivoDto, UpdateEstadoFisicoActivoDto } from './dto/estado_fisico_activo.dto';
import { estadoAct, MntEstadoFisicoActivo } from './entities/estado_fisico_activo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UsersService } from '@users/services/users.service';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { IEstadoFisicoActivo, IEstadoFisicoActivoPaginatedResponse } from './estado_ficico_activo.interface';
import { paginationEstadoFisicoActivoDto } from './dto/estado_fisico_activo-pagination.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class EstadoFisicoActivoService {
  constructor(
      @InjectRepository(MntEstadoFisicoActivo)
      private readonly estadoFisicoActivoRepository: Repository< MntEstadoFisicoActivo>,
      @Inject (forwardRef(()=> UsersService))
      private readonly usersService: UsersService,
    ){}

  private transformInterface(estadoFisicoActivo: MntEstadoFisicoActivo): IEstadoFisicoActivo{
      return{
        id: estadoFisicoActivo.id,
        nombre: estadoFisicoActivo.nombre,
        //Especificación del dato que se requiere del usuario (nombre y apellido)
        registro: `${estadoFisicoActivo.registro?.primerNombre ?? ''} ${estadoFisicoActivo.registro?.primerApellido ?? ''}`.trim(),
        estado: estadoFisicoActivo.estado,
        motivo_inactivar: estadoFisicoActivo.motivo_inactivar,
        es_nuevo: estadoFisicoActivo.es_nuevo,
      
       };
      }

  async findAll(params: paginationEstadoFisicoActivoDto): Promise<IEstadoFisicoActivoPaginatedResponse> {
    const {per_page, page, paginate, directionOrder, nombre} = params;
      
    const findOptions: FindManyOptions<MntEstadoFisicoActivo> = {};
    const where: FindOptionsWhere<MntEstadoFisicoActivo> = {};
      
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
      
    const [estadoFisicoActivo, count] = await this.estadoFisicoActivoRepository.findAndCount(findOptions);
      
    const resultado: IEstadoFisicoActivo[] = estadoFisicoActivo.map(estadoFisicoActivo => this.transformInterface(estadoFisicoActivo));
      
    return {
      estadoFisicoActivo: resultado,
      pagination: {
        limit: paginate ? per_page : count,
        offset: paginate ? (page || 1) : 1,
        total: count,
      },
      };
    }

  async findOne(id: string): Promise<IEstadoFisicoActivo> {
    const estadoFisicoActivo = await this.estadoFisicoActivoRepository.findOne({ 
      where: { id },
      relations: {registro: true }
    });
        
    if (!estadoFisicoActivo) {
      throw new NotFoundException('Estado fisico de activo not found')
    }
    return this.transformInterface(estadoFisicoActivo);
  }

  async create(createEstadoFisicoActivoDto: CreateEstadoFisicoActivoDto, userId: string): Promise<IEstadoFisicoActivo> {
    const {nombre} = createEstadoFisicoActivoDto;
    
      if (await this.estadoFisicoActivoRepository.findOne({
          where: {nombre}, 
      })){
        throw new BadRequestException('Estado fisico de activo already exists');
      }
    
      const usuario = await this.usersService.findOne(userId);
    
      const estadoFisicoActivo = this.estadoFisicoActivoRepository.create({
        id: uuidv4(),
        nombre,
        registro: usuario,
        estado: estadoAct.Inactivo, //el registro siempre iniciará como 'inactivo'
        motivo_inactivar: null,
        es_nuevo: true,
        createAt: moment().tz('America/El_Salvador').format(),
      });
    
      const savedEstadoFisicoActivo = await this.estadoFisicoActivoRepository.save(estadoFisicoActivo);
        
      //Busca relación para ejecutar transformInterface
        const estadoFisicoActivoRelation = await this.estadoFisicoActivoRepository.findOne({
          where: {id: savedEstadoFisicoActivo.id},
          relations: { registro: true }
        })
    
      return this.transformInterface(estadoFisicoActivoRelation);
      }

  async update(id: string, updateEstadoFisicoActivoDto: UpdateEstadoFisicoActivoDto, userId?: string): Promise<IEstadoFisicoActivo> {
      const { nombre} = updateEstadoFisicoActivoDto;
    
        if (await this.estadoFisicoActivoRepository.findOne({where: {nombre}})){
          throw new BadRequestException('Estado Fisico de Activo already exists');
        }
    
      const estadoFisicoActivo = await this.estadoFisicoActivoRepository.preload({
        id,
        nombre,
        updateAt: moment().tz('America/El_Salvador').format(),
      });
    
        if(!estadoFisicoActivo){
          throw new NotFoundException('Estado Fisico de Activo not found')
        }
        
      await this.estadoFisicoActivoRepository.save(estadoFisicoActivo);
    
      //Busca relación para ejecurtar transformInterface
      const estadoFisicoActivoRelation = await this.estadoFisicoActivoRepository.findOne({
        where: {id},
        relations: { registro: true }
      })
      return this.transformInterface(estadoFisicoActivoRelation);
    }

    async activar(id: string, activarEstadoFisicoActivoDto: ActivarEstadoFisicoActivoDto, userId?: string): Promise<IEstadoFisicoActivo> {
      if(!activarEstadoFisicoActivoDto.confirmar){
        throw new BadRequestException('Debe confirmar la activación del Estado Fisico de activo');
      }
      
      const estadoFisicoActivo = await this.estadoFisicoActivoRepository.findOne({
        where: {id},
        relations: { registro: true}
      });
      
      if(!estadoFisicoActivo){
          throw new NotFoundException('Estado Fisico de Activo not found')
        }
      
      if(estadoFisicoActivo.estado === estadoAct.Activo) {
        throw new BadRequestException('El Estado Fisico de Activo ya esta activado');
      }
      
      const usuario = await this.usersService.findOne(userId);
          
      estadoFisicoActivo.registro = usuario;
      estadoFisicoActivo.estado = estadoAct.Activo;
      estadoFisicoActivo.es_nuevo = false; //Una vez activado, no es nuevo
      estadoFisicoActivo.motivo_inactivar = null; //Eliminar justificacion anterior
      
      await this.estadoFisicoActivoRepository.save(estadoFisicoActivo);
      return this.transformInterface(estadoFisicoActivo);
      }

  async desactivar(id: string, desactivarEstadoFisicoActivoDto: DesactivarEstadoFisicoActivoDto, userId?: string): Promise<IEstadoFisicoActivo> {
        
      const estadoFisicoActivo = await this.estadoFisicoActivoRepository.findOne({
        where: {id},
        relations: { registro: true}
      });
    
      if(!estadoFisicoActivo){
          throw new NotFoundException('Estado Fisico de Activo not found')
        }

      if(!estadoFisicoActivo.es_nuevo){
        throw new BadRequestException('No se puede eliminar el registro que ya no es nuevo');
      }
    
      if(estadoFisicoActivo.estado === estadoAct.Inactivo) {
        throw new BadRequestException('El Estado Fisico de Activo ya esta desactivado');
      }
    
      const usuario = await this.usersService.findOne(userId);
        
      estadoFisicoActivo.registro = usuario;
      estadoFisicoActivo.estado = estadoAct.Inactivo;
      estadoFisicoActivo.motivo_inactivar = desactivarEstadoFisicoActivoDto.justificacion;
    
      await this.estadoFisicoActivoRepository.save(estadoFisicoActivo);
      return this.transformInterface(estadoFisicoActivo);
    }

  async delete (id: string): Promise<void> {
    const estadoFisicoActivo = await this.estadoFisicoActivoRepository.findOne({
      where:{id}
    });

    if(!estadoFisicoActivo){
        throw new NotFoundException('Estado Fisico de Activo not found')
      }
    
    if (!estadoFisicoActivo.es_nuevo) {
      throw new BadRequestException('No se puede eliminar un Estado Fisico de Activo que ya no es nuevo')
    }

    if(estadoFisicoActivo.estado === estadoAct.Activo) {
      throw new BadRequestException('No se puede eliminar un Estado Fisico de Activo "activado"');
    }

    await this.estadoFisicoActivoRepository.softDelete(id);
  }
}
