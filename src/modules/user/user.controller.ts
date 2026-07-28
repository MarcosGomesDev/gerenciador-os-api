import { Roles, UserId } from '@common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDTO, UpdateUserStatusDTO } from './dto';
import {
  DeleteUserUseCase,
  FindAllDeletedUsersUseCase,
  FindAllTechniciansUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  RestoreUserUseCase,
  UpdateUserStatusUseCase,
  UpdateUserUseCase,
} from './use-cases';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findAllDeletedUsersUseCase: FindAllDeletedUsersUseCase,
    private readonly findAllTechniciansUseCase: FindAllTechniciansUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserStatusUseCase: UpdateUserStatusUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly restoreUserUseCase: RestoreUserUseCase,
  ) {}

  @Roles('ADMIN')
  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findAllUsersUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
    });
  }

  @Get('/me')
  async getMe(@UserId() userId: string) {
    const user = await this.findUserByIdUseCase.execute(userId);

    delete user.password;

    return user;
  }

  @Get('/technicians')
  async findAllTechnicians() {
    return await this.findAllTechniciansUseCase.execute();
  }

  @Roles('ADMIN')
  @Get('/deleted')
  async getDeletedList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('searchTerm') searchTerm?: string,
  ) {
    return await this.findAllDeletedUsersUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      searchTerm,
    });
  }

  @Roles('ADMIN')
  @Get('/:id')
  async findById(@Param('id') id: string) {
    const user = await this.findUserByIdUseCase.execute(id);

    delete user.password;

    return user;
  }

  @Patch('/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: Omit<UpdateUserDTO, 'isActive'>,
    @UserId() userId: string,
  ) {
    await this.updateUserUseCase.execute(id, dto, userId);
  }

  @Roles('ADMIN')
  @Patch('/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDTO,
    @UserId() userId: string,
  ) {
    await this.updateUserStatusUseCase.execute(id, dto, userId);
  }

  @Roles('ADMIN')
  @Patch('/:id/restore')
  async restore(@Param('id') id: string) {
    return await this.restoreUserUseCase.execute(id);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.deleteUserUseCase.execute(id);
  }
}
