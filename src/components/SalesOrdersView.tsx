import React, { useState } from 'react';
import { SalesOrder, Customer, Product } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Plus,
  ShoppingCart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Trash2,
  Edit2,
  Calendar,
  Layers,
  Search
} from 'lucide-react';

interface SalesOrdersViewProps {
  orders: SalesOrder[];
  customers: Customer[];
  products: Product[];
  onOpenCreate: () => void;
  onEdit: (order: SalesOrder) => void;
  onGenerateOp: (order: SalesOrder) => void;
  onRefresh: () => void;
}

export const SalesOrdersView: React.FC<SalesOrdersViewProps> = ({
  orders,
  onOpenCreate,
  onEdit,
  onGenerateOp,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.items.some(i => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (orderId: string, code: string) => {
    if (!confirm(`Deseja excluir o pedido ${code}?`)) return;
    try {
      await api.deleteOrder(orderId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir pedido');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Gestão de Pedidos de Venda & Carteira
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de pedidos de clientes, datas de entrega e emissão integrada de Ordens de Produção
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido de Venda
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, cliente ou item..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {['TODOS', 'PENDENTE', 'EM_PRODUCAO', 'CONCLUIDO', 'CANCELADO'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'TODOS' ? 'Todos os Pedidos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-2 bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500 space-y-2">
            <ShoppingCart className="w-10 h-10 mx-auto text-slate-300" />
            <p className="font-semibold text-sm">Nenhum pedido de venda encontrado.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const totalHours = order.items.reduce(
              (sum, item) => sum + item.quantity * (item.processHoursPerUnit || 1),
              0
            );

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-slate-900">{order.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.priority === 'URGENTE'
                              ? 'bg-rose-100 text-rose-800'
                              : order.priority === 'ALTA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {order.priority}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{order.customerName}</h3>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'CONCLUIDO'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'EM_PRODUCAO'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Data: <strong className="text-slate-800 font-mono">{order.orderDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Entrega: <strong className="text-slate-900 font-mono">{order.deliveryDate}</strong></span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="mt-3 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Itens do Pedido:</span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 last:border-none">
                        <div>
                          <span className="font-semibold text-slate-800">{item.productName}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-1.5">[{item.productCode}]</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-blue-800">{item.quantity} un</span>
                          <span className="text-slate-500 text-[11px] ml-2">
                            R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer and Actions */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">
                      Carga estimada: <strong className="text-slate-800 font-mono">{totalHours.toFixed(1)}h de fábrica</strong>
                    </span>
                    <span className="font-mono font-black text-sm text-slate-900">
                      Total: R$ {order.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="space-x-1.5">
                      <button
                        onClick={() => onEdit(order)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                        title="Editar pedido"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(order.id, order.code)}
                        className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Excluir pedido"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {!order.hasProductionOrder && order.status !== 'CONCLUIDO' ? (
                      <button
                        onClick={() => onGenerateOp(order)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Gerar Ordem de Produção (OP)
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        OP já emitida
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
