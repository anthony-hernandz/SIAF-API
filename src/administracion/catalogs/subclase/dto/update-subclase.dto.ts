import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSubclaseDto } from './create-subclase.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoRegistro } from '../entities/subclase.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class UpdateSubclaseDto extends PartialType(CreateSubclaseDto) {
  @ApiPropertyOptional({ enum: EstadoRegistro })
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

  @ApiPropertyOptional({
    description: 'Nueva clase (UUID)',
  })
  @IsOptional()
  @IsUUID()
  claseId?: string;

  @ApiPropertyOptional({
    description: 'Grupo dueño de la clase (UUID) para validar dependencia.',
  })
  @IsOptional()
  @IsUUID()
  grupoId?: string;
}