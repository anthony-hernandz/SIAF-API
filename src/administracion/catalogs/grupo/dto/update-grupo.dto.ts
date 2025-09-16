import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGrupoDto } from './create-grupo.dto';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { EstadoRegistro } from '../entities/grupo.entity';

const trimAndCollapse = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

export class UpdateGrupoDto extends PartialType(CreateGrupoDto) {
  @ApiPropertyOptional({
    enum: EstadoRegistro,
    description: 'Personal que registró',
    example: 'Rommel Mejía',
    maxLength: 100,
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
