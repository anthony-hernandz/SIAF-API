import { IsNotEmpty, Matches, MaxLength, IsUUID } from 'class-validator';

export class CreateSubclaseDto {
  @IsNotEmpty()
  @Matches(/^[A-Z0-9]{5}$/, {
    message: 'El código debe tener sólo números, un máximo de 5 dígitos.',
  })
  codigo: string;

  @IsNotEmpty()
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/, {
    message: 'El nombre solo puede contener letras y espacios.',
  })
  @MaxLength(20, { message: 'El nombre no puede exceder los 20 caracteres.' })
  nombre: string;

  @IsUUID()
  clase_id: string;
}
