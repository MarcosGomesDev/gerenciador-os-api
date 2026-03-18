import {
  EXPORT_JOB_HISTORIC_CSV,
  ExportsService,
} from '@infrastructure/exports';
import { FindUserByIdUseCase } from '@modules/user';
import { Injectable } from '@nestjs/common';
import { HistoricAction } from '@prisma/client';

export type ExportHistoricCsvFilters = Readonly<{
  searchTerm?: string;
  action?: HistoricAction;
}>;

@Injectable()
export class ExportHistoricCsvUseCase {
  constructor(
    private readonly exportsService: ExportsService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(params: { userId: string; filters: ExportHistoricCsvFilters }) {
    const user = await this.findUserByIdUseCase.execute(params.userId);

    return await this.exportsService.enqueue(
      EXPORT_JOB_HISTORIC_CSV,
      {
        requestedByUserId: user.id,
        emailTo: user.email,
        nameTo: user.name,
        filters: params.filters,
        requestedAt: new Date().toISOString(),
      },
      {
        priority: 2,
      },
    );
  }
}
