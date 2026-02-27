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
import { UpdateUserDTO } from './dto';
import {
  DeleteUserUseCase,
  FindAllUsersUseCase,
  FindUserByIdUseCase,
  UpdateUserUseCase,
} from './use-cases';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly findAllUsersUseCase: FindAllUsersUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Roles('ADMIN')
  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('name') name?: string,
    @Query('email') email?: string,
  ) {
    return await this.findAllUsersUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      name,
      email,
    });
  }

  @Get('/me')
  async getMe(@UserId() userId: string) {
    const user = await this.findUserByIdUseCase.execute(userId);

    delete user.password;

    return user;
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
    @Body() dto: UpdateUserDTO,
    @UserId() userId: string,
  ) {
    await this.updateUserUseCase.execute(id, dto, userId);
  }

  @Roles('ADMIN')
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.deleteUserUseCase.execute(id);
  }
}
