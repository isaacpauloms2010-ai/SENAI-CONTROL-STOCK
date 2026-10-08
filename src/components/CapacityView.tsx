import React from 'react';
import { Workcenter } from '../types/index.js';
import { api } from '../services/api.js';
import { Plus, Factory, Edit2, Trash2, Clock, CheckCircle2 } from 'lucide-react';

interface CapacityViewProps {
  workcenters: Workcenter[];
  onOpenCreate: () => void;
  onEdit: (wc: Workcenter) => void;
  onRefresh: () => void;
}

export const CapacityView: React.FC<CapacityViewProps> = ({
  workcenters,
  onOpenCreate,
  onEdit,
  onRefresh
}) => {
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o posto de trabalho "${name}"?`)) return;
    try {
      await api.deleteWorkcenter(id);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir posto');
    }
  };

  const totalMachines = workcenters.reduce((sum, w) => sum + w.machineCount, 0);
  const totalEffectiveMonthlyHours = workcenters.reduce((sum, w) => {
    const nominal = w.machineCount * w.dailyHoursPerMachine * w.workDaysPerMonth;
    return sum + nominal * (w.efficiencyRate / 100);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Factory className="w-5 h-5 text-blue-600" />
            Parque Fabril & Capacidade Produtiva
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de postos de trabalho, quantidade de máquinas, regimes de turnos e eficiência operacional (OEE)
          </p>
        </div>
        <button
          onClick={onOpenCreate}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Novo Posto de Trabalho
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Células / Postos Cadastrados</span>
          <span className="text-2xl font-black text-slate-900 font-mono">{workcenters.length} células</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Total de Máquinas / Bancadas</span>
          <span className="text-2xl font-black text-blue-700 font-mono">{totalMachines} equipamentos</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Capacidade Líquida Fabril</span>
          <span className="text-2xl font-black text-emerald-700 font-mono">
            {totalEffectiveMonthlyHours.toFixed(1)} h/mês
          </span>
        </div>
      </div>

      {/* Workcenters Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workcenters.map(wc => {
          const nominalMonthly = wc.machineCount * wc.dailyHoursPerMachine * wc.workDaysPerMonth;
          const effectiveMonthly = (nominalMonthly * (wc.efficiencyRate / 100)).toFixed(1);
          const dailyTotalHours = (wc.machineCount * wc.dailyHoursPerMachine * (wc.efficiencyRate / 100)).toFixed(1);

          return (
            <div
              key={wc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {wc.code}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{wc.name}</h3>
                </div>
                <div className="space-x-1">
                  <button
                    onClick={() => onEdit(wc)}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                    title="Editar capacidade"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(wc.id, wc.name)}
                    className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Excluir posto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Máquinas</span>
                  <strong className="text-base font-black text-slate-900 font-mono">{wc.machineCount}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Horas/Dia</span>
                  <strong className="text-base font-black text-slate-900 font-mono">{wc.dailyHoursPerMachine}h</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Dias/Mês</span>
                  <strong className="text-base font-black text-slate-900 font-mono">{wc.workDaysPerMonth}d</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Eficiência OEE</span>
                  <strong className="text-base font-black text-emerald-700 font-mono">{wc.efficiencyRate}%</strong>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-600 block">Capacidade Útil Diária:</span>
                  <strong className="text-slate-900 font-mono">{dailyTotalHours} horas/dia</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-600 block">Capacidade Líquida Período:</span>
                  <strong className="text-blue-900 font-mono text-sm">{effectiveMonthly} horas/mês</strong>
                </div>
              </div>

              {wc.notes && (
                <p className="text-xs text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                  "{wc.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
