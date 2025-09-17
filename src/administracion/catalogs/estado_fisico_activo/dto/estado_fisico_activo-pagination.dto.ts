import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { paginationDto } from '@common/dtos/pagination.dto';

export class paginationEstadoFisicoActivoDto extends paginationDto{
    @IsOptional()
    @IsString()
    @ApiPropertyOptional()
    readonly nombre: string;
}
