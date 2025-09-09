import { Decimal } from 'decimal.js';
import type { Era } from './era';

export interface IGenerator {
  id: number;
  name: string;
  level: number;
  quantity: Decimal;
  productionRate: Decimal;
  baseCost: number;
  baseProduction: number;
  yieldMultiplier: number;
  era: Era; // The era this generator belongs to
}