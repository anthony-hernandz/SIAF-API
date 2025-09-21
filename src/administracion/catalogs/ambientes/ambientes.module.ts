import { forwardRef, Module } from '@nestjs/common';
import { AmbientesService } from './ambientes.service';
import { AmbientesController } from './controllers/ambientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MntAmbiente } from './entities/ambiente.entity';
import { MntUsers } from '@users/entities';
import { UsersModule } from '@users/users.module';

@Module({
  controllers: [AmbientesController],
  providers: [AmbientesService],
  imports: [
    TypeOrmModule.forFeature([
      MntAmbiente,
      MntUsers,
    ]),
    forwardRef(()=> UsersModule)
  ],
  exports: [AmbientesModule]
})
export class AmbientesModule {}
