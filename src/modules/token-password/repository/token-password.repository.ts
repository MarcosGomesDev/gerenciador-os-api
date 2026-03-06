import { generateId } from '@common/utils';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { CreateTokenDTO } from '../dto';
import { TokenPassword } from '../entities';

@Injectable()
export class TokenPasswordRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async verifyToken(token: string): Promise<TokenPassword> {
    return await this.prismaService.passwordResetToken.findUnique({
      where: {
        token,
      },
      select: {
        id: true,
        token: true,
        email: true,
        used: true,
        expiresAt: true,
      },
    });
  }

  async createToken(dto: CreateTokenDTO): Promise<void> {
    await this.prismaService.passwordResetToken.create({
      data: {
        id: generateId(),
        ...dto,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
      },
    });
  }

  async updateToken(email: string): Promise<void> {
    await this.prismaService.passwordResetToken.updateMany({
      where: {
        email,
      },
      data: {
        used: true,
      },
    });
  }
}
