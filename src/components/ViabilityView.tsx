import React, { useState } from 'react';
import { ViabilityReport, Product, RawMaterial } from '../types/index.js';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Factory,
  Calculator,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

interface ViabilityViewProps {
  viability: ViabilityReport | null;
  products: Product[];
  rawMaterials: RawMaterial[];
  onOpenCreateOp: () => void;
}

export const ViabilityView: React.FC<ViabilityViewProps> = ({
  viability,
  products,
  rawMaterials,
  onOpenCreateOp
}) => {
  // Simulator State
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || '');
  const [simQuantity, setSimQuantity] = useState<number>(5);

  const selectedProduct = products.find(p => p.id === simProductId);

  // Simulation Calculations
  const simRequiredHours = selectedProduct ? selectedProduct.processHours * simQuantity : 0;
  const currentUtilization = viability?.overallUtilization || 0;
  const availableHours = viability?.availableCapacityHours || 0;
  const totalCapacity = viability?.totalEffectiveHoursMonth || 1;

  const simulatedUtilization = Number(
    (((viability?.totalAllocatedHours || 0) + simRequiredHours) / totalCapacity * 100).toFixed(1)
  );

  const isSimViableInCapacity = simRequiredHours <= availableHours;

  // Simulator BOM Check
  const simBomCheck = selectedProduct?.bom.map(item => {
    const mat = rawMaterials.find(m => m.id === item.rawMaterialId);
    const required = Number((item.quantity * simQuantity).toFixed(2));
    const stock = mat ? mat.stock : 0;
    const hasEnough = stock >= required;
    const deficit = Math.max(0, required - stock);
    return {
      materialName: mat ? mat.name : 'Insumo',
      code: mat ? mat.code : 'N/A',
      unit: mat ? mat.unit : 'un',
      required,
      stock,
      hasEnough,
      deficit
    };
  }) || [];

  const simHasMissingMaterials = simBomCheck.some(b => !b.hasEnough);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Cálculo de Viabilidade Produtiva & Ocupação Fabril
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cruzamento em tempo real entre demanda de horas de ordens ativas versus capacidade das máquinas e postos
          </p>
        </div>
        <button
          onClick={onOpenCreateOp}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-2 self-start md:self-auto"
        >
          <Clock className="w-4 h-4" />
          Emitir Ordem Baseada na Capacidade
        </button>
      </div>

      {/* Main KPI Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Capacidade Total Efetiva</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {viability?.totalEffectiveHoursMonth || 0} h
          </div>
          <span className="text-[11px] text-slate-500">Considerando OEE por posto / mês</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Carga Horária Alocada</span>
          <div className="text-2xl font-black text-blue-700 font-mono">
            {viability?.totalAllocatedHours || 0} h
          </div>
          <span className="text-[11px] text-slate-500">{viability?.activeOrdersCount || 0} ordens de produção ativas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Capacidade Livre Disponível</span>
          <div className="text-2xl font-black text-emerald-700 font-mono">
            {viability?.availableCapacityHours || 0} h
          </div>
          <span className="text-[11px] text-slate-500">Horas restantes no período</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block mb-1">Taxa de Ocupação Geral</span>
          <div
            className={`text-2xl font-black font-mono ${
              currentUtilization > 100
                ? 'text-rose-600'
                : currentUtilization >= 80
                ? 'text-amber-600'
                : 'text-emerald-700'
            }`}
          >
            {currentUtilization}%
          </div>
          <span className="text-[11px] font-semibold">
            {currentUtilization > 100
              ? 'Sobrecarga de Fábrica'
              : currentUtilization >= 80
              ? 'Capacidade no Limite'
              : 'Capacidade Confortável'}
          </span>
        </div>
      </div>

      {/* Workcenters Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Factory className="w-4 h-4 text-blue-600" />
            Análise Individual por Célula / Posto de Trabalho
          </h2>
          <p className="text-xs text-slate-500">
            Identifique gargalos na linha de produção antes que provoquem atrasos nas entregas aos clientes
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Posto de Trabalho</th>
                <th className="p-3 text-center">Postos / Máquinas</th>
                <th className="p-3 text-right">Capacidade Efetiva (h/mês)</th>
                <th className="p-3 text-right">Carga Alocada (h)</th>
                <th className="p-3 text-right">Capacidade Livre (h)</th>
                <th className="p-3 text-center">Utilização (%)</th>
                <th className="p-3 text-center">Diagnóstico do PCP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viability?.workcenters.map(wc => {
                const isOver = wc.status === 'SOBRECARGA';
                const isWarn = wc.status === 'ATENCAO';

                return (
                  <tr key={wc.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-slate-600">{wc.code}</td>
                    <td className="p-3 font-bold text-slate-900">{wc.name}</td>
                    <td className="p-3 text-center font-mono">{wc.machines}</td>
                    <td className="p-3 text-right font-mono text-slate-700">{wc.effectiveMonthlyHours} h</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{wc.allocatedHours} h</td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-semibold">{wc.availableHours} h</td>
                    <td className="p-3 text-center">
                      <div className="font-mono font-bold">{wc.utilizationRate}%</div>
                      <div className="w-16 mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, wc.utilizationRate)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isOver
                            ? 'bg-rose-100 text-rose-800'
                            : isWarn
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOver ? 'GARGALO CRÍTICO' : isWarn ? 'ATENÇÃO' : 'VIÁVEL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator: Interactive Feasibility Test for New Orders */}
      <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-700 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div>
            <h2 className="text-base font-bold flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" />
              Simulador Interativo de Viabilidade de Produção
            </h2>
            <p className="text-xs text-slate-300">
              Teste um novo pedido ou lote antes de firmar compromisso de entrega com o cliente
            </p>
          </div>
          <span className="text-xs bg-blue-600/60 border border-blue-400/40 text-blue-200 px-3 py-1 rounded-full font-semibold">
            Motor de Simulação Ativo
          </span>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
              Selecione o Produto para Simulação
            </label>
            <select
              value={simProductId}
              onChange={e => setSimProductId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white font-medium focus:ring-2 focus:ring-blue-400"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name} — Tempo Unitário: {p.processHours}h
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase text-[11px]">
              Quantidade Simulada (un)
            </label>
            <input
              type="number"
              min="1"
              value={simQuantity}
              onChange={e => setSimQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-xl text-white font-bold text-center font-mono focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Simulation Output Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Capacity Viability Result */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-2">
            <span className="text-slate-400 text-xs block font-semibold uppercase">1. Impacto na Carga de Horas</span>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Demanda Deste Lote:</span>
              <strong className="font-mono text-white">{simRequiredHours.toFixed(1)} horas</strong>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Ocupação Atual:</span>
              <span className="font-mono text-slate-300">{currentUtilization}%</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-700 pt-1.5">
              <span className="text-slate-200 font-semibold">Nova Ocupação Projetada:</span>
              <strong className={`font-mono text-sm ${simulatedUtilization > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {simulatedUtilization}%
              </strong>
            </div>
            <div
              className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                isSimViableInCapacity
                  ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {isSimViableInCapacity ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Capacidade de horas disponível na fábrica.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Excede a capacidade do período. Necessário turno extra.</span>
                </>
              )}
            </div>
          </div>

          {/* BOM Material Feasibility Result */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 space-y-2">
            <span className="text-slate-400 text-xs block font-semibold uppercase">2. Viabilidade de Matérias-Primas</span>
            {simBomCheck.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum componente vinculado.</p>
            ) : (
              <div className="space-y-1 max-h-24 overflow-y-auto text-[11px]">
                {simBomCheck.map((b, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 border-b border-slate-700/50">
                    <span className="truncate max-w-36 text-slate-300">{b.materialName}</span>
                    <span className={`font-mono font-bold ${b.hasEnough ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {b.required} / {b.stock} {b.unit}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div
              className={`p-2 rounded-lg text-[11px] font-bold flex items-center gap-1.5 ${
                !simHasMissingMaterials
                  ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300'
                  : 'bg-rose-950/80 border border-rose-700 text-rose-300'
              }`}
            >
              {!simHasMissingMaterials ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Estoque de insumos suficiente para atender.</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span>Falta matéria-prima. Requisitar compras.</span>
                </>
              )}
            </div>
          </div>

          {/* PCP Conclusion and Recommendation */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <span className="text-slate-400 text-xs block font-semibold uppercase mb-1">
                3. Parecer Técnico do PCP
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {isSimViableInCapacity && !simHasMissingMaterials
                  ? '✅ Lote 100% VIÁVEL. Produção pode ser iniciada imediatamente com baixo risco operacional.'
                  : !isSimViableInCapacity && !simHasMissingMaterials
                  ? '⚠️ Viável em materiais, porém FÁBRICA SOBRECARREGADA. Ajustar prazo de entrega com o cliente ou programar horas extras.'
                  : '❌ LOTE INVIÁVEL NO MOMENTO. Faltam matérias-primas essenciais no estoque antes da liberação.'}
              </p>
            </div>
            <button
              onClick={onOpenCreateOp}
              className="w-full mt-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              Transformar Simulação em OP Real
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
