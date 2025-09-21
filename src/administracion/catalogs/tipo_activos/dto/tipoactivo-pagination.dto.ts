import { paginationDto } from "@common/dtos/pagination.dto";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class paginationTipoAcDTO extends paginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  readonly nombre: string;
}