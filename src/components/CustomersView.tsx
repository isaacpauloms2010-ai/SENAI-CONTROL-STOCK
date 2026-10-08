import React, { useState } from 'react';
import { Customer } from '../types/index.js';
import { api } from '../services/api.js';
import { Plus, Users, Edit2, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
  onOpenCreate: () => void;
  onEdit: (customer: Customer) => void;
  onRefresh: () => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onOpenCreate,
  onEdit,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contact && c.contact.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o cliente "${name}"?`)) return;
    try {
      await api.deleteCustomer(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir cliente');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Cadastro de Clientes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão de carteira de clientes corporativos, endereços de entrega e contatos
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Cliente
        </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar cliente por razão social, código ou contato..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCustomers.map(cust => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {cust.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{cust.name}</h3>
                  <p className="text-xs text-slate-500 font-mono">CNPJ/CPF: {cust.cnpjCpf || 'Não informado'}</p>
                </div>
                <div className="space-x-1">
                  <button
                    onClick={() => onEdit(cust)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cust.id, cust.name)}
                    className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-100">
                {cust.contact && (
                  <div>
                    Pessoa de Contato: <strong className="text-slate-800">{cust.contact}</strong>
                  </div>
                )}
                {cust.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.email}</span>
                  </div>
                )}
                {cust.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cust.phone}</span>
                  </div>
                )}
                {cust.address && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{cust.address}</span>
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
