import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from './entities/clase.entity';
import { Grupo } from '../grupo/entities/grupo.entity';
import { ClaseService } from './clase.service';
import { ClaseController } from './clase.controller';
import { Subclase } from '../subclase/entities/subclase.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Clase, Grupo, Subclase])],
  controllers: [ClaseController],
  providers: [ClaseService],
  exports: [TypeOrmModule],
})
export class ClaseModule {}
