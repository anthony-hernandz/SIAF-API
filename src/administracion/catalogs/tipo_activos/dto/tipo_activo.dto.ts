import { PartialType } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";


export class CreateTipoActivoDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(20, {message: 'Maximo 20 caracteres'})
    @Matches(/^[a-zA-Z\u00C0-\u017F\s]+$/)
    public readonly nombre: string;

}

export class UpdateTipoActivoDto extends
PartialType(CreateTipoActivoDto){}

export class ActivarTipoActivoDto{
    @IsBoolean({message: 'Se debe confirmar la activacion'})
    confirmar: boolean;
}

export class DesactivarTipoActivoDto{
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(250, {message: 'Máximo 250 caracteres'})
    @Matches(/^[a-zA-Z\u00C0-\u017F\s]+$/)
    justificacion: string;

}