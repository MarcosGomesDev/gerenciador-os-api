import { PartialType } from '@nestjs/swagger';
import { CreatePatrimonyDTO } from './create-patrimony.dto';

export class UpdatePatrimonyDTO extends PartialType(CreatePatrimonyDTO) {}
