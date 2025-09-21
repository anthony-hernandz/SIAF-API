import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoRegistro } from '../../grupo/entities/grupo.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class CreateClaseDto {
  @ApiProperty({
    description:
      'Código de la clase; debe ser número y admite ceros a la izquierda',
    example: '12345',
    maxLength: 5,
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{5}$/, {
    message: 'El código debe tener exactamente 5 dígitos y sólo números.',
  })
  @MaxLength(5)
  codigo: string;

  @ApiProperty({
    description:
      'Nombre de la clase (solo letras y espacios). Máximo 20 caracteres.',
    example: 'Monitor',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'El nombre no puede exceder los 20 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  @trimAndCollapse()
  nombre: string;

  @ApiProperty({
    description: 'Personal que registró',
    example: 'Rommel Mejía',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El nombre no debe exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'.-]+$/u, {
    message: "Solo se permiten letras, tildes, espacios y (.'-)",
  })
  @trimAndCollapse()
  personal_que_registro: string;

  @ApiProperty({
    enum: EstadoRegistro,
    required: false,
    default: EstadoRegistro.INACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoRegistro, {
    message: 'El estado debe ser "activo" o "inactivo"',
  })
  estado?: EstadoRegistro;

  @ApiProperty({
    description: 'ID del grupo al que pertenece la clase(UUID)',
    example: 'f2fdc257-d903-42b7-8459-6728daf80d17',
  })
  @IsString()
  @IsNotEmpty()
  grupoId: string;
}
