import { PartialType } from '@nestjs/swagger';
import { CreateLocationTypeDTO } from './create-location-type.dto';

export class UpdateLocationTypeDTO extends PartialType(CreateLocationTypeDTO) {}
