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
import { CreatePatrimonyTypeDTO, UpdatePatrimonyTypeDTO } from './dto';
import {
  CreatePatrimonyTypeUseCase,
  DeletePatrimonyTypeUseCase,
  FindAllPatrimonyTypesUseCase,
  FindPatrimonyTypeByIdUseCase,
  UpdatePatrimonyTypeUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('patrimony-types')
@Controller('patrimony-types')
export class PatrimonyTypeController {
  constructor(
    private readonly findAllPatrimonyTypesUseCase: FindAllPatrimonyTypesUseCase,
    private readonly findPatrimonyTypeByIdUseCase: FindPatrimonyTypeByIdUseCase,
    private readonly createPatrimonyTypeUseCase: CreatePatrimonyTypeUseCase,
    private readonly updatePatrimonyTypeUseCase: UpdatePatrimonyTypeUseCase,
    private readonly deletePatrimonyTypeUseCase: DeletePatrimonyTypeUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findAllPatrimonyTypesUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findPatrimonyTypeByIdUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreatePatrimonyTypeDTO) {
    await this.createPatrimonyTypeUseCase.execute(dto);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdatePatrimonyTypeDTO) {
    await this.updatePatrimonyTypeUseCase.execute(id, dto);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.deletePatrimonyTypeUseCase.execute(id);
  }
}
