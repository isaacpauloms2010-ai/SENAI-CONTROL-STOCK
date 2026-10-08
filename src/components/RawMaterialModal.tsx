import React, { useState } from 'react';
import { RawMaterial, Supplier } from '../types/index.js';
import { api } from '../services/api.js';
import { X, AlertCircle } from 'lucide-react';

interface RawMaterialModalProps {
  material?: RawMaterial | null;
  suppliers: Supplier[];
  onClose: () => void;
  onSuccess: () => void;
}

export const RawMaterialModal: React.FC<RawMaterialModalProps> = ({
  material,
  suppliers,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState(material?.code || '');
  const [name, setName] = useState(material?.name || '');
  const [unit, setUnit] = useState(material?.unit || 'un');
  const [stock, setStock] = useState<number>(material?.stock || 0);
  const [minStock, setMinStock] = useState<number>(material?.minStock || 0);
  const [costPrice, setCostPrice] = useState<number>(material?.costPrice || 0);
  const [supplierId, setSupplierId] = useState(material?.supplierId || suppliers[0]?.id || '');
  const [location, setLocation] = useState(material?.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome da matéria-prima é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        code,
        name,
        unit,
        stock: Number(stock) || 0,
        minStock: Number(minStock) || 0,
        costPrice: Number(costPrice) || 0,
        supplierId,
        location
      };

      if (material?.id) {
        await api.updateRawMaterial(material.id, payload);
      } else {
        await api.createRawMaterial(payload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar matéria-prima');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h3 className="font-bold text-base">
            {material ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
          </h3>
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
                placeholder="MP-101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição do Material *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Chapa Aço #14 ou Tubo 50x50"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Unidade</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="m">m (Metro)</option>
                <option value="m²">m² (Metro Quad.)</option>
                <option value="kg">kg (Quilo)</option>
                <option value="un">un (Unidade)</option>
                <option value="l">l (Litro)</option>
                <option value="cx">cx (Caixa)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estoque Atual</label>
              <input
                type="number"
                step="0.01"
                value={stock}
                onChange={e => setStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Estoque Mín.</label>
              <input
                type="number"
                step="0.01"
                value={minStock}
                onChange={e => setMinStock(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Custo Un. (R$)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={e => setCostPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Fornecedor Associado</label>
              <select
                value={supplierId}
                onChange={e => setSupplierId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              >
                <option value="">Selecione um fornecedor...</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Local Almoxarifado</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Ex: Prateleira B2 / Rack 04"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              />
            </div>
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
              {isSubmitting ? 'Salvando...' : 'Salvar Matéria-Prima'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
