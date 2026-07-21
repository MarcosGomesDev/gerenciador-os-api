import { Sanitize } from '@common/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLocationTypeDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;
}
