import { Sanitize } from '@common/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePatrimonyTypeDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;
}
