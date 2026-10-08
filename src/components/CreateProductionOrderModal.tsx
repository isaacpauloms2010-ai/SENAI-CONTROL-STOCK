import React, { useState, useEffect } from 'react';
import { Product, SalesOrder, Workcenter, ProductionOrderBomCheck } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { X, AlertTriangle, CheckCircle2, Clock, Calendar, Layers, ShieldAlert } from 'lucide-react';

interface CreateProductionOrderModalProps {
  products: Product[];
  salesOrders: SalesOrder[];
  workcenters: Workcenter[];
  preselectedSalesOrder?: SalesOrder;
  preselectedProduct?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateProductionOrderModal: React.FC<CreateProductionOrderModalProps> = ({
  products,
  salesOrders,
  workcenters,
  preselectedSalesOrder,
  preselectedProduct,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [selectedProductId, setSelectedProductId] = useState<string>(
    preselectedProduct?.id || (preselectedSalesOrder?.items[0]?.productId || products[0]?.id || '')
  );
  const [quantity, setQuantity] = useState<number>(
    preselectedSalesOrder?.items[0]?.quantity || 1
  );
  const [salesOrderId, setSalesOrderId] = useState<string>(preselectedSalesOrder?.id || '');
  const [plannedStartDate, setPlannedStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [plannedEndDate, setPlannedEndDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [priority, setPriority] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'>(
    preselectedSalesOrder?.priority || 'MEDIA'
  );
  const [assignedWorkstation, setAssignedWorkstation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [bomCheck, setBomCheck] = useState<ProductionOrderBomCheck[]>([]);
  const [isCheckingBom, setIsCheckingBom] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const currentProduct = products.find(p => p.id === selectedProductId);

  // Set default workstation when product changes
  useEffect(() => {
    if (currentProduct && currentProduct.workstations.length > 0) {
      setAssignedWorkstation(currentProduct.workstations[0]);
    } else if (workcenters.length > 0) {
      setAssignedWorkstation(workcenters[0].name);
    }
  }, [currentProduct, workcenters]);

  // Live BOM check whenever product or quantity changes
  useEffect(() => {
    if (selectedProductId && quantity > 0) {
      setIsCheckingBom(true);
      api.checkBomViability(selectedProductId, quantity)
        .then(res => {
          setBomCheck(res);
          setIsCheckingBom(false);
        })
        .catch(err => {
          console.error(err);
          setIsCheckingBom(false);
        });
    }
  }, [selectedProductId, quantity]);

  const hasMissingMaterials = bomCheck.some(item => item.status === 'EM_FALTA');
  const totalProcessHours = currentProduct ? (currentProduct.processHours * quantity).toFixed(1) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) {
      setErrorMsg('Selecione um produto e uma quantidade válida');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await api.createProductionOrder({
        productId: selectedProductId,
        quantity: Number(quantity),
        salesOrderId: salesOrderId || undefined,
        plannedStartDate,
        plannedEndDate,
        priority,
        assignedWorkstation,
        technicalResponsible: currentUser?.name || 'Responsável Técnico',
        notes
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao emitir ordem de produção');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="font-bold text-lg">Emissão de Ordem de Produção (OP)</h3>
            <p className="text-xs text-slate-400">
              Responsável Técnico: <span className="text-blue-300 font-semibold">{currentUser?.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Product & Quantity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Produto / Ficha Técnica *
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                required
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name} ({p.processHours}h/un)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-center"
                required
              />
            </div>
          </div>

          {/* Process hours and info card */}
          {currentProduct && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-950">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>
                  Tempo unitário: <strong>{currentProduct.processHours}h</strong> | Demanda de carga calculada:
                </span>
              </div>
              <span className="font-mono font-bold text-sm bg-blue-600 text-white px-2.5 py-0.5 rounded-sm">
                {totalProcessHours} horas de fábrica
              </span>
            </div>
          )}

          {/* Sales Order linkage & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Vincular a Pedido de Venda (Opcional)
              </label>
              <select
                value={salesOrderId}
                onChange={e => setSalesOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Nenhum (Produção para Estoque)</option>
                {salesOrders.map(ord => (
                  <option key={ord.id} value={ord.id}>
                    {ord.code} - {ord.customerName} (Entrega: {ord.deliveryDate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Prioridade da Ordem
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média (Normal)</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>

          {/* Dates & Workstation */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Início Programada
              </label>
              <input
                type="date"
                value={plannedStartDate}
                onChange={e => setPlannedStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Data Entrega / Fim
              </label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={e => setPlannedEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Posto de Trabalho
              </label>
              <input
                type="text"
                value={assignedWorkstation}
                onChange={e => setAssignedWorkstation(e.target.value)}
                placeholder="Ex: Solda MIG / Corte CNC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
                required
              />
            </div>
          </div>

          {/* BOM Material Availability Live Preview */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-xs text-slate-700 flex items-center gap-1.5 uppercase">
                <Layers className="w-4 h-4 text-slate-500" />
                Verificação de Viabilidade de Materiais (BOM)
              </span>
              {hasMissingMaterials ? (
                <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1 bg-rose-100 px-2 py-0.5 rounded-sm">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Alerta: Matérias-primas insuficientes em estoque
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Todos os insumos disponíveis para produção
                </span>
              )}
            </div>

            {bomCheck.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                Nenhum componente cadastrado na ficha técnica deste produto.
              </p>
            ) : (
              <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Insumo</th>
                      <th className="p-2 text-right">Necessário</th>
                      <th className="p-2 text-right">Estoque Atual</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bomCheck.map((item, idx) => (
                      <tr key={idx} className={item.status === 'EM_FALTA' ? 'bg-rose-50/60' : ''}>
                        <td className="p-2 font-medium">{item.name}</td>
                        <td className="p-2 text-right font-mono font-semibold">
                          {item.requiredQuantity} {item.unit}
                        </td>
                        <td className="p-2 text-right font-mono text-slate-600">
                          {item.stockAvailable} {item.unit}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                              item.status === 'SUFICIENTE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'CRITICO'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Instruções Técnicas e Observações do PCP
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Instruções de ajuste, lote específico ou exigências do cliente..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            ></textarea>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 text-sm font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Gerando OP...' : 'Emitir Ordem de Produção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
