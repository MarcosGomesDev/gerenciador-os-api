import { MaxFileSize, Roles, UserId } from '@common/decorators';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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
  FindAllServiceOrderUseCase,
  FindServiceOrderByIdUseCase,
  FindServiceOrderByTechnicianUseCase,
  GetDashboardSummaryUseCase,
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
    private readonly findServiceOrderByTechnicianUseCase: FindServiceOrderByTechnicianUseCase,
    private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
    private readonly getSummaryChartsUseCase: GetSummaryChartsUseCase,
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
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

  @Roles('TECHNICIAN')
  @Get('/my-orders')
  async findMyOrders(
    @UserId() technicianId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.findServiceOrderByTechnicianUseCase.execute(
      technicianId,
      {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      },
    );
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
