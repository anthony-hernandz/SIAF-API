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

import { CreateTipoActivoDto, UpdateTipoActivoDto } from './dto/tipo_activo.dto';
import { MntTipoActivo } from './entities/tipo_activo.entity';
import { paginationTipoAcDTO } from './dto/tipoactivo-pagination';
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
    };

    findOptions.where = where;

    const [tipoactivo, count] = await this.tipoActivoRepository.findAndCount(findOptions);

    const resultado: ITipoActivo[] = tipoactivo.map(t => ({
      id: t.id,
      nombre: t.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${t.registro?.primerApellido ?? ''} ${t.registro?.primerApellido ?? ''}`.trim(),
      active: t.active,
    }));

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

    return {
      id: tipoactivo.id,
      nombre: tipoactivo.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${tipoactivo.registro?.primerNombre ?? ''} ${tipoactivo.registro?.primerApellido ?? ''}`.trim(),
      active: tipoactivo.active,
    };
   
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
      createAt: moment().tz('America/El_Salvador').format(),
    });

    const savedTipoActivo = await this.tipoActivoRepository.save(tipoactivo);
    
    return {
      id: savedTipoActivo.id,
      nombre: savedTipoActivo.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${usuario.primerNombre} ${usuario.primerApellido}`.trim(),
      active: savedTipoActivo.active,
    };
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
        //registro: user,
        updateAt: moment().tz('America/El_Salvador').format(),
      });

      if(!tipoactivo){
        throw new NotFoundException('Tipo de activo not found')
      }
    
      const updateTipoActivo = await this.tipoActivoRepository.save(tipoactivo);

      //Busca relación
      const tipoActivoRelation = await this.tipoActivoRepository.findOne({
        where: {id},
        relations: { registro: true }
      })
      return {
      id: updateTipoActivo.id,
      nombre: updateTipoActivo.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${tipoActivoRelation.registro?.primerNombre ?? ''} ${tipoActivoRelation.registro?.primerApellido ?? ''}`.trim(),
      active: updateTipoActivo.active,
    };
  }

  //Eliminación del Tipo de activo
  async delete (id: string): Promise<void> {
    await this.findOne(id);
    await this.tipoActivoRepository.softDelete(id);
  }
}
