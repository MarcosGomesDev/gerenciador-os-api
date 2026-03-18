import { HistoricAction } from '@prisma/client';

export interface FindAllHistoricFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  action?: HistoricAction;
}

