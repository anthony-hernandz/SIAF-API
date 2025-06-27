import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CtlEstablecimiento } from './entities/establecimientos.entity';
import { Repository, FindOptionsWhere, ILike, And } from 'typeorm';
import { classSessionUser } from '@common/class/userSession.class';

@Injectable()
export class EstablecimientosService {
  constructor(
    @InjectRepository(CtlEstablecimiento)
    private readonly establecimientosRepository: Repository<CtlEstablecimiento>,
    private sessionUser: classSessionUser,
  ) {}

  async findAll(params: any) {
    const { nombre } = params;
    let where: any;
    if (
      parseInt(this.sessionUser.idEstablecimiento) >= 1 &&
      parseInt(this.sessionUser.idEstablecimiento) <= 5 &&
      this.sessionUser.idRol != '1'
    ) {
      where = [];
      const whereSibasis: FindOptionsWhere<CtlEstablecimiento> = {};
      whereSibasis.establecimiento_padre = {
        id: parseInt(this.sessionUser.idEstablecimiento),
      };
      const sibasis =
        await this.establecimientosRepository.findBy(whereSibasis);
      sibasis.forEach((item) => {
        where.push({
          establecimiento_padre: {
            id: item.id,
          },
          nombre: And(ILike(`%${nombre || ''}%`)),
        });
      });
    } else if (this.sessionUser.idRol != '1') {
      where = {};
      where.id = parseInt(this.sessionUser.idEstablecimiento);
      where.nombre = ILike(`%${nombre || ''}%`);
    } else {
      where = {};
      where.nombre = ILike(`%${nombre || ''}%`);
    }

    const establecimientos = await this.establecimientosRepository.find({
      select: {
        id: true,
        nombre: true,
      },
      where,
      order: { id: { direction: 'ASC' } },
    });

    return {
      establecimientos: establecimientos,
    };
  }
}
