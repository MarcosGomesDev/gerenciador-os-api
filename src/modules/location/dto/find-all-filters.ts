import { Department } from 'types/department';

export interface FindAllLocationsFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  department?: Department;
  locationTypeId?: string;
}
