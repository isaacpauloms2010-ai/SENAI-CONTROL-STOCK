import React, { useState } from 'react';
import { Product, RawMaterial, BomItem } from '../types/index.js';
import { api } from '../services/api.js';
import { X, Plus, Trash2, Layers, AlertCircle, Clock } from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  rawMaterials: RawMaterial[];
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  rawMaterials,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState(product?.code || '');
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || 'Geral');
  const [unit, setUnit] = useState(product?.unit || 'un');
  const [processHours, setProcessHours] = useState<number>(product?.processHours || 1);
  const [salePrice, setSalePrice] = useState<number>(product?.salePrice || 0);
  const [stock, setStock] = useState<number>(product?.stock || 0);
  const [minStock, setMinStock] = useState<number>(product?.minStock || 0);
  const [workstationsStr, setWorkstationsStr] = useState(
    product?.workstations?.join(', ') || 'Corte & Dobra CNC, Solda MIG/TIG, Pintura Eletrostática, Montagem & Embalagem'
  );
  const [bom, setBom] = useState<BomItem[]>(product?.bom || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const addBomRow = () => {
    if (rawMaterials.length === 0) return;
    setBom([...bom, { rawMaterialId: rawMaterials[0].id, quantity: 1, notes: '' }]);
  };

  const removeBomRow = (index: number) => {
    setBom(bom.filter((_, i) => i !== index));
  };

  const updateBomRow = (index: number, field: keyof BomItem, value: any) => {
    const updated = [...bom];
    updated[index] = { ...updated[index], [field]: value };
    setBom(updated);
  };

  const calculateUnitCost = () => {
    return bom.reduce((total, item) => {
      const mat = rawMaterials.find(m => m.id === item.rawMaterialId);
      return total + (mat ? mat.costPrice * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do produto é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const workstations = workstationsStr
        .split(',')
        .map(w => w.trim())
        .filter(w => Boolean(w));

      const payload = {
        code,
        name,
        description,
        category,
        unit,
        processHours: Number(processHours) || 1,
        salePrice: Number(salePrice) || 0,
        stock: Number(stock) || 0,
        minStock: Number(minStock) || 0,
        workstations,
        bom: bom.filter(b => b.rawMaterialId && b.quantity > 0)
      };

      if (product?.id) {
        await api.updateProduct(product.id, payload);
      } else {
        await api.createProduct(payload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar ficha técnica');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div>
            <h3 className="font-bold text-base">
              {product ? 'Editar Ficha Técnica do Produto' : 'Nova Ficha Técnica de Produto'}
            </h3>
            <p className="text-xs text-slate-400">Cadastros de Engenharia, Tempos de Processo e Lista de Materiais (BOM)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Código *</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="PRD-001"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Produto *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Mesa Industrial para Solda..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Categoria</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ex: Mobiliário"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Descrição Técnica</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Especificações mecânicas, dimensões, carga admissível..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            ></textarea>
          </div>

          {/* Process Hours, Sale Price, Stocks */}
          <div className="grid grid-cols-5 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" />
                Tempo Proc. (h) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={processHours}
                onChange={e => setProcessHours(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                required
              />
              <span className="text-[10px] text-slate-500">horas/unidade</span>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Unidade</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="un">un (Unidade)</option>
                <option value="cj">cj (Conjunto)</option>
                <option value="kit">kit (Kit)</option>
                <option value="cx">cx (Caixa)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Preço Venda (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={salePrice}
                onChange={e => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Estoque Acabado</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Estoque Mínimo</label>
              <input
                type="number"
                min="0"
                value={minStock}
                onChange={e => setMinStock(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Roteiro de Postos de Trabalho (separados por vírgula)
            </label>
            <input
              type="text"
              value={workstationsStr}
              onChange={e => setWorkstationsStr(e.target.value)}
              placeholder="Ex: Corte CNC, Dobra, Solda, Pintura, Montagem"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          {/* BOM (Bill of Materials) section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 uppercase">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Estrutura de Produto (BOM - Matérias-Primas por 1 unidade)
                </span>
                <p className="text-[11px] text-slate-500">
                  Custo estimado de insumos por unidade: <strong className="text-slate-800">R$ {calculateUnitCost().toFixed(2)}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={addBomRow}
                className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Insumo
              </button>
            </div>

            {bom.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">
                Nenhum componente vinculado. Clique em "Adicionar Insumo" para compor a receita de fabricação.
              </p>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto">
                {bom.map((item, index) => {
                  const selectedMat = rawMaterials.find(m => m.id === item.rawMaterialId);
                  return (
                    <div key={index} className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-lg text-xs">
                      <select
                        value={item.rawMaterialId}
                        onChange={e => updateBomRow(index, 'rawMaterialId', e.target.value)}
                        className="flex-1 px-2 py-1 bg-slate-50 border border-slate-300 rounded-md font-medium text-xs"
                      >
                        {rawMaterials.map(rm => (
                          <option key={rm.id} value={rm.id}>
                            [{rm.code}] {rm.name} ({rm.unit}) - Estq: {rm.stock} {rm.unit}
                          </option>
                        ))}
                      </select>

                      <div className="w-28 flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={item.quantity}
                          onChange={e => updateBomRow(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-right font-mono font-bold text-xs"
                          placeholder="Qtd"
                        />
                        <span className="text-slate-500 text-[11px]">{selectedMat?.unit || 'un'}</span>
                      </div>

                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={e => updateBomRow(index, 'notes', e.target.value)}
                        placeholder="Parte / Instrução..."
                        className="w-36 px-2 py-1 bg-slate-50 border border-slate-300 rounded-md text-xs text-slate-600"
                      />

                      <button
                        type="button"
                        onClick={() => removeBomRow(index)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                        title="Remover componente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer buttons */}
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
              {isSubmitting ? 'Salvando...' : 'Salvar Ficha Técnica'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
