import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Clase, EstadoRegistro } from './entities/clase.entity';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { DesactivarClaseDto } from './dto/desactivar-clase.dto';
import { Grupo } from '../grupo/entities/grupo.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(Clase)
    private repo: Repository<Clase>,
    @InjectRepository(Grupo)
    private grupoRepo: Repository<Grupo>,
  ) {}

  async search(q?: string, page = 1, limit = 10) {
    const where =
      q && q.length >= 3
        ? [
            { nombre: ILike(`%${q}%`) },
            { codigo: ILike(`%${q}%`) },
            { grupo: { nombre: ILike(`%${q}%`) } },
          ]
        : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['grupo'],
      order: { codigo: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateClaseDto, usuario?: string) {
    const grupo = await this.grupoRepo.findOne({ where: { id: dto.grupo_id } });
    if (!grupo)
      throw new BadRequestException('El grupo especificado no existe.');

    const dup =
      (await this.repo.findOne({ where: { codigo: dto.codigo } })) ||
      (await this.repo.findOne({
        where: { nombre: dto.nombre, grupo: { id: grupo.id } } }));
    if (dup)
      throw new BadRequestException(
        'Ya existe una clase con el mismo código o nombre en el grupo especificado.',
      );

    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      grupo,
      personal_que_registro: usuario ?? null,
      estado: EstadoRegistro.INACTIVO,
      es_nuevo: true,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateClaseDto) {
    const c = await this.repo.findOne({ where: { id }, relations: ['grupo'] });
    if (!c) throw new NotFoundException('La clase no existe.');

    if (dto.grupo_id) {
      const g = await this.grupoRepo.findOne({ where: { id: dto.grupo_id } });
      if (!g) throw new BadRequestException('El grupo especificado no existe.');
      c.grupo = g;
    }
    if (dto.codigo) c.codigo = dto.codigo;
    if (dto.nombre) c.nombre = dto.nombre;

    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async activar(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('La clase no existe.');
    c.estado = EstadoRegistro.ACTIVO;
    c.es_nuevo = false;
    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async desactivar(id: string, dto: DesactivarClaseDto) {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['subclases'],
    });
    if (!c) throw new NotFoundException('La clase no existe.');
    const hayActivas = (c.subclases ?? []).some(
      (s: any) => s.estado === 'ACTIVO',
    );
    if (hayActivas)
      throw new BadRequestException(
        'No se puede desactivar la clase porque tiene subclases activas.',
      );

    c.estado = EstadoRegistro.INACTIVO;
    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.repo.findOne({
      where: { id },
      relations: ['subclases'],
    });
    if (!c) throw new NotFoundException('La clase no existe.');
    if (!c.es_nuevo || c.estado === EstadoRegistro.ACTIVO)
      throw new BadRequestException(
        'No se puede eliminar una clase que no es nueva o que está activa.',
      );
    if ((c.subclases ?? []).length > 0)
      throw new BadRequestException(
        'No se puede eliminar la clase porque tiene subclases asociadas.',
      );

    await this.repo.delete(id);
    return { ok: true };
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id }, relations: ['grupo'] });
    if (!c) throw new NotFoundException('La clase no existe.');
    return c;
  }
}
