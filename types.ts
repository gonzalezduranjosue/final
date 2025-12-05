export interface MaterialItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface LaborItem {
  id: string;
  description: string;
  cost: number;
}

export interface WorkerInfo {
  id: string;
  name: string;
  role: string;
}

export interface DietInfo {
  workersCount: number;
  days: number;
  costPerDay: number;
}

export interface ProjectInfo {
  projectName: string;
  beneficiary: string;
  approverName: string;
  approvalDate: string;
  observations: string;
}

export type Language = 'es' | 'en';

export const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'kg', label: 'Kg' },
  { value: 'm', label: 'm' },
  { value: 'm2', label: 'm²' },
  { value: 'm3', label: 'm³' },
  { value: 'l', label: 'Litro' },
  { value: 'juego', label: 'Juego' },
  { value: 'caja', label: 'Caja' },
  { value: 'otro', label: 'Otro' },
];