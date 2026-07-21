import { Inject, Injectable } from '@nestjs/common';
import { ReportedIssueRepository } from '../repository';
import { FindReportedIssueByIdUseCase } from './find-reported-issue-by-id.use-case';

@Injectable()
export class DeleteReportedIssueUseCase {
  constructor(
    @Inject('ReportedIssueRepository')
    private readonly reportedIssueRepository: ReportedIssueRepository,
    private readonly findReportedIssueByIdUseCase: FindReportedIssueByIdUseCase,
  ) {}

  async execute(id: string) {
    await this.findReportedIssueByIdUseCase.execute(id);
    await this.reportedIssueRepository.delete(id);
  }
}
