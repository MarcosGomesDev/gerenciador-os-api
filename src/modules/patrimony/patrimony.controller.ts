import { Roles, UserId } from '@common/decorators';
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
import { Department } from 'types/department';
import { PatrimonySituation } from 'types/patrimony';
import { CreatePatrimonyDTO, UpdatePatrimonyDTO } from './dto';
import {
  CreatePatrimonyUseCase,
  DeletePatrimonyUseCase,
  FindAllPatrimoniesUseCase,
  FindPatrimonyByIdUseCase,
  UpdatePatrimonyUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('patrimonies')
@Controller('patrimonies')
export class PatrimonyController {
  constructor(
    private readonly findAllPatrimoniesUseCase: FindAllPatrimoniesUseCase,
    private readonly findPatrimonyByIdUseCase: FindPatrimonyByIdUseCase,
    private readonly createPatrimonyUseCase: CreatePatrimonyUseCase,
    private readonly updatePatrimonyUseCase: UpdatePatrimonyUseCase,
    private readonly deletePatrimonyUseCase: DeletePatrimonyUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('department') department?: Department,
    @Query('locationId') locationId?: string,
    @Query('patrimonyTypeId') patrimonyTypeId?: string,
    @Query('situation') situation?: PatrimonySituation,
  ) {
    return await this.findAllPatrimoniesUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
      department,
      locationId,
      patrimonyTypeId,
      situation,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findPatrimonyByIdUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreatePatrimonyDTO, @UserId() userId: string) {
    await this.createPatrimonyUseCase.execute(dto, userId);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePatrimonyDTO,
    @UserId() userId: string,
  ) {
    await this.updatePatrimonyUseCase.execute(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.deletePatrimonyUseCase.execute(id);
  }
}
