import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { TokenPassword } from '../entities';
import { generateId } from '@common/utils';
import { CreateTokenDTO } from '../dto';

@Injectable()
export class TokenPasswordRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async verifyToken(email: string): Promise<TokenPassword[]> {
    return await this.prismaService.passwordResetToken.findMany({
      where: {
        id: generateId(),
        email,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
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
