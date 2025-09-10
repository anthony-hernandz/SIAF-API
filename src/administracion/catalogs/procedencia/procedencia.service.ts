import { 
  BadRequestException, 
  forwardRef, 
  Inject, 
  Injectable, 
  NotFoundException 
} from '@nestjs/common';
import { 
  ActivarProcedenciaDto, 
  CreateProcedenciaDto, 
  DesactivarProcedenciaDto, 
  UpdateProcedenciaDto} from 
  './dto/procedencia.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoAct, MntProcedencia } from './entities/procedencia.entity';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { UsersService } from '../../../users/services/users.service';
import { IProcedencia, IProcedenciaPaginatedResponse } from './procedencia.interface';
import { paginationProcedenciaDTO } from './dto/procedencia-pagination.dto';
import * as moment from 'moment-timezone';


@Injectable()
export class ProcedenciaService {
  constructor(
    @InjectRepository(MntProcedencia)
    private readonly procedenciaRepository: Repository< MntProcedencia>,
    @Inject (forwardRef(()=> UsersService))
    private readonly usersService: UsersService,
  ){}

  private transformInterface(procedencia: MntProcedencia): IProcedencia{
    return{
      id: procedencia.id,
      nombre: procedencia.nombre,
      //Especificación del dato que se requiere del usuario (nombre y apellido)
      registro: `${procedencia.registro?.primerNombre ?? ''} ${procedencia.registro?.primerApellido ?? ''}`.trim(),
      estado: procedencia.estado,
      motivo_inactivar: procedencia.motivo_inactivar,
      es_nuevo: procedencia.es_nuevo,
  
    };
  }
    
  async findAll(params: paginationProcedenciaDTO): Promise<IProcedenciaPaginatedResponse> {
    const {per_page, page, paginate, directionOrder, nombre} = params;
    
    const findOptions: FindManyOptions<MntProcedencia> = {};
    const where: FindOptionsWhere<MntProcedencia> = {};
    
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
    
      const [procedencia, count] = await this.procedenciaRepository.findAndCount(findOptions);
    
      const resultado: IProcedencia[] = procedencia.map(procedencia => this.transformInterface(procedencia));
    
      return {
        procedencia: resultado,
        pagination: {
          limit: paginate ? per_page : count,
          offset: paginate ? (page || 1) : 1,
          total: count,
        },
       };
      }
      
      
    async findOne(id: string): Promise<IProcedencia> {
      const procedencia = await this.procedenciaRepository.findOne({ 
        where: { id },
        relations: {registro: true }
      });
      
      if (!procedencia) {
        throw new NotFoundException('Procedencia not found')
      }
      return this.transformInterface(procedencia);
    }
      

  async create(createProcedenciaDto: CreateProcedenciaDto, userId: string): Promise<IProcedencia> {
      const {nombre} = createProcedenciaDto;
  
      if (await this.procedenciaRepository.findOne({
        where: {nombre}, 
      })){
        throw new BadRequestException('Procedencia already exists');
      }
  
      const usuario = await this.usersService.findOne(userId);
  
      const procedencia = this.procedenciaRepository.create({
        id: uuidv4(),
        nombre,
        registro: usuario,
        estado: estadoAct.Inactivo, //el registro siempre iniciara como 'inactivo'
        motivo_inactivar: null,
        es_nuevo: true,
        createAt: moment().tz('America/El_Salvador').format(),
      });
  
      const savedProcedencia = await this.procedenciaRepository.save(procedencia);
      
      //Busca relación para ejecurtar transformInterface
        const procedenciaRelation = await this.procedenciaRepository.findOne({
          where: {id: savedProcedencia.id},
          relations: { registro: true }
        })
  
      return this.transformInterface(procedenciaRelation);
    }
  
  async update(id: string, updateProcedenciaDto: UpdateProcedenciaDto, userId?: string): Promise<IProcedencia> {
    const { nombre} = updateProcedenciaDto;
  
      if (await this.procedenciaRepository.findOne({where: {nombre}})){
        throw new BadRequestException('Procedencia already exists');
      }
  
      const procedencia = await this.procedenciaRepository.preload({
        id,
        nombre,
        updateAt: moment().tz('America/El_Salvador').format(),
      });
  
      if(!procedencia){
        throw new NotFoundException('Procedencia not found')
      }
      
      await this.procedenciaRepository.save(procedencia);
  
      //Busca relación para ejecurtar transformInterface
      const procedenciaRelation = await this.procedenciaRepository.findOne({
        where: {id},
        relations: { registro: true }
      })
      return this.transformInterface(procedenciaRelation);
    }

  async activar(id: string, activarProcedenciaDto: ActivarProcedenciaDto, userId?: string): Promise<IProcedencia> {
    if(!activarProcedenciaDto.confirmar){
      throw new BadRequestException('Debe confirmar la activación de la Procedencia');
    }
  
    const procedencia = await this.procedenciaRepository.findOne({
      where: {id},
      relations: { registro: true}
    });
  
    if(!procedencia){
        throw new NotFoundException('Procedencia not found')
      }
  
    if(procedencia.estado === 'Activo') {
      throw new BadRequestException('La Procedencia ya esta activada');
    }
  
    const usuario = await this.usersService.findOne(userId);
      
    procedencia.registro = usuario;
    procedencia.estado = estadoAct.Activo;
    procedencia.es_nuevo = false;
    procedencia.motivo_inactivar = null;
  
    await this.procedenciaRepository.save(procedencia);
    return this.transformInterface(procedencia);
  }
  
  async desactivar(id: string, desactivarProcedenciaDto: DesactivarProcedenciaDto, userId?: string): Promise<IProcedencia> {
      
    const procedencia = await this.procedenciaRepository.findOne({
      where: {id},
      relations: { registro: true}
    });
  
    if(!procedencia){
        throw new NotFoundException('Procedencia not found')
      }
  
    if(procedencia.estado === 'Activo') {
      throw new BadRequestException('La Procedencia ya esta activada');
    }
  
    const usuario = await this.usersService.findOne(userId);
      
    procedencia.registro = usuario;
    procedencia.estado = estadoAct.Inactivo;
    procedencia.motivo_inactivar = desactivarProcedenciaDto.justificacion;
  
    await this.procedenciaRepository.save(procedencia);
    return this.transformInterface(procedencia);
  }

  async delete (id: string): Promise<void> {
    const procedencia = await this.procedenciaRepository.findOne({
      where:{id}
    });

    if(!procedencia){
        throw new NotFoundException('Procedencia not found')
      }
    
    if (!procedencia.es_nuevo) {
      throw new BadRequestException('No se puede eliminar una Procedencia que ha sido activada')
    }

    if(procedencia.estado === 'Activo') {
      throw new BadRequestException('No se puede eliminar una procedencia "activada"');
    }

    await this.procedenciaRepository.softDelete(id);
  }
}
