import React from 'react';
import { KpiSummary, ViabilityReport, ProductionOrder, RawMaterial, SalesOrder } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Factory,
  Package,
  ShoppingCart,
  TrendingUp,
  Printer,
  ArrowRight,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  kpis: KpiSummary | null;
  viability: ViabilityReport | null;
  productionOrders: ProductionOrder[];
  rawMaterials: RawMaterial[];
  salesOrders: SalesOrder[];
  onNavigate: (view: string) => void;
  onOpenCreateOp: () => void;
  onPrintOp: (op: ProductionOrder) => void;
  onCompleteOp: (op: ProductionOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  viability,
  productionOrders,
  rawMaterials,
  salesOrders,
  onNavigate,
  onOpenCreateOp,
  onPrintOp,
  onCompleteOp
}) => {
  const { currentUser } = useAuth();

  const criticalMaterials = rawMaterials.filter(m => m.stock <= m.minStock);
  const activeOps = productionOrders.filter(op => op.status === 'EM_ANDAMENTO' || op.status === 'PLANEJADA');
  const pendingSalesOrders = salesOrders.filter(o => !o.hasProductionOrder && o.status !== 'CANCELADO');

  const utilizationRate = viability?.overallUtilization || 0;
  const isOverloaded = utilizationRate > 100;
  const isWarning = utilizationRate >= 80 && utilizationRate <= 100;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <Factory className="w-4 h-4" />
            <span>PCP - Planejamento e Controle da Produção</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Painel Geral de Operações Fabris
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Responsável Técnico Ativo: <strong className="text-white">{currentUser?.name}</strong> • {currentUser?.crea || 'CREA Ativo'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('viabilidade')}
            className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-600 transition flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-blue-400" />
            Análise de Viabilidade
          </button>
          <button
            onClick={onOpenCreateOp}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Emitir Nova OP
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Em Andamento */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>OPs em Andamento</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis?.inProgressOps || 0}</div>
          <span className="text-[11px] text-blue-600 font-medium">Em produção na fábrica</span>
        </div>

        {/* Planejadas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>OPs Planejadas</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis?.plannedOps || 0}</div>
          <span className="text-[11px] text-amber-600 font-medium">Aguardando início</span>
        </div>

        {/* Concluídas */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>OPs Concluídas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{kpis?.completedOps || 0}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Baixas finalizadas</span>
        </div>

        {/* Ocupação da Capacidade */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Ocupação Fábrica</span>
            <TrendingUp className={`w-4 h-4 ${isOverloaded ? 'text-rose-600' : isWarning ? 'text-amber-500' : 'text-emerald-600'}`} />
          </div>
          <div className={`text-2xl font-black ${isOverloaded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-900'}`}>
            {utilizationRate}%
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {viability?.totalAllocatedHours || 0}h / {viability?.totalEffectiveHoursMonth || 0}h
          </span>
        </div>

        {/* Alerta de Insumos */}
        <div
          onClick={() => onNavigate('materias-primas')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Estoque Crítico</span>
            <AlertTriangle className={`w-4 h-4 ${criticalMaterials.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-black ${criticalMaterials.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {criticalMaterials.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Insumos no limite</span>
        </div>

        {/* Pedidos Pendentes */}
        <div
          onClick={() => onNavigate('pedidos')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs cursor-pointer hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Pedidos Sem OP</span>
            <ShoppingCart className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{pendingSalesOrders.length}</div>
          <span className="text-[11px] text-purple-600 font-medium">Aguardando emissão</span>
        </div>
      </div>

      {/* Capacity & Critical Stock Alert Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factory Capacity Viability Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Factory className="w-4 h-4 text-blue-600" />
                Viabilidade e Utilização da Capacidade Instalada
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo da carga horária das ordens ativas versus postos de trabalho cadastrados
              </p>
            </div>
            <button
              onClick={() => onNavigate('viabilidade')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              Ver Detalhes
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700">Ocupação Geral da Fábrica:</span>
              <span className={isOverloaded ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-emerald-700 font-bold'}>
                {utilizationRate}% {isOverloaded ? '(SOBRECARGA DETECTADA)' : isWarning ? '(ATENÇÃO)' : '(VIÁVEL)'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-500 ${
                  isOverloaded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, utilizationRate)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>0%</span>
              <span>80% (Alerta)</span>
              <span>100% (Capacidade Máxima)</span>
            </div>
          </div>

          {/* Workcenters Status Mini Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2">Posto de Trabalho</th>
                  <th className="p-2 text-center">Máquinas</th>
                  <th className="p-2 text-right">Capacidade Efetiva</th>
                  <th className="p-2 text-right">Carga Alocada</th>
                  <th className="p-2 text-center">Ocupação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viability?.workcenters.map(wc => (
                  <tr key={wc.id} className="hover:bg-slate-50/60">
                    <td className="p-2 font-medium text-slate-900">{wc.name}</td>
                    <td className="p-2 text-center font-mono">{wc.machines}</td>
                    <td className="p-2 text-right font-mono text-slate-600">{wc.effectiveMonthlyHours}h/mês</td>
                    <td className="p-2 text-right font-mono font-bold text-slate-800">{wc.allocatedHours}h</td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          wc.status === 'SOBRECARGA'
                            ? 'bg-rose-100 text-rose-800'
                            : wc.status === 'ATENCAO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {wc.utilizationRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical Stock Alert Box */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Alertas de Almoxarifado
              </h3>
              <button
                onClick={() => onNavigate('materias-primas')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Ver Todas
              </button>
            </div>

            {criticalMaterials.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nenhum insumo abaixo do estoque de segurança no momento.</span>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">
                  {criticalMaterials.length} matéria(s)-prima(s) atingiram ou estão abaixo do estoque de segurança:
                </p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {criticalMaterials.map(mat => (
                    <div
                      key={mat.id}
                      className="p-2.5 bg-rose-50/70 border border-rose-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-rose-950">{mat.name}</div>
                        <div className="text-[10px] text-rose-700">
                          Estoque Mínimo: {mat.minStock} {mat.unit}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-rose-700 block">
                          {mat.stock} {mat.unit}
                        </span>
                        <span className="text-[10px] bg-rose-200 text-rose-900 px-1.5 py-0.5 rounded-sm font-bold">
                          Repor URGENTE
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('relatorios')}
            className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
          >
            Ver Relatório de Necessidade de Materiais (MRP)
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Production Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Ordens de Produção em Acompanhamento
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhamento de status, apontamento e baixa técnica de ordens de fabricação
            </p>
          </div>
          <button
            onClick={() => onNavigate('ordens')}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            Ver Todas ({productionOrders.length})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {productionOrders.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">
            Nenhuma ordem de produção cadastrada. Clique em "Emitir Nova OP" para iniciar.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-2.5">Código OP</th>
                  <th className="p-2.5">Produto Fabricado</th>
                  <th className="p-2.5 text-center">Qtd / Progresso</th>
                  <th className="p-2.5">Posto de Trabalho</th>
                  <th className="p-2.5 text-center">Prazo Fim</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productionOrders.slice(0, 6).map(op => {
                  const percent = Math.min(100, Math.round(((op.producedQuantity || 0) / (op.quantity || 1)) * 100));
                  return (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-2.5 font-mono font-bold text-slate-800">{op.code}</td>
                      <td className="p-2.5">
                        <span className="font-semibold text-slate-900 block truncate max-w-xs">{op.productName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">[{op.productCode}]</span>
                      </td>
                      <td className="p-2.5 text-center">
                        <div className="font-mono font-bold text-slate-700">
                          {op.producedQuantity} / {op.quantity} un ({percent}%)
                        </div>
                        <div className="w-20 mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${op.status === 'CONCLUIDA' ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-2.5 text-slate-600">{op.assignedWorkstation}</td>
                      <td className="p-2.5 text-center font-mono text-slate-600">{op.plannedEndDate}</td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            op.status === 'CONCLUIDA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : op.status === 'EM_ANDAMENTO'
                              ? 'bg-blue-100 text-blue-800 animate-pulse'
                              : op.status === 'PLANEJADA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {op.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => onPrintOp(op)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition"
                          title="Imprimir Folha de Fábrica"
                        >
                          <Printer className="w-3.5 h-3.5 inline mr-1" />
                          Imprimir
                        </button>
                        {op.status !== 'CONCLUIDA' && (
                          <button
                            onClick={() => onCompleteOp(op)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-semibold transition"
                          >
                            Dar Baixa
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
