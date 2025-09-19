import { 
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions, 
  FindOptionsWhere, 
  ILike, 
  Repository 
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment-timezone';

import { ActivarTipoActivoDto, CreateTipoActivoDto, DesactivarTipoActivoDto, UpdateTipoActivoDto } from './dto/tipo_activo.dto';
import { estadoAct, MntTipoActivo } from './entities/tipo_activo.entity';
import { paginationTipoAcDTO } from './dto/tipoactivo-pagination.dto';
import { UsersService } from '@users/services/users.service';
import { ITipoActivo, ITipoActivoPaginatedResponse } from './tipo-activo.interface';

@Injectable()
export class TipoActivoService {
  constructor(
    @InjectRepository(MntTipoActivo)
    private readonly tipoActivoRepository: Repository<MntTipoActivo>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) {}

  //Refactorización
  private transformInterface(tipoActivo: MntTipoActivo): ITipoActivo{
    return{
      id: tipoActivo.id,
      nombre: tipoActivo.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${tipoActivo.registro?.primerNombre ?? ''} ${tipoActivo.registro?.primerApellido ?? ''}`.trim(),
      estado: tipoActivo.estado,
      motivo_inactivar: tipoActivo.motivo_inactivar,
      es_nuevo: tipoActivo.es_nuevo,

    };
  }

   async findAll(params: paginationTipoAcDTO): Promise<ITipoActivoPaginatedResponse> {
    const {per_page, page, paginate, directionOrder, nombre} = params;

    const findOptions: FindManyOptions<MntTipoActivo> = {};
    const where: FindOptionsWhere<MntTipoActivo> = {};

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

    const [tipoactivo, count] = await this.tipoActivoRepository.findAndCount(findOptions);

    const resultado: ITipoActivo[] = tipoactivo.map(tipoactivo => this.transformInterface(tipoactivo));

    return {
      tipoactivo: resultado,
      pagination: {
        limit: paginate ? per_page : count,
        offset: paginate ? (page || 1) : 1,
        total: count,
      },
    };
  }


  async findOne(id: string): Promise<ITipoActivo> {
    const tipoactivo = await this.tipoActivoRepository.findOne({ 
      where: { id },
      relations: {registro: true }
    });

    if (!tipoactivo) {
      throw new NotFoundException('Tipo de activo not found')
    }
    return this.transformInterface(tipoactivo);
  }

  //Creación del Tipo de Activo
  async create(createTipoActivoDto: CreateTipoActivoDto, userId: string): Promise<ITipoActivo> {
    const {nombre} = createTipoActivoDto;

    if (await this.tipoActivoRepository.findOne({
      where: {nombre}, 
    })){
      throw new BadRequestException('Tipo de activo already exists');
    }

    const usuario = await this.usersService.findOne(userId);

    const tipoactivo = this.tipoActivoRepository.create({
      id: uuidv4(),
      nombre,
      registro: usuario,
      estado: estadoAct.Inactivo, //el registro siempre iniciara como 'inactivo'
      motivo_inactivar: null,
      es_nuevo: true,
      createAt: moment().tz('America/El_Salvador').format(),
    });

    const savedTipoActivo = await this.tipoActivoRepository.save(tipoactivo);
    
    //Busca relación para ejecurtar transformInterface
      const tipoActivoRelation = await this.tipoActivoRepository.findOne({
        where: {id: savedTipoActivo.id},
        relations: { registro: true }
      })

    return this.transformInterface(tipoActivoRelation);
  }

  //Actualización de datos del Tipo de Activo
  async update(id: string, updateTipoActivoDto: UpdateTipoActivoDto, userId?: string): Promise<ITipoActivo> {
    const { nombre} = updateTipoActivoDto;

      if (await this.tipoActivoRepository.findOne({where: {nombre}})){
        throw new BadRequestException('Tipo de activo already exists');
      }

      const tipoactivo = await this.tipoActivoRepository.preload({
        id,
        nombre,
        updateAt: moment().tz('America/El_Salvador').format(),
      });

      if(!tipoactivo){
        throw new NotFoundException('Tipo de activo not found')
      }
    
      await this.tipoActivoRepository.save(tipoactivo);

      //Busca relación para ejecurtar transformInterface
      const tipoActivoRelation = await this.tipoActivoRepository.findOne({
        where: {id},
        relations: { registro: true }
      })
      return this.transformInterface(tipoActivoRelation);
  }


  //activar un registro
  async activar(id: string, activarTipoActivoDto: ActivarTipoActivoDto, userId?: string): Promise<ITipoActivo> {
    if(!activarTipoActivoDto.confirmar){
      throw new BadRequestException('Debe confirmar la activación del tipo de activo');
    }

    const tipoactivo = await this.tipoActivoRepository.findOne({
      where: {id},
      relations: { registro: true}
    });

    if(!tipoactivo){
        throw new NotFoundException('Tipo de activo not found')
      }

    if(tipoactivo.estado === estadoAct.Activo) {
      throw new BadRequestException('El tipo de activo ya esta activado');
    }


    tipoactivo.estado = estadoAct.Activo;
    tipoactivo.es_nuevo = false; //Una vez activado, no es nuevo
    tipoactivo.motivo_inactivar = null; //Eliminar justificacion anterior

    await this.tipoActivoRepository.save(tipoactivo);
    return this.transformInterface(tipoactivo);
  }

  //desactivar un registro
   async desactivar(id: string, desactivarTipoActivoDto: DesactivarTipoActivoDto, userId?: string): Promise<ITipoActivo> {
    
    const tipoactivo = await this.tipoActivoRepository.findOne({
      where: {id},
      relations: { registro: true}
    });

    if(!tipoactivo){
        throw new NotFoundException('Tipo de activo not found')
      }
      
    if(tipoactivo.estado === estadoAct.Inactivo) {
      throw new BadRequestException('El tipo de activo ya esta desactivado');
    }

    tipoactivo.estado = estadoAct.Inactivo;
    tipoactivo.motivo_inactivar = desactivarTipoActivoDto.justificacion;

    await this.tipoActivoRepository.save(tipoactivo);
    return this.transformInterface(tipoactivo);
  }


  //Eliminación del Tipo de activo
  async delete (id: string): Promise<void> {
    const tipoactivo = await this.tipoActivoRepository.findOne({
      where:{id}
    });

    if(!tipoactivo){
        throw new NotFoundException('Tipo de activo not found')
      }
    
    if (!tipoactivo.es_nuevo) {
      throw new BadRequestException('No se puede eliminar un Tipo de Activo que ha sido activado')
    }

    if(tipoactivo.estado === estadoAct.Activo) {
      throw new BadRequestException('No se puede eliminar un Tipo de Activo "activado"');
    }

    await this.tipoActivoRepository.softDelete(id);
  }
}
