import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoEnum } from '../entities/tipofinanciamiento.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class CreateTipofinanciamientoDto {
  @ApiProperty({
    description:
      'Tipo de financiamiento (solo letras, tildes y espacios). Máximo 20 caracteres.',
    example: 'Fondos Propios',
    maxLength: 20,
  })
  @IsString()
  @MaxLength(20, {
    message: 'El tipo de financiamiento no debe exceder 20 caracteres',
  })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/u, {
    message: 'Solo se permiten letras, tildes y espacios',
  })
  @trimAndCollapse()
  nombre: string;

  @ApiProperty({
    description: 'Personal que registró',
    example: 'Carlos Rivera',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255, {
    message: 'El nombre del personal no debe exceder 255 caracteres',
  })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'.-]+$/u, {
    message: "Solo se permiten letras, tildes, espacios y (.'-)",
  })
  @trimAndCollapse()
  personal_que_registro: string;
  @ApiProperty({
    enum: EstadoEnum,
    required: false,
    default: EstadoEnum.INACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoEnum, { message: 'El estado debe ser "activo" o "inactivo"' })
  estado?: EstadoEnum;
}
