import { Sanitize } from '@common/decorators';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateReportedIssueDTO {
  @IsNotEmpty()
  @IsString()
  @Sanitize()
  name: string;
}
