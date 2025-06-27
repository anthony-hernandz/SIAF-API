import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BitLogErrores } from '../entities/bitLogsErrors.entity';
import { IBitLogErrores } from '../interfaces/createBitacoraErrors.interface';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectRepository(BitLogErrores)
    private bitLogErroresRepository: Repository<BitLogErrores>,
  ) {}

  async create(createBitacoraDto: IBitLogErrores) {
    const { user: userId, ...data } = createBitacoraDto;
    const bitacora: BitLogErrores = this.bitLogErroresRepository.create({
      id: uuidv4(),
      user: userId,
      ...data,
    });

    await this.bitLogErroresRepository.save(bitacora);
  }
}
