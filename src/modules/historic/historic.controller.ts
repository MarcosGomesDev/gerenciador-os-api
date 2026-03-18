import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HistoricAction } from '@prisma/client';
import { UserId } from '@common/decorators';
import { ExportHistoricCsvUseCase, FindAllHistoricUseCase } from './use-cases';

@ApiBearerAuth()
@ApiTags('historics')
@Controller('historics')
export class HistoricController {
  constructor(
    private readonly findAllHistoricUseCase: FindAllHistoricUseCase,
    private readonly exportHistoricCsvUseCase: ExportHistoricCsvUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('action') action?: HistoricAction,
  ) {
    return await this.findAllHistoricUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
      action,
    });
  }

  @Get('export/csv')
  @HttpCode(HttpStatus.ACCEPTED)
  async exportCsv(
    @UserId() userId: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('action') action?: HistoricAction,
  ) {
    const { jobId } = await this.exportHistoricCsvUseCase.execute({
      userId,
      filters: { searchTerm, action },
    });

    return {
      message:
        'Exportação em processamento. Você receberá o CSV por e-mail quando estiver pronto.',
      jobId,
    };
  }
}
