import { Roles } from '@common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReportedIssueDTO, UpdateReportedIssueDTO } from './dto';
import {
  CreateReportedIssueUseCase,
  DeleteReportedIssueUseCase,
  FindAllReportedIssuesUseCase,
  FindReportedIssueByIdUseCase,
  UpdateReportedIssueUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('reported-issues')
@Controller('reported-issues')
export class ReportedIssueController {
  constructor(
    private readonly findAllReportedIssuesUseCase: FindAllReportedIssuesUseCase,
    private readonly findReportedIssueByIdUseCase: FindReportedIssueByIdUseCase,
    private readonly createReportedIssueUseCase: CreateReportedIssueUseCase,
    private readonly updateReportedIssueUseCase: UpdateReportedIssueUseCase,
    private readonly deleteReportedIssueUseCase: DeleteReportedIssueUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findAllReportedIssuesUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findReportedIssueByIdUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateReportedIssueDTO) {
    await this.createReportedIssueUseCase.execute(dto);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateReportedIssueDTO) {
    await this.updateReportedIssueUseCase.execute(id, dto);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.deleteReportedIssueUseCase.execute(id);
  }
}
