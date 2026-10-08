import { Router, Request, Response } from 'express';
import { db } from './db.js';

export const apiRouter = Router();

// Current active session memory fallback (or headers)
let currentActiveUserId = 'usr-1';

// --- Auth & Technical Responsible ---
apiRouter.get('/auth/current', (req: Request, res: Response) => {
  const reqUserId = (req.headers['x-user-id'] as string) || currentActiveUserId;
  const user = db.getUserById(reqUserId) || db.getUsers()[0];
  res.json({ user, company: db.getCompany() });
});

apiRouter.get('/auth/users', (_req: Request, res: Response) => {
  res.json(db.getUsers());
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password, userId } = req.body;
  if (userId) {
    const user = db.getUserById(userId);
    if (user) {
      currentActiveUserId = user.id;
      return res.json({ success: true, user });
    }
  }

  if (email) {
    const user = db.getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      currentActiveUserId = user.id;
      return res.json({ success: true, user });
    }
    // Auto-create or login simple user
    const newUser = db.saveUser({
      name: email.split('@')[0],
      email,
      role: 'Responsável Técnico',
      crea: 'CREA/SC'
    });
    currentActiveUserId = newUser.id;
    return res.json({ success: true, user: newUser });
  }

  res.status(400).json({ error: 'Identificação de usuário necessária' });
});

apiRouter.post('/auth/users', (req: Request, res: Response) => {
  try {
    const { name, email, role, crea } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    const user = db.saveUser({ name, email, role, crea });
    res.status(201).json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Raw Materials ---
apiRouter.get('/raw-materials', (_req: Request, res: Response) => {
  res.json(db.getRawMaterials());
});

apiRouter.post('/raw-materials', (req: Request, res: Response) => {
  try {
    const material = db.saveRawMaterial(req.body);
    res.status(201).json(material);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/raw-materials/:id', (req: Request, res: Response) => {
  try {
    const material = db.saveRawMaterial({ ...req.body, id: req.params.id });
    res.json(material);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/raw-materials/:id', (req: Request, res: Response) => {
  const success = db.deleteRawMaterial(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Matéria-prima não encontrada' });
  }
});

apiRouter.post('/raw-materials/:id/stock', (req: Request, res: Response) => {
  const { delta, reason } = req.body;
  const updated = db.adjustRawMaterialStock(req.params.id, Number(delta), reason || 'Ajuste manual');
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Matéria-prima não encontrada' });
  }
});

// --- Products (Ficha Técnica) ---
apiRouter.get('/products', (_req: Request, res: Response) => {
  res.json(db.getProducts());
});

apiRouter.post('/products', (req: Request, res: Response) => {
  try {
    const product = db.saveProduct(req.body);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/products/:id', (req: Request, res: Response) => {
  try {
    const product = db.saveProduct({ ...req.body, id: req.params.id });
    res.json(product);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/products/:id', (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

// --- Suppliers ---
apiRouter.get('/suppliers', (_req: Request, res: Response) => {
  res.json(db.getSuppliers());
});

apiRouter.post('/suppliers', (req: Request, res: Response) => {
  try {
    const sup = db.saveSupplier(req.body);
    res.status(201).json(sup);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/suppliers/:id', (req: Request, res: Response) => {
  try {
    const sup = db.saveSupplier({ ...req.body, id: req.params.id });
    res.json(sup);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/suppliers/:id', (req: Request, res: Response) => {
  const success = db.deleteSupplier(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Fornecedor não encontrado' });
  }
});

// --- Customers ---
apiRouter.get('/customers', (_req: Request, res: Response) => {
  res.json(db.getCustomers());
});

apiRouter.post('/customers', (req: Request, res: Response) => {
  try {
    const cust = db.saveCustomer(req.body);
    res.status(201).json(cust);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/customers/:id', (req: Request, res: Response) => {
  try {
    const cust = db.saveCustomer({ ...req.body, id: req.params.id });
    res.json(cust);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/customers/:id', (req: Request, res: Response) => {
  const success = db.deleteCustomer(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Cliente não encontrado' });
  }
});

// --- Workcenters / Capacity ---
apiRouter.get('/workcenters', (_req: Request, res: Response) => {
  res.json(db.getWorkcenters());
});

apiRouter.post('/workcenters', (req: Request, res: Response) => {
  try {
    const wc = db.saveWorkcenter(req.body);
    res.status(201).json(wc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/workcenters/:id', (req: Request, res: Response) => {
  try {
    const wc = db.saveWorkcenter({ ...req.body, id: req.params.id });
    res.json(wc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/workcenters/:id', (req: Request, res: Response) => {
  const success = db.deleteWorkcenter(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Posto de trabalho não encontrado' });
  }
});

// --- Sales Orders ---
apiRouter.get('/orders', (_req: Request, res: Response) => {
  res.json(db.getOrders());
});

apiRouter.post('/orders', (req: Request, res: Response) => {
  try {
    const order = db.saveOrder(req.body);
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.put('/orders/:id', (req: Request, res: Response) => {
  try {
    const order = db.saveOrder({ ...req.body, id: req.params.id });
    res.json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/orders/:id', (req: Request, res: Response) => {
  const success = db.deleteOrder(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Pedido não encontrado' });
  }
});

// --- Production Orders ---
apiRouter.get('/production-orders', (_req: Request, res: Response) => {
  res.json(db.getProductionOrders());
});

apiRouter.get('/production-orders/:id', (req: Request, res: Response) => {
  const op = db.getProductionOrderById(req.params.id);
  if (op) {
    res.json(op);
  } else {
    res.status(404).json({ error: 'Ordem de produção não encontrada' });
  }
});

apiRouter.post('/production-orders/check-bom', (req: Request, res: Response) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Produto e quantidade são obrigatórios' });
  }
  const check = db.checkBomRequirements(productId, Number(quantity));
  res.json(check);
});

apiRouter.post('/production-orders', (req: Request, res: Response) => {
  try {
    const {
      productId,
      quantity,
      salesOrderId,
      plannedStartDate,
      plannedEndDate,
      priority,
      assignedWorkstation,
      technicalResponsible,
      notes
    } = req.body;

    const op = db.createProductionOrder({
      productId,
      quantity: Number(quantity),
      salesOrderId,
      plannedStartDate,
      plannedEndDate,
      priority,
      assignedWorkstation,
      technicalResponsible: technicalResponsible || 'Responsável Técnico',
      notes
    });

    res.status(201).json(op);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.patch('/production-orders/:id/status', (req: Request, res: Response) => {
  try {
    const { status, responsible, note, producedQuantity } = req.body;
    const op = db.updateProductionOrderStatus(
      req.params.id,
      status,
      responsible || 'Responsável Técnico',
      note,
      producedQuantity
    );
    res.json(op);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.post('/production-orders/:id/complete', (req: Request, res: Response) => {
  try {
    const { responsible, producedQuantity, note } = req.body;
    const op = db.completeProductionOrderWithBaixa(
      req.params.id,
      responsible || 'Responsável Técnico',
      Number(producedQuantity),
      note
    );
    res.json(op);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

apiRouter.delete('/production-orders/:id', (req: Request, res: Response) => {
  const success = db.deleteProductionOrder(req.params.id);
  if (success) {
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Ordem de produção não encontrada' });
  }
});

// --- Reports & Indicators ---
apiRouter.get('/reports/viability', (_req: Request, res: Response) => {
  res.json(db.calculateCapacityAndViability());
});

apiRouter.get('/reports/mrp', (_req: Request, res: Response) => {
  res.json(db.calculateMaterialsMRP());
});

apiRouter.get('/reports/kpis', (_req: Request, res: Response) => {
  const snapshot = db.getSnapshot();
  const viability = db.calculateCapacityAndViability();
  const mrp = db.calculateMaterialsMRP();

  const totalOps = snapshot.productionOrders.length;
  const inProgressOps = snapshot.productionOrders.filter(op => op.status === 'EM_ANDAMENTO').length;
  const plannedOps = snapshot.productionOrders.filter(op => op.status === 'PLANEJADA').length;
  const completedOps = snapshot.productionOrders.filter(op => op.status === 'CONCLUIDA').length;

  const lowStockMaterials = snapshot.rawMaterials.filter(m => m.stock <= m.minStock).length;
  const pendingOrders = snapshot.orders.filter(o => o.status === 'PENDENTE' || o.status === 'EM_PRODUCAO').length;

  res.json({
    totalOps,
    inProgressOps,
    plannedOps,
    completedOps,
    lowStockMaterials,
    pendingOrders,
    capacityUtilization: viability.overallUtilization,
    overallStatus: viability.overallStatus,
    daysOfBacklog: viability.daysOfBacklog,
    mrpShortages: mrp.filter(m => m.status === 'EM_FALTA').length
  });
});

// --- System & Backup ---
apiRouter.post('/system/reset-seed', (_req: Request, res: Response) => {
  const resetDb = db.resetToSeed();
  res.json({ success: true, message: 'Base de dados restaurada com os dados de demonstração padrão', snapshot: resetDb });
});

apiRouter.get('/system/snapshot', (_req: Request, res: Response) => {
  res.json(db.getSnapshot());
});
