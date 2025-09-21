import { IsNotEmpty, MaxLength } from 'class-validator';

export class DesactivarClaseDto {
  @IsNotEmpty()
  @MaxLength(300, { message: 'El nombre no puede exceder los 300 caracteres.' })
  nombre: string;
}
