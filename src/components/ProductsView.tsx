import React, { useState } from 'react';
import { Product, RawMaterial } from '../types/index.js';
import { api } from '../services/api.js';
import {
  Plus,
  Layers,
  Clock,
  Edit2,
  Trash2,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  Play
} from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  onOpenCreate: () => void;
  onEdit: (product: Product) => void;
  onEmitOp: (product: Product) => void;
  onRefresh: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  rawMaterials,
  onOpenCreate,
  onEdit,
  onEmitOp,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir a ficha técnica de "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir produto');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Fichas Técnicas & Estruturas de Produto (BOM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de produtos acabados, tempos de processo padrão (horas/unidade) e lista de matérias-primas
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Nova Ficha Técnica
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Buscar produto por código, nome ou categoria..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Nome / Descrição</th>
                <th className="p-3 text-center">Tempo Proc.</th>
                <th className="p-3 text-right">Preço de Venda</th>
                <th className="p-3 text-center">Estoque Acabado</th>
                <th className="p-3 text-center">Insumos (BOM)</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    Nenhuma ficha técnica cadastrada.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  const isExpanded = expandedId === prod.id;
                  const isLowStock = prod.stock <= prod.minStock;

                  return (
                    <React.Fragment key={prod.id}>
                      <tr className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono font-bold text-slate-800">{prod.code}</td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{prod.name}</span>
                          <span className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-sm">
                            {prod.processHours} h/{prod.unit}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-slate-800">
                          R$ {prod.salePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded-sm ${
                              isLowStock ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {prod.stock} {prod.unit}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => toggleExpand(prod.id)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 transition"
                          >
                            <span>{prod.bom?.length || 0} itens</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <button
                            onClick={() => onEmitOp(prod)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-2xs"
                            title="Emitir Ordem de Produção deste produto"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Emitir OP
                          </button>
                          <button
                            onClick={() => onEdit(prod)}
                            className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition"
                            title="Editar ficha técnica"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-md transition"
                            title="Excluir produto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>

                      {/* Expandable BOM Row */}
                      {isExpanded && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={7} className="p-4 border-t border-b border-slate-200">
                            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                                <span className="font-bold text-slate-800 uppercase flex items-center gap-1.5 text-[11px]">
                                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                                  Receita / Lista de Materiais Necessários para 1 {prod.unit}:
                                </span>
                                <span className="text-slate-500">
                                  Roteiro de Postos: <strong>{prod.workstations?.join(' ➔ ') || 'Nenhum'}</strong>
                                </span>
                              </div>

                              {prod.bom && prod.bom.length > 0 ? (
                                <table className="w-full text-xs">
                                  <thead>
                                    <tr className="text-slate-500 text-[11px]">
                                      <th className="text-left py-1">Insumo / Matéria-Prima</th>
                                      <th className="text-right py-1">Qtd Unitária</th>
                                      <th className="text-right py-1">Estoque no Almoxarifado</th>
                                      <th className="text-left py-1 pl-4">Instrução / Observação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {prod.bom.map((bItem, bIdx) => {
                                      const mat = rawMaterials.find(m => m.id === bItem.rawMaterialId);
                                      return (
                                        <tr key={bIdx}>
                                          <td className="py-1.5 font-medium text-slate-900">
                                            {mat ? mat.name : 'Insumo não encontrado'}
                                            <span className="font-mono text-slate-400 ml-1">[{mat?.code}]</span>
                                          </td>
                                          <td className="py-1.5 text-right font-mono font-bold text-blue-800">
                                            {bItem.quantity} {mat?.unit || 'un'}
                                          </td>
                                          <td className="py-1.5 text-right font-mono text-slate-600">
                                            {mat?.stock} {mat?.unit || 'un'}
                                          </td>
                                          <td className="py-1.5 pl-4 text-slate-500 italic">
                                            {bItem.notes || '-'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Nenhum componente vinculado na BOM.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
