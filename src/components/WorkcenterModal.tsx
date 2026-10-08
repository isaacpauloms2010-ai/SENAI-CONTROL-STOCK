import React, { useState } from 'react';
import { Workcenter } from '../types/index.js';
import { api } from '../services/api.js';
import { X, AlertCircle } from 'lucide-react';

interface WorkcenterModalProps {
  workcenter?: Workcenter | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const WorkcenterModal: React.FC<WorkcenterModalProps> = ({
  workcenter,
  onClose,
  onSuccess
}) => {
  const [code, setCode] = useState(workcenter?.code || '');
  const [name, setName] = useState(workcenter?.name || '');
  const [machineCount, setMachineCount] = useState<number>(workcenter?.machineCount || 1);
  const [dailyHoursPerMachine, setDailyHoursPerMachine] = useState<number>(workcenter?.dailyHoursPerMachine || 8);
  const [workDaysPerMonth, setWorkDaysPerMonth] = useState<number>(workcenter?.workDaysPerMonth || 22);
  const [efficiencyRate, setEfficiencyRate] = useState<number>(workcenter?.efficiencyRate || 85);
  const [notes, setNotes] = useState(workcenter?.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const nominalMonthlyHours = machineCount * dailyHoursPerMachine * workDaysPerMonth;
  const effectiveMonthlyHours = (nominalMonthlyHours * (efficiencyRate / 100)).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome do posto/máquina é obrigatório');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const payload = {
        code,
        name,
        machineCount: Number(machineCount) || 1,
        dailyHoursPerMachine: Number(dailyHoursPerMachine) || 8,
        workDaysPerMonth: Number(workDaysPerMonth) || 22,
        efficiencyRate: Number(efficiencyRate) || 85,
        notes
      };

      if (workcenter?.id) {
        await api.updateWorkcenter(workcenter.id, payload);
      } else {
        await api.createWorkcenter(payload);
      }

      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao salvar capacidade produtiva');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <h3 className="font-bold text-base">
            {workcenter ? 'Editar Posto de Trabalho / Máquinas' : 'Novo Posto de Trabalho'}
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
                placeholder="POSTO-01"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome do Posto / Célula *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Corte CNC / Solda MIG"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Máquinas / Postos</label>
              <input
                type="number"
                min="1"
                value={machineCount}
                onChange={e => setMachineCount(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Horas/Dia Máquina</label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyHoursPerMachine}
                onChange={e => setDailyHoursPerMachine(parseFloat(e.target.value) || 8)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Dias Úteis/Mês</label>
              <input
                type="number"
                min="1"
                max="31"
                value={workDaysPerMonth}
                onChange={e => setWorkDaysPerMonth(parseInt(e.target.value) || 22)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">Eficiência OEE %</label>
              <input
                type="number"
                min="10"
                max="100"
                value={efficiencyRate}
                onChange={e => setEfficiencyRate(parseInt(e.target.value) || 80)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex justify-between items-center">
            <span>Capacidade Efetiva Líquida Calculada:</span>
            <span className="font-mono font-bold text-sm bg-blue-600 text-white px-2 py-0.5 rounded-sm">
              {effectiveMonthlyHours} horas/mês
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Equipamentos / Observações</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Modelos das máquinas, marcas, capacidade de carga ou limitações..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
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
              {isSubmitting ? 'Salvando...' : 'Salvar Capacidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
