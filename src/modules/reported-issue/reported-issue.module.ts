import { Module } from '@nestjs/common';
import { ReportedIssueRepository } from './repository';
import {
  CreateReportedIssueUseCase,
  DeleteReportedIssueUseCase,
  FindAllReportedIssuesUseCase,
  FindReportedIssueByIdUseCase,
  UpdateReportedIssueUseCase,
} from './use-cases';
import { ReportedIssueController } from './reported-issue.controller';

@Module({
  imports: [],
  controllers: [ReportedIssueController],
  providers: [
    FindAllReportedIssuesUseCase,
    FindReportedIssueByIdUseCase,
    CreateReportedIssueUseCase,
    UpdateReportedIssueUseCase,
    DeleteReportedIssueUseCase,
    ReportedIssueRepository,
    {
      provide: 'ReportedIssueRepository',
      useExisting: ReportedIssueRepository,
    },
  ],
  exports: [
    ReportedIssueRepository,
    FindReportedIssueByIdUseCase,
    {
      provide: 'ReportedIssueRepository',
      useExisting: ReportedIssueRepository,
    },
  ],
})
export class ReportedIssueModule {}
