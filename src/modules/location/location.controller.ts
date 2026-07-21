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
import { Department } from 'types/department';
import { CreateLocationDTO, UpdateLocationDTO } from './dto';
import {
  CreateLocationUseCase,
  DeleteLocationUseCase,
  FindAllLocationsUseCase,
  FindLocationByIdUseCase,
  FindLocationsForSelectUseCase,
  UpdateLocationUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('locations')
@Controller('locations')
export class LocationController {
  constructor(
    private readonly findAllLocationsUseCase: FindAllLocationsUseCase,
    private readonly findLocationsForSelectUseCase: FindLocationsForSelectUseCase,
    private readonly findLocationByIdUseCase: FindLocationByIdUseCase,
    private readonly createLocationUseCase: CreateLocationUseCase,
    private readonly updateLocationUseCase: UpdateLocationUseCase,
    private readonly deleteLocationUseCase: DeleteLocationUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
    @Query('department') department?: Department,
    @Query('locationTypeId') locationTypeId?: string,
  ) {
    return await this.findAllLocationsUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
      department,
      locationTypeId,
    });
  }

  @Get('select')
  async findForSelect(
    @Query('searchTerm') searchTerm?: string,
    @Query('department') department?: Department,
  ) {
    return await this.findLocationsForSelectUseCase.execute({
      searchTerm,
      department,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findLocationByIdUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateLocationDTO) {
    await this.createLocationUseCase.execute(dto);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateLocationDTO) {
    await this.updateLocationUseCase.execute(id, dto);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.deleteLocationUseCase.execute(id);
  }
}
