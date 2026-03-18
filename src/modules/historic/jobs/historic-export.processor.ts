import {
  EXPORTS_QUEUE,
  EXPORT_JOB_HISTORIC_CSV,
  toCsvBuffer,
} from '@infrastructure/exports';
import { LoggerService } from '@infrastructure/log';
import { MailService } from '@infrastructure/providers';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { HistoricRepository } from '../repository';
import { ExportHistoricCsvFilters } from '../use-cases/export-historic-csv.use-case';

type ExportHistoricCsvPayload = Readonly<{
  requestedByUserId: string;
  emailTo: string;
  nameTo?: string;
  filters: ExportHistoricCsvFilters;
  requestedAt: string;
}>;

@Processor(EXPORTS_QUEUE)
export class HistoricExportProcessor {
  constructor(
    private readonly historicRepository: HistoricRepository,
    private readonly mailService: MailService,
    private readonly logger: LoggerService,
  ) {}

  @Process(EXPORT_JOB_HISTORIC_CSV)
  async handle(job: Job<ExportHistoricCsvPayload>): Promise<void> {
    const { emailTo, nameTo, filters } = job.data;

    const maxRows = Number(process.env.EXPORT_MAX_ROWS ?? 100_000);
    const batchSize = Number(process.env.EXPORT_BATCH_SIZE ?? 5_000);

    const total = await this.historicRepository.count(filters);
    const rowsToFetch = Math.min(total, maxRows);

    if (total > maxRows) {
      void this.logger.warn('Export Historic CSV truncado por maxRows', {
        total,
        maxRows,
      });
    }

    const all: any[] = [];
    for (let skip = 0; skip < rowsToFetch; skip += batchSize) {
      const take = Math.min(batchSize, rowsToFetch - skip);
      const page = await this.historicRepository.findManyForExport({
        filters,
        skip,
        take,
      });
      all.push(...page);
    }

    const csvBuffer = toCsvBuffer(
      [
        { header: 'ID', value: (r) => r.id },
        { header: 'Ação', value: (r) => r.action },
        { header: 'OS', value: (r) => r.orderId },
        { header: 'Detalhe', value: (r) => r.detail },
        { header: 'Usuário', value: (r) => r.user },
        { header: 'Criado em', value: (r) => r.createdAt?.toISOString?.() },
      ],
      all,
    );

    const fileName = `historicos-${new Date().toISOString().slice(0, 10)}.csv`;

    await this.mailService.sendMail({
      to: emailTo,
      subject: 'Exportação de históricos (CSV)',
      template: 'export-ready',
      context: {
        name: nameTo,
        fileName,
        rows: all.length,
      },
      attachments: [
        {
          filename: fileName,
          content: csvBuffer,
          contentType: 'text/csv; charset=utf-8',
        },
      ],
    });

    void this.logger.info('Export Historic CSV enviado', {
      to: emailTo,
      rows: all.length,
    });
  }
}
