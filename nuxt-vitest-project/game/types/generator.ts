import { Decimal } from 'decimal.js';

export interface IGenerator {
  id: number;
  level: number;
  quantity: Decimal;
  productionRate: Decimal;
}