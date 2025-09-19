import { forwardRef, Module } from '@nestjs/common';
import { CaracteristicasService } from './caracteristicas.service';
import { CaracteristicasController } from './controllers/caracteristicas.controller';
import { MntCaracteristicas } from './entities/caracteristica.entity';
import { MntTipoActivo } from '../tipo_activos/entities/tipo_activo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '@users/users.module';
import { MntUsers } from '@users/entities';

@Module({
  controllers: [CaracteristicasController],
  providers: [CaracteristicasService],
  imports: [
    TypeOrmModule.forFeature([
      MntCaracteristicas,
      MntUsers,
      MntTipoActivo
    ]),
    forwardRef(() => UsersModule),
    forwardRef (() => MntTipoActivo)
    
  ],
  exports: [CaracteristicasModule]
})
export class CaracteristicasModule {}
