import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { Subclase, EstadoRegistro } from './entities/subclase.entity';
import { CreateSubclaseDto } from './dto/create-subclase.dto';
import { UpdateSubclaseDto } from './dto/update-subclase.dto';
import { DesactivarSubclaseDto } from './dto/desactivar-subclase.dto';
import { Clase } from '../clase/entities/clase.entity';
import { Grupo } from '../grupo/entities/grupo.entity';

@Injectable()
export class SubclaseService {
  constructor(
    @InjectRepository(Subclase)
    private readonly repo: Repository<Subclase>,
    @InjectRepository(Clase)
    private readonly ClaseRepo: Repository<Clase>,
    @InjectRepository(Grupo)
    private readonly GrupoRepo: Repository<Grupo>,
  ) {}

  async search(
    query?: string,
    page = 1,
    limit = 10,
    claseId?: string,
    grupoId?: string,
  ) {
    const whereBase: any =
      query && query.length >= 3
        ? [{ nombre: ILike(`%${query}%`) }, { codigo: ILike(`%${query}%`) }]
        : {};

    let where: any = whereBase;

    if (claseId && Array.isArray(whereBase)) {
      where = whereBase.map((w) => ({ ...w, clase: { id: claseId } }));
    } else if (claseId) {
      where = { ...whereBase, clase: { id: claseId } };
    }

    if (grupoId) {
      if (Array.isArray(where)) {
        where = where.map((w) => ({
          ...w,
          clase: { ...(w.clase || {}), grupo: { id: grupoId } },
        }));
      } else {
        where = {
          ...where,
          clase: { ...(where.clase || {}), grupo: { id: grupoId } },
        };
      }
    }

    const [items, total] = await this.repo.findAndCount({
      where,
      order: { codigo: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['clase', 'clase.grupo'],
    });
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('La subclase no existe.');
    return s;
  }

  async create(dto: CreateSubclaseDto) {
    const clase = await this.ClaseRepo.findOne({
      where: { id: dto.claseId },
      relations: ['grupo'],
    });
    if (!clase)
      throw new BadRequestException('La clase especificada no existe.');
    if (dto.grupoId && clase.grupo?.id !== dto.grupoId) {
      throw new BadRequestException(
        'La clase no pertenece al grupo especificado.',
      );
    }

    const dupCod = await this.repo.findOne({
      where: { codigo: dto.codigo, clase },
    });
    const dupNom = await this.repo.findOne({
      where: { nombre: dto.nombre, clase },
    });
    if (dupCod || dupNom)
      throw new BadRequestException(
        'Ya existe una subclase con el mismo código o nombre en la clase especificada.',
      );
    
    const entity = this.repo.create({
      codigo: dto.codigo,
      nombre: dto.nombre,
      personal_que_registro: dto.personal_que_registro ?? null,
      estado: dto.estado ?? EstadoRegistro.INACTIVO,
      es_nuevo: true,
      clase,
    });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateSubclaseDto) {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['clase', 'clase.grupo'],
    });
    if (!s) throw new NotFoundException('Subclase no encontrada');

    if (dto.claseId) {
      const NuevaClase = await this.ClaseRepo.findOne({
        where: { id: dto.claseId },
        relations: ['grupo'],
      });
      if (!NuevaClase)
        throw new BadRequestException('La clase especificada no existe.');
      if (dto.grupoId && NuevaClase.grupo?.id !== dto.grupoId) {
        throw new BadRequestException(
          'La clase no pertenece al grupo especificado.',
        );
      }
      s.clase = NuevaClase;
    } else if (dto.grupoId) {
      if (s.clase?.grupo?.id !== dto.grupoId) {
        throw new BadRequestException(
          'La subclase pertenece a una clase de otro grupo.',
        );
      }
    }

    if (dto.codigo) {
      const dup = await this.repo.findOne({
        where: { codigo: dto.codigo, clase: s.clase, id: Not(id) },
      });
      if (dup)
        throw new BadRequestException(
          'Ya existe una subclase con el mismo código en esta clase.',
        );
      s.codigo = dto.codigo;
    }
    if (dto.nombre) {
      const dup = await this.repo.findOne({
        where: { nombre: dto.nombre, clase: s.clase, id: Not(id) },
      });
      if (dup)
        throw new BadRequestException(
          'Ya existe una subclase con el mismo nombre en esta clase.',
        );
      s.nombre = dto.nombre;
    }

    if (dto.personal_que_registro !== undefined)
      s.personal_que_registro = dto.personal_que_registro;
    if (dto.estado !== undefined) s.estado = dto.estado;
    if (dto.motivoDesactivacion !== undefined)
      s.motivo_desactivacion = dto.motivoDesactivacion || null;

    s.fecha_actualizacion = new Date();
    return this.repo.save(s);
  }

  async activar(id: string) {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Subclase no encontrada');

    s.estado = EstadoRegistro.ACTIVO;
    s.es_nuevo = false;
    s.motivo_desactivacion = null;
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

  async activos(claseId?: string, grupoId?: string) {
    let where: any = { estado: EstadoRegistro.ACTIVO };
    if (claseId) where = { ...where, clase: { id: claseId } };
    if (grupoId)
      where = {
        ...where,
        clase: { ...(where.clase || {}), grupo: { id: grupoId } },
      };
    return this.repo.find({
      where,
      relations: ['clase', 'clase.grupo'],
      order: { codigo: 'ASC' },
    });
  }

}
