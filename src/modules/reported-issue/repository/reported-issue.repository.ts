import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@common/filters';
import { generateId } from '@common/utils';
import { LoggerService } from '@infrastructure/log';
import { PrismaService } from '@infrastructure/prisma';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateReportedIssueDTO,
  FindAllReportedIssuesFilters,
  UpdateReportedIssueDTO,
} from '../dto';
import { ListReportedIssue, ReportedIssue } from '../entities';

@Injectable()
export class ReportedIssueRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  private buildWhere(
    filters: Omit<FindAllReportedIssuesFilters, 'page' | 'limit'> = {},
  ) {
    const { searchTerm } = filters;

    return {
      ...(searchTerm && {
        name: {
          contains: searchTerm,
          mode: 'insensitive' as const,
        },
      }),
    };
  }

  async findAll(filters: FindAllReportedIssuesFilters = {}): Promise<{
    data: ListReportedIssue[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { page = 1, limit = 25, searchTerm } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildWhere({ searchTerm });

      const [data, total] = await Promise.all([
        this.prisma.reportedIssue.findMany({
          where,
          select: { id: true, name: true },
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.reportedIssue.count({ where }),
      ]);

      return {
        data: data.map((item) => new ListReportedIssue(item.id, item.name)),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      void this.logger.error('ReportedIssueRepository.findAll falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar defeitos apresentados: ' + error.message,
      );
    }
  }

  async findById(id: string): Promise<ReportedIssue | null> {
    try {
      const item = await this.prisma.reportedIssue.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!item) {
        return null;
      }

      return new ReportedIssue(item.id, item.name);
    } catch (error) {
      void this.logger.error('ReportedIssueRepository.findById falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao buscar defeito apresentado: ' + error.message,
      );
    }
  }

  async create(dto: CreateReportedIssueDTO): Promise<void> {
    try {
      await this.prisma.reportedIssue.create({
        data: {
          id: generateId(),
          name: dto.name,
        },
      });
    } catch (error) {
      void this.logger.error('ReportedIssueRepository.create falhou', {
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao criar defeito apresentado: ' + error.message,
      );
    }
  }

  async update(id: string, dto: UpdateReportedIssueDTO): Promise<void> {
    try {
      await this.prisma.reportedIssue.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Defeito apresentado não encontrado.');
      }
      void this.logger.error('ReportedIssueRepository.update falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao atualizar defeito apresentado: ' + error.message,
      );
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const linkedServiceOrders = await this.prisma.serviceOrder.count({
        where: { reportedIssueId: id },
      });

      if (linkedServiceOrders > 0) {
        throw new ConflictException(
          'Defeito possui ordens de serviço vinculadas.',
        );
      }

      await this.prisma.reportedIssue.delete({ where: { id } });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Defeito apresentado não encontrado.');
      }
      void this.logger.error('ReportedIssueRepository.delete falhou', {
        id,
        error: String(error),
      });
      throw new BadRequestException(
        'Erro ao excluir defeito apresentado: ' + error.message,
      );
    }
  }
}
