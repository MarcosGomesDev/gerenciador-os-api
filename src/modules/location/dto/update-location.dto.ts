import { PartialType } from '@nestjs/swagger';
import { CreateLocationDTO } from './create-location.dto';

export class UpdateLocationDTO extends PartialType(CreateLocationDTO) {}
