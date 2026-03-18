import {
  EXPORT_JOB_SERVICE_ORDER_CSV,
  ExportsService,
} from '@infrastructure/exports';
import { FindUserByIdUseCase } from '@modules/user';
import { Injectable } from '@nestjs/common';
import { FindAllFilters } from '../dto';

export type ExportServiceOrderCsvFilters = Readonly<
  Omit<FindAllFilters, 'page' | 'limit'>
>;

@Injectable()
export class ExportServiceOrderCsvUseCase {
  constructor(
    private readonly exportsService: ExportsService,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
  ) {}

  async execute(params: {
    userId: string;
    filters: ExportServiceOrderCsvFilters;
  }) {
    const user = await this.findUserByIdUseCase.execute(params.userId);

    return await this.exportsService.enqueue(
      EXPORT_JOB_SERVICE_ORDER_CSV,
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
