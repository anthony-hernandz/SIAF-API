import { IsNotEmpty, IsString } from 'class-validator';

export class createPermissionsDTO {
  @IsNotEmpty()
  @IsString()
  readonly id: string;

  @IsNotEmpty()
  @IsString()
  readonly array: string; // contiene ids de permisos a asignar
}
