import { Department } from 'types/department';

export class LocationTypeSummary {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class Location {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly department: Department,
    public readonly locationTypeId: string,
    public readonly address?: string,
    public readonly directorate?: string,
    public readonly phone?: string,
    public readonly mobile?: string,
    public readonly locationType?: LocationTypeSummary,
  ) {}
}

export class ListLocation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly department: Department,
    public readonly locationType: string,
    public readonly address?: string,
    public readonly directorate?: string,
    public readonly phone?: string,
    public readonly mobile?: string,
  ) {}
}

export class SelectLocation {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly address: string | null,
    public readonly department: Department,
  ) {}
}
