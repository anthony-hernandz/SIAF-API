import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Grupo, EstadoRegistro } from './entities/grupo.entity';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { DesactivarGrupoDto } from './dto/desactivar-grupo.dto';

@Injectable()
export class GrupoService {
  constructor(
    @InjectRepository(Grupo)
    private repo: Repository<Grupo>,
  ) {}

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
    const exists =
      (await this.repo.findOne({ where: { nombre: dto.nombre } })) ||
      (await this.repo.findOne({ where: { codigo: dto.codigo } }));

    if (exists) throw new BadRequestException('El código o nombre ya existe');

    const entity = this.repo.create({
      ...dto,
      personal_que_registro: usuario || null,
      estado: EstadoRegistro.INACTIVO,
      es_nuevo: true,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateGrupoDto) {
    const g = await this.repo.findOne({ where: [{ id }] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    Object.assign(g, dto);
    g.fecha_actualizacion = new Date();
    return this.repo.save(g);
  }

  async activar(id: string) {
    const g = await this.repo.findOne({ where: { id }, relations: ['clases'] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    g.estado = EstadoRegistro.ACTIVO;
    g.es_nuevo = false;
    g.fecha_actualizacion = new Date();
    return this.repo.save(g);
  }

  async desactivar(id: string, dto: DesactivarGrupoDto) {
    const g = await this.repo.findOne({ where: { id }, relations: ['clases'] });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    const tieneClasesActivas = (g.clases ?? []).some(
      (c: any) => c.estado === 'activo',
    );
    if (tieneClasesActivas) {
      throw new BadRequestException(
        'No se puede desactivar el grupo porque tiene clases activas.',
      );

      g.estado = EstadoRegistro.INACTIVO;
      g.fecha_actualizacion = new Date();
      return this.repo.save(g);
    }
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
