import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Clase, Grupo])],
  controllers: [ClaseController],
  providers: [ClaseService],
  exports: [TypeOrmModule],
})
export class ClaseModule {}
