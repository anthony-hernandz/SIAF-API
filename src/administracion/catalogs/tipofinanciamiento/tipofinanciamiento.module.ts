import { Module } from '@nestjs/common';
import { TipofinanciamientoService } from './tipofinanciamiento.service';
import { TipofinanciamientoController } from './tipofinanciamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tipofinanciamiento } from './entities/tipofinanciamiento.entity';

@Module({
  controllers: [TipofinanciamientoController],
  providers: [TipofinanciamientoService],
  imports: [TypeOrmModule.forFeature([Tipofinanciamiento])],
  exports: [TypeOrmModule, TipofinanciamientoService],
})
export class TipofinanciamientoModule {}
