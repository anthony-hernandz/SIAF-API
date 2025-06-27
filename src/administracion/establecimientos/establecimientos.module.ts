import { Module } from '@nestjs/common';
import { EstablecimientosController } from './controller/establecimientos.controller';
import { EstablecimientosService } from './establecimientos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CtlEstablecimiento } from './entities/establecimientos.entity';
import { CtlInstituciones } from './entities/instituciones.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CtlEstablecimiento, CtlInstituciones])],
  controllers: [EstablecimientosController],
  providers: [EstablecimientosService],
  exports: [EstablecimientosService],
})
export class EstablecimientosModule {}
