export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  crea?: string;
  active: boolean;
}

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  unit: string;
  stock: number;
  minStock: number;
  costPrice: number;
  supplierId: string;
  location?: string;
}

export interface BomItem {
  rawMaterialId: string;
  quantity: number;
  notes?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  processHours: number;
  salePrice: number;
  category: string;
  stock: number;
  minStock: number;
  bom: BomItem[];
  workstations: string[];
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  suppliedProducts: string;
  leadTimeDays: number;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  cnpjCpf: string;
}

export interface Workcenter {
  id: string;
  code: string;
  name: string;
  machineCount: number;
  dailyHoursPerMachine: number;
  workDaysPerMonth: number;
  efficiencyRate: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  processHoursPerUnit: number;
}

export interface SalesOrder {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  deliveryDate: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'PENDENTE' | 'EM_PRODUCAO' | 'CONCLUIDO' | 'CANCELADO';
  items: OrderItem[];
  totalAmount: number;
  notes?: string;
  hasProductionOrder: boolean;
  productionOrderIds?: string[];
}

export interface ProductionOrderBomCheck {
  rawMaterialId: string;
  code: string;
  name: string;
  requiredQuantity: number;
  unit: string;
  stockAvailable: number;
  status: 'SUFICIENTE' | 'CRITICO' | 'EM_FALTA';
}

export interface ProductionOrderHistory {
  date: string;
  responsible: string;
  action: string;
  note?: string;
}

export interface ProductionOrder {
  id: string;
  code: string;
  salesOrderId?: string;
  customerName?: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: 'PLANEJADA' | 'EM_ANDAMENTO' | 'EM_PAUSA' | 'CONCLUIDA' | 'CANCELADA';
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  totalProcessHours: number;
  producedQuantity: number;
  assignedWorkstation: string;
  technicalResponsible: string;
  bomRequirements: ProductionOrderBomCheck[];
  materialsDeducted: boolean;
  stockCredited: boolean;
  notes?: string;
  history: ProductionOrderHistory[];
}

export interface WorkcenterViability {
  id: string;
  code: string;
  name: string;
  machines: number;
  dailyHours: number;
  effectiveMonthlyHours: number;
  allocatedHours: number;
  utilizationRate: number;
  availableHours: number;
  status: 'NORMAL' | 'ATENCAO' | 'SOBRECARGA';
  activeOpCount: number;
}

export interface ViabilityReport {
  totalEffectiveHoursMonth: number;
  totalAllocatedHours: number;
  availableCapacityHours: number;
  overallUtilization: number;
  overallStatus: 'NORMAL' | 'ATENCAO' | 'SOBRECARGA';
  daysOfBacklog: number;
  activeOrdersCount: number;
  workcenters: WorkcenterViability[];
}

export interface MrpItem {
  material: RawMaterial;
  totalRequired: number;
  availableStock: number;
  shortage: number;
  associatedOps: string[];
  status: 'SUFICIENTE' | 'CRITICO' | 'EM_FALTA';
}

export interface KpiSummary {
  totalOps: number;
  inProgressOps: number;
  plannedOps: number;
  completedOps: number;
  lowStockMaterials: number;
  pendingOrders: number;
  capacityUtilization: number;
  overallStatus: 'NORMAL' | 'ATENCAO' | 'SOBRECARGA';
  daysOfBacklog: number;
  mrpShortages: number;
}

export interface CompanyInfo {
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
}
