import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Clase, EstadoRegistro } from './entities/clase.entity';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { DesactivarClaseDto } from './dto/desactivar-clase.dto';
import { Grupo } from '../grupo/entities/grupo.entity';
import { Subclase } from '../subclase/entities/subclase.entity';

@Injectable()
export class ClaseService {
  constructor(
    @InjectRepository(Clase)
    private readonly repo: Repository<Clase>,
    @InjectRepository(Grupo)
    private readonly grupoRepo: Repository<Grupo>,
    @InjectRepository(Subclase)
    private readonly subclaseRepo: Repository<Subclase>,
  ) {}

  async search(query?: string, page = 1, limit = 10, grupoId?: string) {
    const whereBase: any =
      query && query.length >= 3
        ? [{ nombre: ILike(`%${query}%`) }, { codigo: ILike(`%${query}%`) }]
        : {};
    const where =
      Array.isArray(whereBase) && grupoId
        ? whereBase.map((w) => ({ ...w, grupo: { id: grupoId } }))
        : grupoId
          ? { ...whereBase, grupo: { id: grupoId } }
          : whereBase;

    const [items, total] = await this.repo.findAndCount({
      where,
      relations: ['grupo'],
      order: { codigo: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('La clase no existe.');
    return c;
  }

  async create(dto: CreateClaseDto) {
    const grupo = await this.grupoRepo.findOne({ where: { id: dto.grupoId } });
    if (!grupo)
      throw new BadRequestException('El grupo especificado no existe.');

    const dupCod = await this.repo.findOne({
      where: { codigo: dto.codigo, grupo },
    });
    const dupNom = await this.repo.findOne({
      where: { nombre: dto.nombre, grupo },
    });
    if (dupCod || dupNom)
      throw new BadRequestException(
        'Ya existe una clase con el mismo código o nombre en el grupo especificado.',
      );

    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      grupo,
      personal_que_registro: dto.personal_que_registro ?? null,
      estado: dto.estado ?? EstadoRegistro.INACTIVO,
      es_nuevo: true,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateClaseDto) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('La clase no existe.');

    if (dto.codigo) {
      const dup = await this.repo.findOne({
        where: { codigo: dto.codigo, grupo: c.grupo, id: Not(id) },
      });
      if (dup)
        throw new BadRequestException(
          'Ya existe una clase con el mismo código en el grupo.',
        );
      c.codigo = dto.codigo;
    }
    if (dto.nombre) {
      const dup = await this.repo.findOne({
        where: { nombre: dto.nombre, grupo: c.grupo, id: Not(id) },
      });
      if (dup)
        throw new BadRequestException(
          'Ya existe una clase con el mismo nombre en el grupo.',
        );
      c.nombre = dto.nombre;
    }
    if (dto.personal_que_registro !== undefined)
      c.personal_que_registro = dto.personal_que_registro;
    if (dto.estado !== undefined) c.estado = dto.estado;
    if (dto.motivoDesactivacion !== undefined)
      c.motivo_desactivacion = dto.motivoDesactivacion || null;

    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async activar(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('La clase no existe.');
    c.estado = EstadoRegistro.ACTIVO;
    c.es_nuevo = false;
    c.motivo_desactivacion = null;
    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async desactivar(id: string, dto: DesactivarClaseDto) {
    const c = await this.repo.findOne({
      where: { id },
    });
    if (!c) throw new NotFoundException('La clase no existe.');

    const subclasesActivas = await this.subclaseRepo.count({
      where: { clase: { id }, estado: EstadoRegistro.ACTIVO as any },
    });
    if (subclasesActivas > 0)
      throw new BadRequestException(
        'No se puede desactivar la clase porque tiene subclases activas asociadas.',
      );

    c.estado = EstadoRegistro.INACTIVO;
    c.motivo_desactivacion = dto.nombre;
    c.fecha_actualizacion = new Date();
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.repo.findOne({
      where: { id },
    });
    if (!c) throw new NotFoundException('La clase no existe.');
    if (!c.es_nuevo || c.estado === EstadoRegistro.ACTIVO)
      throw new BadRequestException(
        'No se puede eliminar una clase que no es nueva o que está activa.',
      );
    const subclaseCount = await this.subclaseRepo.count({
      where: { clase: { id } },
    });
    if ((c.subclases ?? []).length > 0)
      throw new BadRequestException(
        'No se puede eliminar la clase porque tiene subclases asociadas.',
      );

    await this.repo.delete(id);
    return { ok: true };
  }

  async activos(grupoId?: string) {
    const where: any = { estado: EstadoRegistro.ACTIVO };
    if (grupoId) where.grupo = { id: grupoId };
    return this.repo.find({ where, order: { codigo: 'ASC' } });
  }
}
