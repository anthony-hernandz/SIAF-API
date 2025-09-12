import { forwardRef, Module } from '@nestjs/common';
import { ProcedenciaService } from './procedencia.service';
import { ProcedenciaController } from './controllers/procedencia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MntProcedencia } from './entities/procedencia.entity';
import { MntUsers } from '@users/entities';
import { UsersModule } from '@users/users.module';

@Module({
  controllers: [ProcedenciaController],
  providers: [ProcedenciaService],
  imports: [
    TypeOrmModule.forFeature([
      MntProcedencia,
      MntUsers,
    ]),
    forwardRef(()=> UsersModule)
  ],
  exports: [ProcedenciaModule]
})
export class ProcedenciaModule {}
