import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Subclase, EstadoRegistro } from './entities/subclase.entity';
import { CreateSubclaseDto } from './dto/create-subclase.dto';
import { UpdateSubclaseDto } from './dto/update-subclase.dto';
import { DesactivarSubclaseDto } from './dto/desactivar-subclase.dto';
import { Clase } from '../clase/entities/clase.entity';

@Injectable()
export class SubclaseService {
  constructor(
    @InjectRepository(Subclase)
    private readonly repo: Repository<Subclase>,
    @InjectRepository(Clase)
    private readonly ClaseRepo: Repository<Clase>,
  ) {}

  async search(q?: string, page = 1, limit = 10, claseId?: string) {
    const where: any = {};

    if (q && q.length >= 3) {
      const orWhere = [
        { nombre: ILike(`%${q}%`) },
        { codigo: ILike(`%${q}%`) },
        { clase: { nombre: ILike(`%${q}%`) } },
        { clase: { grupo: { nombre: ILike(`%${q}%`) } } },
      ];

      const [items, total] = await this.repo.findAndCount({
        where: orWhere,
        relations: ['clase', 'clase.grupo'],
        order: { codigo: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
      });
      const filtered = claseId
        ? items.filter((i) => i.clase?.id === claseId)
        : items;
      return {
        items: filtered,
        total: claseId ? filtered.length : total,
        page,
        limit,
      };
    }
    if (claseId) where.clase = { id: claseId };

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['clase', 'clase.grupo'],
      order: { codigo: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateSubclaseDto, usuario?: string) {
    const clase = await this.ClaseRepo.findOne({
      where: { id: dto.clase_id },
      relations: ['grupo'],
    });
    if (!clase)
      throw new BadRequestException(
        `No existe la clase con id ${dto.clase_id}`,
      );

    const dupCodigo = await this.repo.findOne({
      where: { codigo: dto.codigo },
    });
    const dupNombre = await this.repo.findOne({
      where: { nombre: dto.nombre, clase: { id: clase.id } },
    });
    if (dupCodigo || dupNombre)
      throw new BadRequestException(
        `Ya existe una subclase con el mismo código o nombre en la clase ${clase.nombre} del grupo ${clase.grupo.nombre}`,
      );

    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      clase,
      personal_que_registro: usuario ?? null,
      estado: EstadoRegistro.INACTIVO,
      es_nuevo: true,
      motivo_desactivacion: null,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateSubclaseDto) {
    const s = await this.repo.findOne({ where: { id }, relations: ['clase'] });
    if (!s) throw new NotFoundException(`No existe la subclase con id ${id}`);

    if (dto.clase_id) {
      const c = await this.ClaseRepo.findOne({ where: { id: dto.clase_id } });
      if (!c) throw new BadRequestException('No existe la clase');
      s.clase = c;
    }
    if (dto.codigo) s.codigo = dto.codigo;
    if (dto.nombre) s.nombre = dto.nombre;

    s.fecha_actualizacion = new Date();
    return this.repo.save(s);
  }

  async activar(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Subclase no encontrada');
    s.estado = EstadoRegistro.ACTIVO;
    s.es_nuevo = false;
    s.fecha_actualizacion = new Date();
    return this.repo.save(s);
  }

  async desactivar(id: string, dto: DesactivarSubclaseDto) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Subclase no encontrada');
    s.estado = EstadoRegistro.INACTIVO;
    s.motivo_desactivacion = dto.motivo;
    s.fecha_actualizacion = new Date();
    return this.repo.save(s);
  }

  async activos(claseId?: string) {
    const where: any = { estado: EstadoRegistro.ACTIVO };
    if (claseId) where.clase = { id: claseId };
    return this.repo.find({
      where,
      relations: ['clase', 'clase.grupo'],
      order: { codigo: 'ASC' },
    });
  }

  async remove(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Subclase no encontrada');
    if (!s.es_nuevo || s.estado === EstadoRegistro.ACTIVO) {
      throw new BadRequestException(
        'No se puede eliminar una subclase que no es nueva o que está activa',
      );
    }
    await this.repo.delete(id);
    return { ok: true, message: 'Subclase eliminada' };
  }

  async findOne(id: string) {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['clase', 'clase.grupo'],
    });
    if (!s) throw new NotFoundException('Subclase no encontrada');
    return s;
  }
}
