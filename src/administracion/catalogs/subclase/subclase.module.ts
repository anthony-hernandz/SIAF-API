import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clase } from '../clase/entities/clase.entity';
import { Subclase } from './entities/subclase.entity';
import { SubclaseService } from './subclase.service';
import { SubclaseController } from './subclase.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subclase, Clase])],
  controllers: [SubclaseController],
  providers: [SubclaseService],
  exports: [TypeOrmModule]
})
export class SubclaseModule {}
