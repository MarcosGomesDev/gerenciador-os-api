import { MaxFileSize, Roles, UserId } from '@common/decorators';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  CreateServiceOrderDTO,
  CreateServiceOrderWithFileDTO,
  UpdateServiceOrderDTO,
} from './dto';
import {
  CreateServiceOrderUseCase,
  FindAllServiceOrderUseCase,
  FindServiceOrderByIdUseCase,
  UpdateServiceOrderUseCase,
} from './use-cases';

@ApiBearerAuth()
@ApiTags('service-orders')
@Controller('service-orders')
export class ServiceOrderController {
  constructor(
    private readonly createServiceOrderUseCase: CreateServiceOrderUseCase,
    private readonly findAllServiceOrderUseCase: FindAllServiceOrderUseCase,
    private readonly findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private readonly updateServiceOrderUseCase: UpdateServiceOrderUseCase,
  ) {}

  @Get()
  async findAll() {
    return await this.findAllServiceOrderUseCase.execute();
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
