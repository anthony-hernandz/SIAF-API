import { paginationDto } from "@common/dtos/pagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class paginationCaracteristicaDTO extends paginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly nombre: string;
}