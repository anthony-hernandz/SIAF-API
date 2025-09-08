import { IsNotEmpty, Matches, MaxLength, IsUUID } from 'class-validator';

export class CreateClaseDto {
  @IsNotEmpty()
  @Matches(/^[0-9]{1,5}$/, {
    message: 'El código debe tener entre 1 y 5 dígitos numéricos.',
  })
  codigo: string;

  @IsNotEmpty()
  @MaxLength(20, { message: 'El nombre no puede exceder los 20 caracteres.' })
  nombre: string;

  @IsUUID()
  grupo_id: string;
}
