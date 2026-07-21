import { MaxFileSize, Roles, UserId } from '@common/decorators';
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ServiceOrderPriority, ServiceOrderStatus } from 'types/service-order';
import {
  CreateServiceOrderDTO,
  CreateServiceOrderWithFileDTO,
  UpdateServiceOrderDTO,
} from './dto';
import {
  CreateServiceOrderUseCase,
  ExportServiceOrderCsvUseCase,
  ExportServiceOrderPdfUseCase,
  FindAllServiceOrderUseCase,
  FindServiceOrderByIdUseCase,
  FindServiceOrderByUserIdUseCase,
  GetDashboardSummaryUseCase,
  GetServiceOrderAttachmentUseCase,
  GetSummaryChartsUseCase,
  UpdateServiceOrderUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly findAllServiceOrderUseCase: FindAllServiceOrderUseCase,
    private readonly findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private readonly findServiceOrderByUserIdUseCase: FindServiceOrderByUserIdUseCase,
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getServiceOrderAttachmentUseCase: GetServiceOrderAttachmentUseCase,
    private readonly getSummaryChartsUseCase: GetSummaryChartsUseCase,
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
    private readonly exportServiceOrderCsvUseCase: ExportServiceOrderCsvUseCase,
    private readonly exportServiceOrderPdfUseCase: ExportServiceOrderPdfUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('department') department?: string,
    @Query('priority') priority?: ServiceOrderPriority,
    @Query('technicianName') technicianName?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('status') status?: ServiceOrderStatus,
  ) {
    return await this.findAllServiceOrderUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      department,
      priority,
      technicianName,
      status,
      searchTerm,
    });
  }

  @Get('/dashboard-summary')
  async getDashboardSummary() {
    return await this.getDashboardSummaryUseCase.execute();
  }

  @Get('/summary-charts')
  async getSummaryCharts() {
    return await this.getSummaryChartsUseCase.execute();
  }

  @Get('/my-orders')
  async findMyOrders(
    @UserId() userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ServiceOrderStatus,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findServiceOrderByUserIdUseCase.execute(userId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
      status,
    });
  }

  @Get('/export/csv')
  @HttpCode(HttpStatus.ACCEPTED)
  async exportCsv(
    @UserId() userId: string,
    @Query('department') department?: string,
    @Query('priority') priority?: ServiceOrderPriority,
    @Query('technicianName') technicianName?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('status') status?: ServiceOrderStatus,
  ) {
    const { jobId } = await this.exportServiceOrderCsvUseCase.execute({
      userId,
      filters: {
        department,
        priority,
        technicianName,
        searchTerm,
        status,
      },
    });

    return {
      message:
        'Exportação em processamento. Você receberá o CSV por e-mail quando estiver pronto.',
      jobId,
    };
  }

  @Get('/:id/attachment')
  async getAttachment(@Param('id') id: string): Promise<StreamableFile> {
    const file = await this.getServiceOrderAttachmentUseCase.execute(id);

    return new StreamableFile(file.stream, {
      type: file.mimeType,
      disposition: `inline; filename="${file.fileName}"`,
    });
  }

  @Roles('ADMIN', 'TECHNICIAN')
  @Get('/:id/pdf')
  @Header('Content-Type', 'application/pdf')
  async exportPdf(@Param('id') id: string): Promise<StreamableFile> {
    const file = await this.exportServiceOrderPdfUseCase.execute(id);

    return new StreamableFile(file.buffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${file.fileName}"`,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findServiceOrderByIdUseCase.execute(id);
  }

  @MaxFileSize(1, 3) // 3MB
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateServiceOrderWithFileDTO })
  @UseInterceptors(FileInterceptor('attachment'))
  @Post()
  async create(
    @Body() createServiceOrderDTO: CreateServiceOrderDTO,
    @UserId() userId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.createServiceOrderUseCase.execute(
      createServiceOrderDTO,
      userId,
      file,
    );
  }

  @Roles('TECHNICIAN')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body()
    updateServiceOrderDTO: UpdateServiceOrderDTO,
  ) {
    return await this.updateServiceOrderUseCase.execute(
      id,
      updateServiceOrderDTO,
    );
  }
}
