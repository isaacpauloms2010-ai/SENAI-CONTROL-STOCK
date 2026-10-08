import {
  User,
  RawMaterial,
  Product,
  Supplier,
  Customer,
  Workcenter,
  SalesOrder,
  ProductionOrder,
  ViabilityReport,
  MrpItem,
  KpiSummary,
  CompanyInfo,
  ProductionOrderBomCheck
} from '../types/index.js';

let activeUserId: string = localStorage.getItem('manufac_active_user_id') || 'usr-1';

export function setActiveUserHeader(userId: string) {
  activeUserId = userId;
  localStorage.setItem('manufac_active_user_id', userId);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': activeUserId,
    ...(options.headers || {})
  };

  const response = await fetch(endpoint, { ...options, headers });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorBody.error || `Erro HTTP ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Auth & User
  getCurrentUser: () => request<{ user: User; company: CompanyInfo }>('/api/auth/current'),
  getUsers: () => request<User[]>('/api/auth/users'),
  loginUser: (data: { email?: string; userId?: string }) => request<{ success: boolean; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createUser: (data: Partial<User>) => request<User>('/api/auth/users', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Products
  getProducts: () => request<Product[]>('/api/products'),
  createProduct: (data: Partial<Product>) => request<Product>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProduct: (id: string, data: Partial<Product>) => request<Product>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteProduct: (id: string) => request<{ success: boolean }>(`/api/products/${id}`, {
    method: 'DELETE'
  }),

  // Raw Materials
  getRawMaterials: () => request<RawMaterial[]>('/api/raw-materials'),
  createRawMaterial: (data: Partial<RawMaterial>) => request<RawMaterial>('/api/raw-materials', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateRawMaterial: (id: string, data: Partial<RawMaterial>) => request<RawMaterial>(`/api/raw-materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteRawMaterial: (id: string) => request<{ success: boolean }>(`/api/raw-materials/${id}`, {
    method: 'DELETE'
  }),
  adjustStock: (id: string, delta: number, reason: string) => request<RawMaterial>(`/api/raw-materials/${id}/stock`, {
    method: 'POST',
    body: JSON.stringify({ delta, reason })
  }),

  // Suppliers
  getSuppliers: () => request<Supplier[]>('/api/suppliers'),
  createSupplier: (data: Partial<Supplier>) => request<Supplier>('/api/suppliers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateSupplier: (id: string, data: Partial<Supplier>) => request<Supplier>(`/api/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteSupplier: (id: string) => request<{ success: boolean }>(`/api/suppliers/${id}`, {
    method: 'DELETE'
  }),

  // Customers
  getCustomers: () => request<Customer[]>('/api/customers'),
  createCustomer: (data: Partial<Customer>) => request<Customer>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCustomer: (id: string, data: Partial<Customer>) => request<Customer>(`/api/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteCustomer: (id: string) => request<{ success: boolean }>(`/api/customers/${id}`, {
    method: 'DELETE'
  }),

  // Workcenters
  getWorkcenters: () => request<Workcenter[]>('/api/workcenters'),
  createWorkcenter: (data: Partial<Workcenter>) => request<Workcenter>('/api/workcenters', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateWorkcenter: (id: string, data: Partial<Workcenter>) => request<Workcenter>(`/api/workcenters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteWorkcenter: (id: string) => request<{ success: boolean }>(`/api/workcenters/${id}`, {
    method: 'DELETE'
  }),

  // Sales Orders
  getOrders: () => request<SalesOrder[]>('/api/orders'),
  createOrder: (data: Partial<SalesOrder>) => request<SalesOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateOrder: (id: string, data: Partial<SalesOrder>) => request<SalesOrder>(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteOrder: (id: string) => request<{ success: boolean }>(`/api/orders/${id}`, {
    method: 'DELETE'
  }),

  // Production Orders
  getProductionOrders: () => request<ProductionOrder[]>('/api/production-orders'),
  getProductionOrder: (id: string) => request<ProductionOrder>(`/api/production-orders/${id}`),
  checkBomViability: (productId: string, quantity: number) => request<ProductionOrderBomCheck[]>('/api/production-orders/check-bom', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  createProductionOrder: (data: {
    productId: string;
    quantity: number;
    salesOrderId?: string;
    plannedStartDate: string;
    plannedEndDate: string;
    priority?: string;
    assignedWorkstation?: string;
    technicalResponsible: string;
    notes?: string;
  }) => request<ProductionOrder>('/api/production-orders', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateProductionOrderStatus: (id: string, data: {
    status: ProductionOrder['status'];
    responsible: string;
    note?: string;
    producedQuantity?: number;
  }) => request<ProductionOrder>(`/api/production-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  completeProductionOrder: (id: string, data: {
    responsible: string;
    producedQuantity: number;
    note?: string;
  }) => request<ProductionOrder>(`/api/production-orders/${id}/complete`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  deleteProductionOrder: (id: string) => request<{ success: boolean }>(`/api/production-orders/${id}`, {
    method: 'DELETE'
  }),

  // Reports
  getViabilityReport: () => request<ViabilityReport>('/api/reports/viability'),
  getMrpReport: () => request<MrpItem[]>('/api/reports/mrp'),
  getKpiSummary: () => request<KpiSummary>('/api/reports/kpis'),

  // System
  resetSeedData: () => request<{ success: boolean; message: string }>('/api/system/reset-seed', {
    method: 'POST'
  }),
  getSystemSnapshot: () => request<any>('/api/system/snapshot')
};
