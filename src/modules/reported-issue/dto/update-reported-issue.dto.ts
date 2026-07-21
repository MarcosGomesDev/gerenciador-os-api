import { PartialType } from '@nestjs/swagger';
import { CreateReportedIssueDTO } from './create-reported-issue.dto';

export class UpdateReportedIssueDTO extends PartialType(CreateReportedIssueDTO) {}
