import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { SignInUseCase, SignUpUseCase } from './use-cases';
import { Public, Roles, ThrottleLogin, UserId } from '@common/decorators';
import { LoginDTO } from './dto';
import { CreateUserDTO } from '@modules/user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signInUser: SignInUseCase,
    private readonly signUpUser: SignUpUseCase,
  ) {}

  @Public()
  @ThrottleLogin()
  @UsePipes(ValidationPipe)
  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() dto: LoginDTO, @Req() req: Request) {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const { accessToken, refreshToken } = await this.signInUser.execute(
      dto,
      ip,
      userAgent,
    );

    return { accessToken, refreshToken };
  }

  @Roles('admin')
  @Post('/sign-up')
  @UsePipes(ValidationPipe)
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() dto: CreateUserDTO, @UserId() userId: string) {
    return await this.signUpUser.execute(dto, userId);
  }

  //   @Public()
  //   @Post('/refresh')
  //   @HttpCode(HttpStatus.OK)
  //   async refresh(@Body() dto: { refreshToken: string }) {
  //     if (!dto.refreshToken) {
  //       throw new UnauthorizedException('Refresh token não encontrado');
  //     }

  //     const {
  //       accessToken,
  //       refreshToken: newRefreshToken,
  //       user,
  //     } = await this.refreshTokenUseCase.execute(dto.refreshToken);

  //     return { accessToken, refreshToken: newRefreshToken, user };
  //   }

  //   @Public()
  //   @Post('/logout')
  //   @HttpCode(HttpStatus.OK)
  //   async logout(@Req() req: Request, @Body() dto: { refreshToken: string }) {
  //     const [_, token] = req.headers.authorization?.split(' ') ?? [];

  //     // Blacklista os tokens
  //     await this.logoutUserUseCase.execute(token, dto.refreshToken);

  //     return { success: true };
  //   }

  //   @Public()
  //   @ThrottleTokenGeneration()
  //   @Post('/forgot-password')
  //   @UsePipes(ValidationPipe)
  //   @HttpCode(HttpStatus.OK)
  //   async forgotPassword(@Body() dto: ForgotPasswordDTO) {
  //     return await this.forgotPasswordUseCase.execute(dto.email);
  //   }

  //   @Public()
  //   @ThrottleTokenGeneration()
  //   @Post('/verify-token')
  //   @UsePipes(ValidationPipe)
  //   @HttpCode(HttpStatus.OK)
  //   async verifyToken(@Body() dto: VerifyTokenDTO) {
  //     await this.verifyTokenPasswordUseCase.execute(dto.email, dto.token);
  //   }

  //   @Public()
  //   @ThrottlePasswordReset()
  //   @Post('/reset-password')
  //   @UsePipes(ValidationPipe)
  //   @HttpCode(HttpStatus.OK)
  //   async resetPassword(@Body() dto: ResetPasswordDTO, @Req() req: Request) {
  //     const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  //     const userAgent = req.get('user-agent') || 'unknown';
  //     await this.resetPasswordUseCase.execute(
  //       dto.email,
  //       dto.password,
  //       ip,
  //       userAgent,
  //     );
  //   }
}
