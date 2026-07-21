import { Department } from 'types/department';
import { PatrimonySituation } from 'types/patrimony';

export class PatrimonyLocationSummary {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly department: Department,
  ) {}
}

export class PatrimonyTypeSummary {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class PatrimonyUserSummary {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class Patrimony {
  constructor(
    public readonly id: string,
    public readonly inventoryNumber: string,
    public readonly description: string,
    public readonly situation: PatrimonySituation,
    public readonly department: Department,
    public readonly locationId: string,
    public readonly patrimonyTypeId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly locationName?: string,
    public readonly location?: PatrimonyLocationSummary,
    public readonly patrimonyType?: PatrimonyTypeSummary,
    public readonly createdBy?: PatrimonyUserSummary,
    public readonly updatedBy?: PatrimonyUserSummary,
  ) {}
}

export class ListPatrimony {
  constructor(
    public readonly id: string,
    public readonly inventoryNumber: string,
    public readonly description: string,
    public readonly situation: PatrimonySituation,
    public readonly department: Department,
    public readonly locationName: string | undefined,
    public readonly locationId: string,
    public readonly patrimonyTypeId: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
