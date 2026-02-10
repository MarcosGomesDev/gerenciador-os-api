import { Department } from 'types/department';
import { Role } from 'types/role';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public taxIdentifier: string,
    public password: string,
    public role: Role,
    public department: Department,
    public isActive: boolean,
    public isFirstAccess: boolean,
  ) {}
}

export class ListUser {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: Role,
    public department: Department,
    public isActive: boolean,
  ) {}
}
