import { IsDateString, IsEmail, IsNotEmpty, IsString, isDateString, IsNumber} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/swagger';

export class createUserDTO {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  public readonly email: string;

  @IsNotEmpty()
  @IsString()
  public readonly password: string;

  @IsNotEmpty()
  @IsString()
  public readonly idRol: string;

   // --- Nuevos campos del formulario ---
  @IsNotEmpty()
  @IsString()
  public readonly primerNombre: string;

  
  @IsString()
  public readonly segundoNombre: string;

  
  @IsString()
  public readonly tercerNombre: string;

 @IsNotEmpty()
  @IsString()
  public readonly primerApellido: string;

  @IsNotEmpty()
  @IsString()
  public readonly segundoApellido: string;

  @IsNotEmpty()
  @IsDateString()
  public readonly fecha_nacimiento: string;

@IsNotEmpty()
  @IsNumber()
  public readonly pais: number;

@IsNotEmpty()
@IsString()
public readonly n_documento: string;

@IsNotEmpty()
@IsString()
public readonly username: string;

@IsNotEmpty()
@IsNumber()
public readonly establecimiento: number;

@IsNotEmpty()
@IsNumber()
public readonly dependencia: number;

}

export class updateUserDTO extends OmitType(PartialType(createUserDTO), [
  'password',
]) {}
