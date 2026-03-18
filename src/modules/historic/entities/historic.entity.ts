import { HistoricAction } from 'types/historic';

export class ListHistoric {
  constructor(
    public readonly id: string,
    public readonly action: HistoricAction,
    public readonly orderId: string,
    public readonly detail: string,
    public readonly createdAt: Date,
    public readonly user?: string,
  ) {}
}
