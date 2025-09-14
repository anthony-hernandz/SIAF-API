import { PartialType } from '@nestjs/swagger';
import { CreateSubclaseDto } from './create-subclase.dto';

export class UpdateSubclaseDto extends PartialType(CreateSubclaseDto) {}
