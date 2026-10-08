import React, { useState } from 'react';
import { Supplier } from '../types/index.js';
import { api } from '../services/api.js';
import { X, AlertCircle } from 'lucide-react';

interface SupplierModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  supplier,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState(supplier?.code || '');
  const [name, setName] = useState(supplier?.name || '');
  const [contact, setContact] = useState(supplier?.contact || '');
  const [email, setEmail] = useState(supplier?.email || '');
  const [phone, setPhone] = useState(supplier?.phone || '');
  const [address, setAddress] = useState(supplier?.address || '');
  const [cnpj, setCnpj] = useState(supplier?.cnpj || '');
  const [suppliedProducts, setSuppliedProducts] = useState(supplier?.suppliedProducts || '');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(supplier?.leadTimeDays || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('A razão social / nome do fornecedor é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        code,
        name,
        contact,
        email,
        phone,
        address,
        cnpj,
        suppliedProducts,
        leadTimeDays: Number(leadTimeDays) || 5
      };

      if (supplier?.id) {
        await api.updateSupplier(supplier.id, payload);
      } else {
        await api.createSupplier(payload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar fornecedor');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h3 className="font-bold text-base">{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Código</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="FORN-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Razão Social / Nome *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: AçoBrasil S.A."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Pessoa de Contato</label>
              <input
                type="text"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="Ex: Carlos Silva"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">CNPJ</label>
              <input
                type="text"
                value={cnpj}
                onChange={e => setCnpj(e.target.value)}
                placeholder="00.000.000/0001-00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="comercial@fornecedor.com.br"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Telefone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="(00) 0000-0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Produtos Fornecidos</label>
              <input
                type="text"
                value={suppliedProducts}
                onChange={e => setSuppliedProducts(e.target.value)}
                placeholder="Ex: Tubos, chapas e perfis"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Prazo Médio (Dias)</label>
              <input
                type="number"
                min="1"
                value={leadTimeDays}
                onChange={e => setLeadTimeDays(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Endereço Completo</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Rua, número, cidade, UF"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
            />
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
              {isSubmitting ? 'Salvando...' : 'Salvar Fornecedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
