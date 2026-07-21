import { Inject, Injectable } from '@nestjs/common';
import { FindAllReportedIssuesFilters } from '../dto';
import { ReportedIssueRepository } from '../repository';

@Injectable()
export class FindAllReportedIssuesUseCase {
  constructor(
    @Inject('ReportedIssueRepository')
    private readonly reportedIssueRepository: ReportedIssueRepository,
  ) {}

  async execute(filters: FindAllReportedIssuesFilters = {}) {
    return await this.reportedIssueRepository.findAll(filters);
  }
}
