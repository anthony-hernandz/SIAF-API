import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateClaseDto } from './create-clase.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { EstadoRegistro } from '../entities/clase.entity';
import { Transform } from 'class-transformer';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class UpdateClaseDto extends PartialType(CreateClaseDto) {
  @ApiPropertyOptional({
    enum: EstadoRegistro,
  })
  @IsOptional()
  @IsEnum(EstadoRegistro, {
    message: 'El estado debe ser "activo" o "inactivo"',
  })
  estado?: EstadoRegistro;

  @ApiPropertyOptional({
    description: 'Motivo de desactivación',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El motivo no debe exceder 500 caracteres' })
  @Matches(/^[^<>]*$/u, {
    message: 'No se permiten los caracteres "<" o ">".',
  })
  @trimAndCollapse()
  motivoDesactivacion?: string;
}
