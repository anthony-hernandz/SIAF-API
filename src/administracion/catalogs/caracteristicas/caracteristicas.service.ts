import { 
  BadRequestException, 
  forwardRef, 
  Inject, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { 
  FindManyOptions, 
  FindOptionsWhere, 
  ILike, 
  Repository 
} from 'typeorm';
import { 
  ActivarCaracteristicaDto, 
  CreateCaracteristicaDto, 
  DesactivarCaracteristicaDto, 
  UpdateCaracteristicaDto 
} from './dto/caracteristica.dto';

import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment-timezone';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoAct, MntCaracteristicas } from './entities/caracteristica.entity';
import { paginationCaracteristicaDTO } from './dto/caracteristica-pagination.dto';
import { MntTipoActivo } from '../tipo_activos/entities/tipo_activo.entity';
import { ICaracteristicasResponse, ICaracteristicasPaginatedResponse } from './caracteristica.interface';
import { UsersService } from '@users/services/users.service';

@Injectable()
export class CaracteristicasService {

  constructor(
    @InjectRepository(MntCaracteristicas)
    private readonly caracteristicaRepository: Repository<MntCaracteristicas>,
    @InjectRepository(MntTipoActivo)
    private readonly tipoActivoRepository: Repository<MntTipoActivo>,
    @Inject (forwardRef (()=> UsersService))
    private readonly userServices: UsersService,
  ){}

  //Evitar repeticion
  private transformInterface(caracteristica: MntCaracteristicas): ICaracteristicasResponse{
    return{
      id: caracteristica.id,
      nombre: caracteristica.nombre,
      tipoActivo: {
        id: caracteristica.tipoActivo?.id,
        nombre: caracteristica.tipoActivo?.nombre,
      },
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${caracteristica.registro?.primerNombre ?? ''} ${caracteristica.registro?.primerApellido ?? ''}`.trim(),
      estado: caracteristica.estado,
      motivo_inactivar: caracteristica.motivo_inactivar,
      es_nuevo: caracteristica.es_nuevo,

    };
  }

  async findAll(params: paginationCaracteristicaDTO): Promise<ICaracteristicasPaginatedResponse> {
    const {per_page, page, paginate, directionOrder, nombre} = params;
    
    const findOptions: FindManyOptions<MntCaracteristicas> = {};
        const where: FindOptionsWhere<MntCaracteristicas> = {};
    
        if (nombre && nombre.length >= 3) {
          where.nombre = ILike(`%${nombre}%`);
        }
    
        if (paginate) {
          findOptions.take = per_page;
          findOptions.skip = per_page * (page - 1);
        }
    
        if (directionOrder) findOptions.order = { nombre: directionOrder };
    
        findOptions.relations = { 
          registro: true, 
          tipoActivo: true,
        };

        findOptions.select = {
          id: true,
          nombre: true,
          tipoActivo: {id: true, nombre: true},
          registro: { primerNombre: true, primerApellido: true },
          active: true,
          estado: true,
          motivo_inactivar: true,
          es_nuevo: true,
         };

    findOptions.where = where;

    const [caracteristicas, count] = await this.caracteristicaRepository.findAndCount(findOptions);

    const resultado: ICaracteristicasResponse[] = caracteristicas.map (caracteristicas => this.transformInterface(caracteristicas));

    return {
      caracteristicas: resultado,
      pagination: {
        limit: paginate ? per_page : count,
        offset: paginate ? (page || 1) : 1,
        total: count,
      },
    };
  }

  async findOne(id: string):  Promise<ICaracteristicasResponse> {
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: {id},
      relations: {registro: true, tipoActivo: true}
    });

    if(!caracteristica){
      throw new NotFoundException('Caracteristica not found')
    }

    return this.transformInterface(caracteristica);
  }

 //Crear caracteristica
  async create(createCaracteristicaDto: CreateCaracteristicaDto, userId: string): Promise<ICaracteristicasResponse> {
    const {nombre, tipoActivoId} = createCaracteristicaDto;

    const existeCaracteristica = await this.caracteristicaRepository.findOne({
      where: {
        nombre,
        tipoActivo: {id: tipoActivoId}
      }
    });

    if (existeCaracteristica) {
      throw new BadRequestException('Ya existe una Característica con ese nombre para este Tipo de Activo');
    }

    const tipoActivo = await this.tipoActivoRepository.findOne({
      where: {id: tipoActivoId}
    });

    if (!tipoActivo) {
      throw new BadRequestException('Tipo de Activo seleccionado no existe');
    }

    if (tipoActivo.estado !== estadoAct.Activo) {
      throw new BadRequestException ('El Tipo de Activo seleccionado no ha sido activado')
    }

    const usuario = await this.userServices.findOne(userId);

    const caracteristica = this.caracteristicaRepository.create({
      id: uuidv4(),
      nombre,
      tipoActivo,
      registro: usuario,
      estado: estadoAct.Inactivo,
      motivo_inactivar: null,
      es_nuevo: true,
      createAt: moment().tz('America/El_Salvador').format(),
    });

    const savedCaracteristica = await this.caracteristicaRepository.save(caracteristica);

    const caracteristicaRelation =  await this.caracteristicaRepository.findOne({
      where: {id: savedCaracteristica.id},
      relations: { registro: true, tipoActivo: true}
    })

    return this.transformInterface(caracteristicaRelation);
  }

  async update(id: string, updateCaracteristicaDto: UpdateCaracteristicaDto, userId?: string): Promise<ICaracteristicasResponse> {
    const { nombre, tipoActivoId } = updateCaracteristicaDto;
    
    if (nombre || tipoActivoId) {
      const caracteristicaActual = await this.caracteristicaRepository.findOne({
        where: {id},
        relations: {tipoActivo: true}
      })

    if (!caracteristicaActual) {
      throw new NotFoundException('Caracteristica not found')
    }

    const nombreFinal = nombre || caracteristicaActual.nombre;
    const tipoActivoIdFinal = tipoActivoId || caracteristicaActual.tipoActivo.id;
    
    const existeCaracteritica = await this.caracteristicaRepository.findOne({
      where: {
        nombre: nombreFinal,
        tipoActivo: {id: tipoActivoIdFinal}
    }});
    

    if (existeCaracteritica && existeCaracteritica.id !== id) {
      throw new BadRequestException('Ya existe una Característica con ese nombre para este Tipo de Activo');
    }
    }

    let tipoActivo = null;
    if (tipoActivoId) {
      tipoActivo = await this.tipoActivoRepository.findOne({
        where: { id: tipoActivoId}
      });

      if (!tipoActivo) {
        throw new BadRequestException('El tipo de activo seleccionado no existe');
      }

      if (tipoActivo.estado !== estadoAct.Activo) {
        throw new BadRequestException ('El tipo de activo seleccionado no esta activo');
      }
    }

    const updateData: any = {
      id,
      nombre,
      updateAt: moment().tz('America/El_Salvador').format(),
    }

    if (nombre) updateData.nombre = nombre;
    if (tipoActivo) updateData.tipoActivo = tipoActivo;
    
    const caracteristica = await this.caracteristicaRepository.preload(updateData);
    if (!caracteristica){
      throw new NotFoundException ('Caracteristica not found')
    }

    await this.caracteristicaRepository.save(caracteristica);

    const caracteristicaRelation = await this.caracteristicaRepository.findOne({
      where: {id},
      relations: {registro: true, tipoActivo: true}
    })
    return this.transformInterface(caracteristicaRelation);
  }

  //activar caracteristicas 
  async activar(id: string, activarDto: ActivarCaracteristicaDto, userId?: string): Promise<ICaracteristicasResponse> {
    if(!activarDto.confirmar){
      throw new BadRequestException('Debe confirmar la activación de la caracteristica');
    }
  
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: {id},
      relations: { registro: true, tipoActivo: true}
    });
  
    if(!caracteristica){
        throw new NotFoundException('Caracteristica not found')
      }
  
    if(caracteristica.estado === estadoAct.Activo) {
        throw new BadRequestException('La Caracteristica ya esta activada');
    }

    caracteristica.estado = estadoAct.Activo;
    caracteristica.es_nuevo = false;
    caracteristica.motivo_inactivar = null;
  
    await this.caracteristicaRepository.save(caracteristica);

    //Busca las relaciones actualizadas
    const caracteristicaRelation = await this.caracteristicaRepository.findOne({
      where: { id },
      relations: { registro: true, tipoActivo: true }
    });

    return this.transformInterface(caracteristicaRelation);
  }
  
  //Desactivar caracteristica
  async desactivar(id: string, desactivarDto: DesactivarCaracteristicaDto, userId?: string): Promise<ICaracteristicasResponse> {
      
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: {id},
      relations: { registro: true, tipoActivo: true }
    });
  
    if(!caracteristica){
        throw new NotFoundException('Carecteristica not found')
    }

    if(caracteristica.estado === estadoAct.Inactivo) {
        throw new BadRequestException('La Caracteristica ya esta inactiva');
    }
  
    caracteristica.estado = estadoAct.Inactivo;
    caracteristica.motivo_inactivar = desactivarDto.justificacion;
  
    await this.caracteristicaRepository.save(caracteristica);

    //Busca las relaciones actualizadas
    const caracteristicaRelation = await this.caracteristicaRepository.findOne({
      where: { id },
      relations: { registro: true, tipoActivo: true }
    });

    return this.transformInterface(caracteristicaRelation);
  }

  async delete(id: string): Promise<void> {
    const caracteristica = await this.caracteristicaRepository.findOne({
      where: {id}
    });

    if (!caracteristica) {
      throw new NotFoundException ('Caracteristica not found')
    }

    if (!caracteristica.es_nuevo) {
      throw new NotFoundException('No se puede eliminar una Caracteristica que ya no es nueva')
    }

    if (caracteristica.estado === estadoAct.Activo) {
      throw new BadRequestException ('No se puede eliminar una Caracteristica Activada')
    }

    await this.caracteristicaRepository.softDelete(id);
  }
}
