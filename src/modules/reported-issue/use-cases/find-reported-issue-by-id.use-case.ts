import { NotFoundException } from '@common/filters';
import { Inject, Injectable } from '@nestjs/common';
import { ReportedIssueRepository } from '../repository';

@Injectable()
export class FindReportedIssueByIdUseCase {
  constructor(
    @Inject('ReportedIssueRepository')
    private readonly reportedIssueRepository: ReportedIssueRepository,
  ) {}

  async execute(id: string) {
    const item = await this.reportedIssueRepository.findById(id);

    if (!item) {
      throw new NotFoundException('Defeito apresentado não encontrado.');
    }

    return item;
  }
}
