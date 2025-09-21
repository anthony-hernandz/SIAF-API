import { IsNotEmpty, MaxLength } from 'class-validator';

export class DesactivarSubclaseDto {
  @IsNotEmpty()
  @MaxLength(300, {
    message: 'El motivo de desactivación no puede exceder los 300 caracteres.',
  })
  motivo: string;
}
