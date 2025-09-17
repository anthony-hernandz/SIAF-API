import { forwardRef, Module } from '@nestjs/common';
import { EstadoFisicoActivoService } from './estado_fisico_activo.service';
import { EstadoFisicoActivoController } from './controllers/estado_fisico_activo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MntEstadoFisicoActivo } from './entities/estado_fisico_activo.entity';
import { MntUsers } from '@users/entities';
import { UsersModule } from '@users/users.module';

@Module({
  controllers: [EstadoFisicoActivoController],
  providers: [EstadoFisicoActivoService],
  imports: [
    TypeOrmModule.forFeature([
      MntEstadoFisicoActivo,
      MntUsers,
    ]),
    forwardRef(()=> UsersModule)
  ],
  exports: [EstadoFisicoActivoModule]
})
export class EstadoFisicoActivoModule {}
