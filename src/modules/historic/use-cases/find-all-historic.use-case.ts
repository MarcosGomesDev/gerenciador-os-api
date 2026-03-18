import { Inject, Injectable } from '@nestjs/common';
import { FindAllHistoricFilters } from '../dto';
import { ListHistoric } from '../entities';
import { HistoricRepository } from '../repository';

@Injectable()
export class FindAllHistoricUseCase {
  constructor(
    @Inject('HistoricRepository')
    private readonly historicRepository: HistoricRepository,
  ) {}

  async execute(filters: FindAllHistoricFilters): Promise<{
    data: ListHistoric[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return await this.historicRepository.findAll(filters);
  }
}
