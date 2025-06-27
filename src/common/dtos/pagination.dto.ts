import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPositive,
  Min,
} from 'class-validator';

enum enumDirectionOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class paginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // enableImplicitConversions: true
  @ApiPropertyOptional({ default: 10 })
  readonly per_page: number = 10;

  @IsOptional()
  @IsPositive()
  @Min(1)
  @Type(() => Number) // enableImplicitConversions: true
  @ApiPropertyOptional({ default: 1 })
  readonly page: number = 1;

  @IsBoolean()
  @IsOptional()
  /** TRANSFORM STRING TO BOOLEAN */
  @Transform(({ obj, key }) => {
    const value = obj[key];
    if (typeof value === 'string') {
      return obj[key] === 'true';
    }
    return value;
  })
  @ApiPropertyOptional({ default: true })
  readonly paginate: boolean = false;

  @IsOptional()
  @IsEnum(enumDirectionOrder)
  @ApiPropertyOptional({ default: enumDirectionOrder.ASC })
  readonly directionOrder: enumDirectionOrder = enumDirectionOrder.ASC;
}
