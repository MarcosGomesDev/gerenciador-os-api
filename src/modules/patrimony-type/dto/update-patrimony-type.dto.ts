import { PartialType } from '@nestjs/swagger';
import { CreatePatrimonyTypeDTO } from './create-patrimony-type.dto';

export class UpdatePatrimonyTypeDTO extends PartialType(CreatePatrimonyTypeDTO) {}
