import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Grupo, EstadoRegistro } from './entities/grupo.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { DesactivarGrupoDto } from './dto/desactivar-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private readonly repo: Repository<Grupo>,
  ) {}

  async activos() {
    return this.repo.find({
      where: { estado: EstadoRegistro.ACTIVO },
      order: { codigo: 'ASC' },
    });
  }

  async search(query?: string, page = 1, limit = 10) {
    const where =
      query && query.length >= 3
        ? [{ nombre: ILike(`%${query}%`) }, { codigo: ILike(`%${query}%`) }]
        : {};
    const [items, total] = await this.repo.findAndCount({
      where,
      order: { codigo: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateGrupoDto, usuario?: string) {
    const dupNombre = await this.repo.findOne({
      where: { nombre: dto.nombre },
    });
    const dupCodigo = await this.repo.findOne({
      where: { codigo: dto.codigo },
    });
    if (dupNombre || dupCodigo) {
      throw new BadRequestException(
        `Ya existe un grupo con el mismo ${
          dupNombre ? 'nombre' : 'código'
        } registrado.`,
      );
    }

    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      personal_que_registro: dto.personal_que_registro ?? usuario ?? null,
      estado: dto.estado ?? EstadoRegistro.INACTIVO,
      es_nuevo: true,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateGrupoDto) {
    const g = await this.repo.findOne({ where: [{ id }] });
    if (!g) throw new NotFoundException('Grupo no encontrado');

    if (dto.codigo) {
      const dup = await this.repo.findOne({
        where: { codigo: dto.codigo, id: Not(id) },
      });
      if (dup)
        throw new BadRequestException('Ya existe un grupo con el mismo código');
      g.codigo = dto.codigo;
    }
    if (dto.nombre) {
      const dup = await this.repo.findOne({
        where: { nombre: dto.nombre, id: Not(id) },
      });
      if (dup) {
        throw new BadRequestException('Ya existe un grupo con el mismo nombre');
      }
      g.nombre = dto.nombre;
    }
    if (dto.personal_que_registro !== undefined) {
      g.personal_que_registro = dto.personal_que_registro;
    }
    if (dto.estado !== undefined) {
      g.estado = dto.estado;
    }
    if (dto.motivoDesactivacion !== undefined) {
      (g as any).motivo_desactivacion = dto.motivoDesactivacion || null;
    }
    g.fecha_actualizacion = new Date();
    return this.repo.save(g);
  }

  async activar(id: string) {
    const g = await this.repo.findOne({ where: { id }, relations: ['clases'] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    g.estado = EstadoRegistro.ACTIVO;
    g.es_nuevo = false;
    (g as any).motivo_desactivacion = null;
    g.fecha_actualizacion = new Date();
    return this.repo.save(g);
  }

  async desactivar(id: string, dto: DesactivarGrupoDto) {
    const g = await this.repo.findOne({ where: { id }, relations: ['clases'] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    const tieneClasesActivas = (g.clases ?? []).some(
      (c: any) => c.estado === EstadoRegistro.ACTIVO || c.estado === 'activo ',
    );
    if (tieneClasesActivas) {
      throw new BadRequestException(
        'No se puede desactivar el grupo porque tiene clases activas.',
      );
    }

    g.estado = EstadoRegistro.INACTIVO;
    (g as any).motivo_desactivacion = dto.motivo;
    g.fecha_actualizacion = new Date();
    return this.repo.save(g);
  }

  async remove(id: string) {
    const g = await this.repo.findOne({ where: { id }, relations: ['clases'] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    if (!g.es_nuevo || g.estado === EstadoRegistro.ACTIVO)
      throw new BadRequestException(
        'No se puede eliminar un grupo que está activo o que no es nuevo',
      );
    const tieneRelacion = (g.clases ?? []).length > 0;
    if (tieneRelacion)
      throw new BadRequestException(
        'No se puede eliminar el grupo porque tiene clases relacionadas.',
      );
    await this.repo.delete(id);
    return { ok: true };
  }

  async findOne(id: string) {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    return g;
  }
}
