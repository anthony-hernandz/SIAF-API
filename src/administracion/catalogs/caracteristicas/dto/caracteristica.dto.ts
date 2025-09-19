import { PartialType } from '@nestjs/swagger';
import { 
    IsBoolean, 
    IsNotEmpty, 
    IsString, 
    Matches, 
    MaxLength, 
    MinLength 
} from 'class-validator';


export class CreateCaracteristicaDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20, {message: 'Maximo 20 caracteres'})
    @Matches(/^[a-zA-Z\u00C0-\u017F\s]+$/)
    public readonly nombre: string;

    @IsNotEmpty()
    @IsString()
    public readonly tipoActivoId: string;
}

export class UpdateCaracteristicaDto extends 
PartialType(CreateCaracteristicaDto) {}

export class ActivarCaracteristicaDto{
    @IsBoolean({message: 'Se debe confirmar la activacion'})
    confirmar: boolean;
}

export class DesactivarCaracteristicaDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(250, {message: 'Máximo 250 caracteres'})
    @Matches(/^[a-zA-Z\u00C0-\u017F\s]+$/)
    justificacion: string;

}

