import React, { useState } from 'react';
import { Supplier } from '../types/index.js';
import { api } from '../services/api.js';
import { Plus, Truck, Edit2, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';

interface SuppliersViewProps {
  suppliers: Supplier[];
  onOpenCreate: () => void;
  onEdit: (supplier: Supplier) => void;
  onRefresh: () => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  onOpenCreate,
  onEdit,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.suppliedProducts && s.suppliedProducts.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o fornecedor "${name}"?`)) return;
    try {
      await api.deleteSupplier(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir fornecedor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-600" />
            Cadastro de Fornecedores Homologados
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de fornecedores de insumos, prazos de entrega (lead times) e canais de contato
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar fornecedor por código, razão social ou material..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map(sup => (
          <div
            key={sup.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {sup.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{sup.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">CNPJ: {sup.cnpj || 'Não informado'}</p>
                </div>
                <div className="space-x-1">
                  <button
                    onClick={() => onEdit(sup)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(sup.id, sup.name)}
                    className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 mt-2">
                <span className="font-semibold text-slate-700 block">Itens / Linha de Fornecimento:</span>
                <p className="text-slate-600 italic">{sup.suppliedProducts || 'Diversos'}</p>
                <div className="pt-1 text-slate-500">
                  Prazo Médio de Entrega: <strong className="text-slate-800">{sup.leadTimeDays} dias</strong>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-600 mt-2">
                {sup.contact && (
                  <div>
                    Contato: <strong className="text-slate-800">{sup.contact}</strong>
                  </div>
                )}
                {sup.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.phone}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
