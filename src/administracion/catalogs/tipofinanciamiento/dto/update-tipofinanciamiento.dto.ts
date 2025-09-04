import { PartialType } from '@nestjs/swagger';
import { CreateTipofinanciamientoDto } from './create-tipofinanciamiento.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  Matches,
  MaxLength,
  IsString,
} from 'class-validator';
import { EstadoEnum } from '../entities/tipofinanciamiento.entity';
import { Transform } from 'class-transformer';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class UpdateTipofinanciamientoDto extends PartialType(
  CreateTipofinanciamientoDto,
) {
  @ApiPropertyOptional({ enum: EstadoEnum })
  @IsOptional()
  @IsEnum(EstadoEnum, { message: 'El estado debe ser "activo" o "inactivo"' })
  estado?: EstadoEnum;

  @ApiPropertyOptional({ description: 'Motivo de desactivación' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(/^[^<>]*$/u, {
    message: 'No se permiten los caracteres "<" o ">".',
  })
  motivoDesactivacion?: string;

}
