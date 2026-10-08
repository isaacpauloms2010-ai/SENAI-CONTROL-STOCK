import React, { useState } from 'react';
import { ProductionOrder, Product } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Plus,
  Printer,
  CheckCircle2,
  Play,
  Pause,
  Trash2,
  Search,
  Filter,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  History
} from 'lucide-react';

interface ProductionOrdersViewProps {
  orders: ProductionOrder[];
  products: Product[];
  onOpenCreate: () => void;
  onOpenPrint: (order: ProductionOrder) => void;
  onOpenComplete: (order: ProductionOrder) => void;
  onRefresh: () => void;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  orders,
  products,
  onOpenCreate,
  onOpenPrint,
  onOpenComplete,
  onRefresh
}) => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

  const filteredOrders = orders.filter(op => {
    const matchesSearch =
      op.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.customerName && op.customerName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'TODOS' || op.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: ProductionOrder['status'],
    note?: string
  ) => {
    try {
      setIsProcessingId(orderId);
      await api.updateProductionOrderStatus(orderId, {
        status: newStatus,
        responsible: currentUser?.name || 'Responsável Técnico',
        note
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status');
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleDelete = async (orderId: string, code: string) => {
    if (!confirm(`Deseja realmente excluir a ordem de produção ${code}?`)) return;
    try {
      await api.deleteProductionOrder(orderId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir OP');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Ordens de Produção (PCP / Fábrica)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão, acompanhamento em tempo real do chão de fábrica, baixa de estoque e impressão
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Emitir Nova Ordem de Produção
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, produto ou cliente..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 shadow-2xs"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {['TODOS', 'PLANEJADA', 'EM_ANDAMENTO', 'EM_PAUSA', 'CONCLUIDA', 'CANCELADA'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'TODOS' ? 'Todas as OPs' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Production Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <Layers className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">Nenhuma ordem de produção encontrada.</p>
            <p className="text-xs text-slate-400">
              Ajuste os filtros ou clique em "+ Emitir Nova Ordem de Produção" para iniciar a programação.
            </p>
          </div>
        ) : (
          filteredOrders.map(op => {
            const isExpanded = expandedOrderId === op.id;
            const progress = Math.min(100, Math.round(((op.producedQuantity || 0) / (op.quantity || 1)) * 100));

            return (
              <div
                key={op.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition overflow-hidden"
              >
                {/* Main Card Line */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Code, Product and Destination */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-center shrink-0 min-w-20">
                      <span className="block font-mono font-black text-sm text-slate-900">{op.code}</span>
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-sm text-[9px] font-bold mt-1 ${
                          op.priority === 'URGENTE'
                            ? 'bg-rose-100 text-rose-800'
                            : op.priority === 'ALTA'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {op.priority}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{op.productName}</h3>
                        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {op.productCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          Destino: <strong className="text-slate-700">{op.customerName || 'Estoque da Fábrica'}</strong>
                        </span>
                        <span>
                          Posto: <strong className="text-slate-700">{op.assignedWorkstation}</strong>
                        </span>
                        <span>
                          Carga: <strong className="text-slate-700 font-mono">{op.totalProcessHours}h</strong>
                        </span>
                        <span>
                          Prazo: <strong className="text-slate-700 font-mono">{op.plannedEndDate}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Center: Progress */}
                  <div className="w-full md:w-48 text-center shrink-0">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Progresso:</span>
                      <span className="font-mono">
                        {op.producedQuantity} / {op.quantity} un ({progress}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className={`h-full transition-all duration-300 ${
                          op.status === 'CONCLUIDA' ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1.5 ${
                        op.status === 'CONCLUIDA'
                          ? 'bg-emerald-100 text-emerald-800'
                          : op.status === 'EM_ANDAMENTO'
                          ? 'bg-blue-100 text-blue-800'
                          : op.status === 'EM_PAUSA'
                          ? 'bg-amber-100 text-amber-800'
                          : op.status === 'PLANEJADA'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {op.status}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Action buttons based on status */}
                    {op.status === 'PLANEJADA' && (
                      <button
                        onClick={() => handleUpdateStatus(op.id, 'EM_ANDAMENTO', 'Produção iniciada na fábrica')}
                        disabled={isProcessingId === op.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                        title="Iniciar apontamento de produção e baixar insumos"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Iniciar Produção
                      </button>
                    )}

                    {op.status === 'EM_ANDAMENTO' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(op.id, 'EM_PAUSA', 'Linha pausada para ajustes')}
                          disabled={isProcessingId === op.id}
                          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                          title="Pausar ordem"
                        >
                          <Pause className="w-3.5 h-3.5" />
                          Pausar
                        </button>
                        <button
                          onClick={() => onOpenComplete(op)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                          title="Dar baixa e concluir ordem"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Baixar / Concluir
                        </button>
                      </>
                    )}

                    {op.status === 'EM_PAUSA' && (
                      <button
                        onClick={() => handleUpdateStatus(op.id, 'EM_ANDAMENTO', 'Produção retomada')}
                        disabled={isProcessingId === op.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Retomar
                      </button>
                    )}

                    {/* Print OP */}
                    <button
                      onClick={() => onOpenPrint(op)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                      title="Imprimir folha de chão de fábrica (A4)"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Imprimir
                    </button>

                    {/* Expand details toggle */}
                    <button
                      onClick={() => toggleExpand(op.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Ver lista de materiais e histórico"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Delete OP */}
                    <button
                      onClick={() => handleDelete(op.id, op.code)}
                      className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      title="Excluir ordem"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section: BOM & Audit History */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/70 p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* BOM Requirements Table */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px]">
                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                            Matérias-Primas Requisitadas (BOM)
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Status da Baixa: <strong>{op.materialsDeducted ? 'Baixado do Almoxarifado' : 'Pendente de Início'}</strong>
                          </span>
                        </div>

                        {op.bomRequirements && op.bomRequirements.length > 0 ? (
                          <div className="space-y-1.5 max-h-40 overflow-y-auto">
                            {op.bomRequirements.map((bom, bIdx) => (
                              <div
                                key={bIdx}
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                              >
                                <div>
                                  <span className="font-medium text-slate-900 block">{bom.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">[{bom.code}]</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-slate-800">
                                    {bom.requiredQuantity} {bom.unit}
                                  </span>
                                  <span
                                    className={`block text-[9px] font-bold ${
                                      bom.status === 'SUFICIENTE'
                                        ? 'text-emerald-700'
                                        : bom.status === 'CRITICO'
                                        ? 'text-amber-700'
                                        : 'text-rose-700'
                                    }`}
                                  >
                                    Estoque: {bom.stockAvailable} ({bom.status})
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic py-2">Sem componentes listados.</p>
                        )}
                      </div>

                      {/* Technical History & Responsible Log */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px]">
                            <History className="w-3.5 h-3.5 text-purple-600" />
                            Histórico de Apontamentos & Auditoria Técnica
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Resp. Inicial: <strong>{op.technicalResponsible}</strong>
                          </span>
                        </div>

                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {op.history && op.history.length > 0 ? (
                            op.history.map((h, hIdx) => (
                              <div key={hIdx} className="text-[11px] border-l-2 border-blue-500 pl-2 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-slate-800">{h.action}</span>
                                  <span className="text-slate-400 font-mono text-[10px]">{h.date}</span>
                                </div>
                                <div className="text-slate-500">
                                  Por: <strong className="text-slate-700">{h.responsible}</strong>
                                </div>
                                {h.note && <div className="text-slate-600 italic">"{h.note}"</div>}
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 italic py-2">Nenhum evento registrado.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
