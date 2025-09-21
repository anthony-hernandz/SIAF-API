import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoRegistro } from '../../grupo/entities/grupo.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class CreateSubclaseDto {
  @ApiProperty({
    description:
      'Código de la subclase; debe ser número y admite ceros a la izquierda',
    example: '02345',
    maxLength: 5,
  })
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{5}$/, {
    message: 'El código debe tener sólo números, un máximo de 5 dígitos.',
  })
  codigo: string;

  @ApiProperty({
    description:
      'Nombre de la subclase (solo letras y espacios). Máximo 20 caracteres.',
    example: 'Posters',
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: 'El nombre no puede exceder los 20 caracteres.' })
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, {
    message: 'El nombre solo puede contener letras, tíldes y espacios.',
  })
  nombre: string;

  @ApiProperty({
    description: 'ID de la clase (UUID) seleccionada',
    example: 'd2c8c0fe-7a78-4b1c-9f9b-8f2c7c8f3c77',
  })
  @IsUUID()
  claseId: string;

  @ApiProperty({
    description: 'ID del grupo (UUID) seleccionado. Es Opcional',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  grupoId?: string;

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
}
