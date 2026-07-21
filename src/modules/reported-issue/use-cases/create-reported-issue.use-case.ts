import { Inject, Injectable } from '@nestjs/common';
import { CreateReportedIssueDTO } from '../dto';
import { ReportedIssueRepository } from '../repository';

@Injectable()
export class CreateReportedIssueUseCase {
  constructor(
    @Inject('ReportedIssueRepository')
    private readonly reportedIssueRepository: ReportedIssueRepository,
  ) {}

  async execute(dto: CreateReportedIssueDTO) {
    await this.reportedIssueRepository.create(dto);
  }
}
