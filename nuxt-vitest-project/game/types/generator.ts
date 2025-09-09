import { Decimal } from 'decimal.js';

export interface IGenerator {
  id: number;
  name: string;
  level: number;
  quantity: Decimal;
  productionRate: Decimal;
  baseCost: number;
  baseProduction: number;
  yieldMultiplier: number;
}