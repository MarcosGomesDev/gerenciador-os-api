import { Inject, Injectable } from '@nestjs/common';
import { UpdateReportedIssueDTO } from '../dto';
import { ReportedIssueRepository } from '../repository';
import { FindReportedIssueByIdUseCase } from './find-reported-issue-by-id.use-case';

@Injectable()
export class UpdateReportedIssueUseCase {
  constructor(
    @Inject('ReportedIssueRepository')
    private readonly reportedIssueRepository: ReportedIssueRepository,
    private readonly findReportedIssueByIdUseCase: FindReportedIssueByIdUseCase,
  ) {}

  async execute(id: string, dto: UpdateReportedIssueDTO) {
    await this.findReportedIssueByIdUseCase.execute(id);
    await this.reportedIssueRepository.update(id, dto);
  }
}
