import React, { useState } from 'react';
import { ProductionOrder } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { CheckCircle2, AlertTriangle, X, PackageCheck, Layers } from 'lucide-react';

interface CompleteProductionOrderModalProps {
  order: ProductionOrder;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompleteProductionOrderModal: React.FC<CompleteProductionOrderModalProps> = ({
  order,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [producedQuantity, setProducedQuantity] = useState<number>(order.quantity);
  const [note, setNote] = useState<string>('Produção finalizada, inspecionada e aprovada para liberação.');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await api.completeProductionOrder(order.id, {
        responsible: currentUser?.name || 'Responsável Técnico',
        producedQuantity: Number(producedQuantity),
        note
      });

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao realizar baixa da ordem');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-emerald-800 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Baixa & Conclusão de Ordem de Produção</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleComplete} className="p-6 space-y-4 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Ordem de Produção:</span>
              <span className="font-mono font-bold text-slate-800">{order.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Produto Acabado:</span>
              <span className="font-bold text-slate-800">{order.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Quantidade Planejada:</span>
              <span className="font-mono font-bold text-blue-700">{order.quantity} un</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Quantidade Aprovada e Concluída (un) *
            </label>
            <input
              type="number"
              min="1"
              value={producedQuantity}
              onChange={e => setProducedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-base text-slate-900"
              required
            />
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg space-y-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold">
              <PackageCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Ações automáticas executadas nesta baixa:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-800">
              <li>
                {!order.materialsDeducted
                  ? 'Baixa imediata dos insumos e matérias-primas do estoque no almoxarifado conforme a BOM'
                  : 'Insumos já haviam sido requisitados no início da ordem'}
              </li>
              <li>
                Adição de <strong>+{producedQuantity} unidade(s)</strong> no estoque de produtos acabados
              </li>
              <li>
                Assinatura técnica registrada sob o nome de <strong>{currentUser?.name}</strong>
              </li>
            </ul>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Laudo Técnico de Inspeção e Encerramento
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-xs"
              placeholder="Ex: Peças testadas em conformidade com o controle dimensional..."
            ></textarea>
          </div>

          {/* Action buttons */}
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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Processando baixa...' : 'Confirmar Baixa & Concluir OP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
