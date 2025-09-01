import { forwardRef, Module } from '@nestjs/common';
import { TipoActivoService } from './tipo_activos.service';
import { TipoActivoController } from './controllers/tipo_activos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MntUsers } from '@users/entities';
import { UsersModule } from '../../../users/users.module';
import { MntTipoActivo } from './entities/tipo_activo.entity';


@Module({
  controllers: [TipoActivoController],
  providers: [TipoActivoService],
  imports: [
    TypeOrmModule.forFeature([
      MntTipoActivo,
      MntUsers,
    ]),
     forwardRef(() => UsersModule)
  ],
  exports: [TipoActivoService]
})
export class TipoActivoModule {}
