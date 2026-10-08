import React, { useState } from 'react';
import { SalesOrder, Customer, Product, OrderItem } from '../types/index.js';
import { api } from '../services/api.js';
import { X, Plus, Trash2, AlertCircle, Clock } from 'lucide-react';

interface SalesOrderModalProps {
  order?: SalesOrder | null;
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export const SalesOrderModal: React.FC<SalesOrderModalProps> = ({
  order,
  customers,
  products,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState(order?.code || '');
  const [customerId, setCustomerId] = useState(order?.customerId || customers[0]?.id || '');
  const [orderDate, setOrderDate] = useState(order?.orderDate || new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(
    order?.deliveryDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    })()
  );
  const [priority, setPriority] = useState<'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'>(order?.priority || 'MEDIA');
  const [notes, setNotes] = useState(order?.notes || '');
  const [items, setItems] = useState<OrderItem[]>(
    order?.items || (products[0] ? [{
      productId: products[0].id,
      productName: products[0].name,
      productCode: products[0].code,
      quantity: 1,
      unitPrice: products[0].salePrice || 500,
      processHoursPerUnit: products[0].processHours || 1
    }] : [])
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addItemRow = () => {
    if (products.length === 0) return;
    const prod = products[0];
    setItems([
      ...items,
      {
        productId: prod.id,
        productName: prod.name,
        productCode: prod.code,
        quantity: 1,
        unitPrice: prod.salePrice || 0,
        processHoursPerUnit: prod.processHours || 1
      }
    ]);
  };

  const removeItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prod.id,
      productName: prod.name,
      productCode: prod.code,
      unitPrice: prod.salePrice || 0,
      processHoursPerUnit: prod.processHours || 1
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].unitPrice = Math.max(0, price);
    setItems(newItems);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const totalHours = items.reduce((sum, item) => sum + item.quantity * item.processHoursPerUnit, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMsg('Selecione um cliente para o pedido');
      return;
    }
    if (items.length === 0) {
      setErrorMsg('Adicione ao menos um produto no pedido');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const customer = customers.find(c => c.id === customerId);
      const payload = {
        code,
        customerId,
        customerName: customer?.name || '',
        orderDate,
        deliveryDate,
        priority,
        notes,
        items,
        totalAmount
      };

      if (order?.id) {
        await api.updateOrder(order.id, payload);
      } else {
        await api.createOrder(payload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar pedido');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h3 className="font-bold text-base">{order ? 'Editar Pedido de Venda' : 'Novo Pedido de Venda'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cliente *</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                required
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.contact || c.cnpjCpf})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média (Normal)</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data do Pedido</label>
              <input
                type="date"
                value={orderDate}
                onChange={e => setOrderDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Data de Entrega Desejada *</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                required
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 uppercase">Itens do Pedido</span>
              <button
                type="button"
                onClick={addItemRow}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Produto
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg text-xs">
                  <select
                    value={item.productId}
                    onChange={e => handleProductChange(idx, e.target.value)}
                    className="flex-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded-md font-medium text-xs"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name}
                      </option>
                    ))}
                  </select>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={e => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-right font-mono font-bold text-xs"
                      title="Quantidade"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={e => handlePriceChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-right font-mono text-xs"
                      title="Preço Unitário R$"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Carga produtiva total calculada: <strong>{totalHours.toFixed(1)} horas</strong></span>
              </div>
              <div className="text-right">
                <span className="text-slate-500">Valor Total: </span>
                <span className="font-mono font-bold text-base text-slate-900">
                  R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Observações do Pedido</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              placeholder="Instruções de faturamento, embalagem especial ou frete..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
