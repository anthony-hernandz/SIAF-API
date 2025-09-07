import { IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateGrupoDto {
  @IsNotEmpty()
  @Matches(/^[A-Za-z0-9]+$/)
  @MaxLength(5)
  codigo: string;

  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/)
  @MaxLength(20)
  nombre: string;

}
