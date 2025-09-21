import { IsNotEmpty, MaxLength } from 'class-validator';

export class DesactivarGrupoDto {
  @IsNotEmpty()
  @MaxLength(300)
  motivo: string;
}
