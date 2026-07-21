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
import { CreateLocationTypeDTO, UpdateLocationTypeDTO } from './dto';
import {
  CreateLocationTypeUseCase,
  DeleteLocationTypeUseCase,
  FindAllLocationTypesUseCase,
  FindLocationTypeByIdUseCase,
  UpdateLocationTypeUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('location-types')
@Controller('location-types')
export class LocationTypeController {
  constructor(
    private readonly findAllLocationTypesUseCase: FindAllLocationTypesUseCase,
    private readonly findLocationTypeByIdUseCase: FindLocationTypeByIdUseCase,
    private readonly createLocationTypeUseCase: CreateLocationTypeUseCase,
    private readonly updateLocationTypeUseCase: UpdateLocationTypeUseCase,
    private readonly deleteLocationTypeUseCase: DeleteLocationTypeUseCase,
  ) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findAllLocationTypesUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
    });
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    return await this.findLocationTypeByIdUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Post()
  async create(@Body() dto: CreateLocationTypeDTO) {
    await this.createLocationTypeUseCase.execute(dto);
  }

  @Roles('ADMIN')
  @Patch('/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateLocationTypeDTO) {
    await this.updateLocationTypeUseCase.execute(id, dto);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    await this.deleteLocationTypeUseCase.execute(id);
  }
}
