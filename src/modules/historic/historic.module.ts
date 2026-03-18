import { Module } from '@nestjs/common';
import { HistoricController } from './historic.controller';
import { HistoricExportProcessor } from './jobs/historic-export.processor';
import { HistoricRepository } from './repository';
import { ExportHistoricCsvUseCase, FindAllHistoricUseCase } from './use-cases';
import { UserModule } from '@modules/user';

@Module({
  imports: [UserModule],
  controllers: [HistoricController],
  providers: [
    FindAllHistoricUseCase,
    ExportHistoricCsvUseCase,
    HistoricRepository,
    HistoricExportProcessor,
    {
      provide: 'HistoricRepository',
      useExisting: HistoricRepository,
    },
  ],
  exports: [],
})
export class HistoricModule {}
