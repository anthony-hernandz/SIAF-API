import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from '../clase/entities/clase.entity';
import { Subclase } from './entities/subclase.entity';
import { SubclaseService } from './subclase.service';
import { SubclaseController } from './subclase.controller';
import { Grupo } from '../grupo/entities/grupo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subclase, Clase, Grupo])],
  controllers: [SubclaseController],
  providers: [SubclaseService],
  exports: [TypeOrmModule]
})
export class SubclaseModule {}
