import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTipofinanciamientoDto } from './dto/create-tipofinanciamiento.dto';
import { UpdateTipofinanciamientoDto } from './dto/update-tipofinanciamiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EstadoEnum,
  Tipofinanciamiento,
} from './entities/tipofinanciamiento.entity';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class TipofinanciamientoService {
  constructor(
    @InjectRepository(Tipofinanciamiento)
    private readonly repo: Repository<Tipofinanciamiento>,
  ) {}

  async findAll(q?: string) {
    const where = q
      ? {
          nombre: ILike(`%${q}%`),
        }
      : {};

    return this.repo.find({ where, order: { fechaCreacion: 'DESC' } });
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Registro no encontrado');
    return item;
  }

  async create(dto: CreateTipofinanciamientoDto) {
    const exists = await this.repo.findOne({
      where: { nombre: ILike(dto.nombre) },
    });
    if (exists)
      throw new BadRequestException('El tipo de financiamiento ya existe');

    const entity = this.repo.create({
      nombre: dto.nombre,
      personal_que_registro: dto.personal_que_registro,
      estado: dto.estado ?? EstadoEnum.INACTIVO,
    });

    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateTipofinanciamientoDto) {
    const item = await this.findOne(id);
    if (dto.nombre && dto.nombre !== item.nombre) {
      const dup = await this.repo.findOne({
        where: { nombre: ILike(dto.nombre) },
      });
      if (dup && dup.id !== id) {
        throw new BadRequestException(
          'El tipo de financiamiento ya existe con ese nombre',
        );
      }
    }

    Object.assign(item, dto);
    return this.repo.save(item);
  }

  async activar(id: string) {
    const item = await this.findOne(id);
    if (item.estado === EstadoEnum.ACTIVO) {
      throw new BadRequestException('El tipo de financiamiento ya está activo');
    }
    item.estado = EstadoEnum.ACTIVO;
    item.esNuevo = false;
    ('esNuevo');
    item.fechaActivacion = new Date();
    item.motivoDesactivacion = null;
    return this.repo.save(item);
  }

  async desactivar(id: string, motivo?: string) {
    const item = await this.findOne(id);
    if (item.estado === EstadoEnum.INACTIVO) {
      throw new BadRequestException(
        'El tipo de financiamiento ya está inactivo',
      );
    }
    item.estado = EstadoEnum.INACTIVO;
    item.motivoDesactivacion = motivo ?? null;
    return this.repo.save(item);
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    if (!(item.esNuevo && item.estado === EstadoEnum.INACTIVO)) {
      throw new BadRequestException(
        'No se puede eliminar el tipo de financiamiento',
      );
    }
    await this.repo.delete(item);
    return { ok: true, message: 'Tipo de financiamiento eliminado' };
  }
}
