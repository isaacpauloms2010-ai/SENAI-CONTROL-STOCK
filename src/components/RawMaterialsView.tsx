import React, { useState } from 'react';
import { RawMaterial, Supplier } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Plus,
  Package,
  AlertTriangle,
  Edit2,
  Trash2,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2
} from 'lucide-react';

interface RawMaterialsViewProps {
  materials: RawMaterial[];
  suppliers: Supplier[];
  onOpenCreate: () => void;
  onEdit: (material: RawMaterial) => void;
  onRefresh: () => void;
}

export const RawMaterialsView: React.FC<RawMaterialsViewProps> = ({
  materials,
  suppliers,
  onOpenCreate,
  onEdit,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);
  const [adjustDelta, setAdjustDelta] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Recebimento de compra');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const filteredMaterials = materials.filter(
    m =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.location && m.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalInventoryValue = materials.reduce((sum, m) => sum + m.stock * m.costPrice, 0);
  const lowStockCount = materials.filter(m => m.stock <= m.minStock).length;

  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMaterial) return;

    try {
      setIsAdjusting(true);
      await api.adjustStock(adjustingMaterial.id, adjustDelta, adjustReason);
      setAdjustingMaterial(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao ajustar estoque');
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir a matéria-prima "${name}"?`)) return;
    try {
      await api.deleteRawMaterial(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir matéria-prima');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Almoxarifado & Estoque de Matérias-Primas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastros de insumos, níveis de estoque de segurança, custos e fornecedores homologados
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Matéria-Prima
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Total de Itens Cadastrados</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{materials.length} itens</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Itens em Nível Crítico</span>
          <span className={`text-2xl font-black font-mono ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {lowStockCount} item(ns)
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Valor Total em Almoxarifado</span>
          <span className="text-2xl font-black text-slate-900 font-mono">
            R$ {totalInventoryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar insumo por código, descrição ou prateleira..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Descrição da Matéria-Prima</th>
                <th className="p-3 text-center">Unidade</th>
                <th className="p-3 text-right">Estoque Atual</th>
                <th className="p-3 text-right">Estoque Mínimo</th>
                <th className="p-3 text-right">Custo Un.</th>
                <th className="p-3 text-right">Valor Total</th>
                <th className="p-3">Fornecedor</th>
                <th className="p-3">Local Almoxarifado</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                    Nenhum insumo encontrado.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(mat => {
                  const supplier = suppliers.find(s => s.id === mat.supplierId);
                  const isLow = mat.stock <= mat.minStock;

                  return (
                    <tr key={mat.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-mono font-bold text-slate-800">{mat.code}</td>
                      <td className="p-3 font-medium text-slate-900">{mat.name}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{mat.unit}</td>
                      <td className="p-3 text-right font-mono font-black">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm ${
                            isLow ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-900'
                          }`}
                        >
                          {mat.stock} {mat.unit}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {mat.minStock} {mat.unit}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        R$ {mat.costPrice.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-800">
                        R$ {(mat.stock * mat.costPrice).toFixed(2)}
                      </td>
                      <td className="p-3 text-slate-700">
                        {supplier?.name || <span className="text-slate-400 italic">Diversos</span>}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {mat.location || 'Depósito'}
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        <button
                          onClick={() => setAdjustingMaterial(mat)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-[11px] font-semibold transition"
                          title="Lançar entrada ou saída rápida"
                        >
                          Movimentar
                        </button>
                        <button
                          onClick={() => onEdit(mat)}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                          title="Editar matéria-prima"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(mat.id, mat.name)}
                          className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Quick Adjustment Modal */}
      {adjustingMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">Movimentação Manual de Almoxarifado</h3>
              <button onClick={() => setAdjustingMaterial(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleStockAdjustment} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-500 block">Item Selecionado:</span>
                <strong className="text-slate-900 text-sm block">{adjustingMaterial.name}</strong>
                <span className="text-slate-500">
                  Estoque atual: <strong className="font-mono text-slate-800">{adjustingMaterial.stock} {adjustingMaterial.unit}</strong>
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">
                  Quantidade (+ Entrada / - Saída) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={adjustDelta}
                    onChange={e => setAdjustDelta(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm text-center"
                    required
                  />
                  <span className="px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate-600 flex items-center">
                    {adjustingMaterial.unit}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(Math.abs(adjustDelta))}
                    className="flex-1 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-bold"
                  >
                    + Entrada (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustDelta(-Math.abs(adjustDelta))}
                    className="flex-1 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold"
                  >
                    - Saída (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Motivo / Justificativa</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Ex: Recebimento de compra, refugo, inventário..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAdjustingMaterial(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isAdjusting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
                >
                  {isAdjusting ? 'Salvando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
