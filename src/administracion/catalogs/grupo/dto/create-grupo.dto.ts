import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoRegistro } from '../entities/grupo.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class CreateGrupoDto {
  @ApiProperty({ 
    description:
      'Código del grupo; debe ser número y admite ceros a la izquierda',
    example: '00001',
    maxLength: 5
  })
  @IsNotEmpty()
  @Matches(/^[0-9]{5}$/, {
    message: 'El código debe tener exactamente 5 dígitos y sólo números.',
  })
  @MaxLength(5)
  codigo: string;

  @ApiProperty({ 
    description:
      'Nombre del grupo (solo letras y espacios). Máximo 20 caracteres.',
    example: 'Terrenos',
    maxLength: 20
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  @trimAndCollapse()
  @MaxLength(20, { message: 'El nombre no debe exceder 20 caracteres' })
  nombre: string;

  @ApiProperty({ 
    description: 'Personal que registró',
    example: 'Rommel Mejía',
    maxLength: 100
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
    default: EstadoRegistro.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoRegistro, {
    message: 'El estado debe ser "activo" o "inactivo"',
  })
  estado?: EstadoRegistro;
}
