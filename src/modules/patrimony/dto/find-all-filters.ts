import { Department } from 'types/department';
import { PatrimonySituation } from 'types/patrimony';

export interface FindAllPatrimoniesFilters {
  page?: number;
  limit?: number;
  searchTerm?: string;
  department?: Department;
  locationId?: string;
  patrimonyTypeId?: string;
  situation?: PatrimonySituation;
}
