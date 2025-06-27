import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/httpExceptionsFilter';
import { BitacoraService } from './services/bitacora.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BitLogErrores } from './entities/bitLogsErrors.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BitLogErrores])],
  providers: [
    BitacoraService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    BitacoraService,
  ],
})
export class BitacoraModule {}
