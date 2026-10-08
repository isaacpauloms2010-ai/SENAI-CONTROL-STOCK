import React, { useState, useEffect } from 'react';
import { ProductionOrder, MrpItem, SalesOrder, ViabilityReport } from '../types/index.js';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import {
  FileText,
  Printer,
  Download,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  ShoppingCart
} from 'lucide-react';

interface ReportsViewProps {
  orders: ProductionOrder[];
  salesOrders: SalesOrder[];
  viability: ViabilityReport | null;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  salesOrders,
  viability
}) => {
  const { currentUser, company } = useAuth();
  const [activeTab, setActiveTab] = useState<'status' | 'mrp' | 'concluidas' | 'pedidos'>('status');
  const [mrpData, setMrpData] = useState<MrpItem[]>([]);
  const [isLoadingMrp, setIsLoadingMrp] = useState(false);

  useEffect(() => {
    if (activeTab === 'mrp') {
      setIsLoadingMrp(true);
      api.getMrpReport()
        .then(res => {
          setMrpData(res);
          setIsLoadingMrp(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoadingMrp(false);
        });
    }
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    if (activeTab === 'status' || activeTab === 'concluidas') {
      csvContent += "Código OP,Produto,Qtd,Progresso %,Posto,Status,Responsável,Prazo Fim\n";
      const list = activeTab === 'concluidas' ? orders.filter(o => o.status === 'CONCLUIDA') : orders;
      list.forEach(op => {
        const pct = Math.round(((op.producedQuantity || 0) / (op.quantity || 1)) * 100);
        csvContent += `"${op.code}","${op.productName}",${op.quantity},"${pct}%","${op.assignedWorkstation}","${op.status}","${op.technicalResponsible}","${op.plannedEndDate}"\n`;
      });
    } else if (activeTab === 'mrp') {
      csvContent += "Código Insumo,Descrição,Unidade,Necessário OPs,Estoque Atual,Déficit/Falta,Status,OPs Afetadas\n";
      mrpData.forEach(m => {
        csvContent += `"${m.material.code}","${m.material.name}","${m.material.unit}",${m.totalRequired},${m.availableStock},${m.shortage},"${m.status}","${m.associatedOps.join('; ')}"\n`;
      });
    } else if (activeTab === 'pedidos') {
      csvContent += "Código Pedido,Cliente,Data Pedido,Data Entrega,Valor Total,Status\n";
      salesOrders.forEach(o => {
        csvContent += `"${o.code}","${o.customerName}","${o.orderDate}","${o.deliveryDate}",${o.totalAmount},"${o.status}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header - hide on print */}
      <div className="print:hidden bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Relatórios Gerenciais & Acompanhamento de Produção
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Emissão de relatórios técnicos de chão de fábrica, MRP e balanço de entregas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Tabs Selector - hide on print */}
      <div className="print:hidden flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'status'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Acompanhamento de Ordens (PCP)
        </button>
        <button
          onClick={() => setActiveTab('mrp')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'mrp'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Necessidade de Materiais (MRP)
        </button>
        <button
          onClick={() => setActiveTab('concluidas')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'concluidas'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Histórico de Baixas & Concluídas
        </button>
        <button
          onClick={() => setActiveTab('pedidos')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'pedidos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Relatório de Pedidos de Venda
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs print:p-0 print:border-none print:shadow-none space-y-6">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-black uppercase text-slate-900 tracking-wide">
              {company?.name || 'Metalúrgica & Manufatura Progresso Ltda.'}
            </h2>
            <p className="text-xs text-slate-600 font-mono">
              CNPJ: {company?.cnpj} | PCP & Engenharia de Produção
            </p>
            <p className="text-xs text-slate-500">
              Emitido em: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs bg-slate-100 font-bold px-3 py-1 rounded border border-slate-300 uppercase">
              {activeTab === 'status' && 'Relatório de Acompanhamento de OPs'}
              {activeTab === 'mrp' && 'Relatório de Necessidade de Materiais (MRP)'}
              {activeTab === 'concluidas' && 'Relatório de Produção Concluída'}
              {activeTab === 'pedidos' && 'Relatório de Carteira de Pedidos'}
            </span>
            <p className="text-xs text-slate-600 mt-1">
              Responsável Técnico: <strong>{currentUser?.name}</strong> ({currentUser?.crea || 'CREA Ativo'})
            </p>
          </div>
        </div>

        {/* Tab 1: General Production Status */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="p-2 border border-slate-200">OP</th>
                  <th className="p-2 border border-slate-200">Produto Fabricado</th>
                  <th className="p-2 text-center border border-slate-200">Qtd</th>
                  <th className="p-2 text-center border border-slate-200">Progresso</th>
                  <th className="p-2 border border-slate-200">Posto de Trabalho</th>
                  <th className="p-2 text-center border border-slate-200">Data Fim</th>
                  <th className="p-2 text-center border border-slate-200">Status</th>
                  <th className="p-2 border border-slate-200">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(op => (
                  <tr key={op.id} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 font-mono font-bold border border-slate-200">{op.code}</td>
                    <td className="p-2 font-medium border border-slate-200">{op.productName}</td>
                    <td className="p-2 text-center font-mono font-bold border border-slate-200">{op.quantity} un</td>
                    <td className="p-2 text-center font-mono border border-slate-200">
                      {Math.round(((op.producedQuantity || 0) / (op.quantity || 1)) * 100)}%
                    </td>
                    <td className="p-2 border border-slate-200">{op.assignedWorkstation}</td>
                    <td className="p-2 text-center font-mono border border-slate-200">{op.plannedEndDate}</td>
                    <td className="p-2 text-center border border-slate-200">
                      <span className="font-bold uppercase text-[10px]">{op.status}</span>
                    </td>
                    <td className="p-2 border border-slate-200">{op.technicalResponsible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Materials Requirements Planning (MRP) */}
        {activeTab === 'mrp' && (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
              O relatório MRP calcula o total de matérias-primas demandadas por todas as ordens planejadas ou em andamento e compara com o estoque físico disponível no almoxarifado, sinalizando itens faltantes.
            </div>

            {isLoadingMrp ? (
              <p className="text-center py-6 text-slate-500">Calculando necessidades de insumos...</p>
            ) : mrpData.length === 0 ? (
              <p className="text-center py-6 text-slate-500 italic">Nenhuma necessidade pendente de insumos.</p>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                    <th className="p-2 border border-slate-200">Cód. MP</th>
                    <th className="p-2 border border-slate-200">Descrição do Insumo</th>
                    <th className="p-2 text-right border border-slate-200">Necessidade (OPs)</th>
                    <th className="p-2 text-right border border-slate-200">Estoque Almox.</th>
                    <th className="p-2 text-right border border-slate-200">Déficit / Falta</th>
                    <th className="p-2 text-center border border-slate-200">Status</th>
                    <th className="p-2 border border-slate-200">OPs Impactadas</th>
                  </tr>
                </thead>
                <tbody>
                  {mrpData.map((item, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-slate-200 ${
                        item.status === 'EM_FALTA' ? 'bg-rose-50/70 font-semibold' : ''
                      }`}
                    >
                      <td className="p-2 font-mono border border-slate-200">{item.material.code}</td>
                      <td className="p-2 border border-slate-200">{item.material.name}</td>
                      <td className="p-2 text-right font-mono font-bold border border-slate-200">
                        {item.totalRequired} {item.material.unit}
                      </td>
                      <td className="p-2 text-right font-mono border border-slate-200">
                        {item.availableStock} {item.material.unit}
                      </td>
                      <td className="p-2 text-right font-mono font-black border border-slate-200 text-rose-700">
                        {item.shortage > 0 ? `${item.shortage} ${item.material.unit}` : '-'}
                      </td>
                      <td className="p-2 text-center border border-slate-200">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                            item.status === 'SUFICIENTE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'CRITICO'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 font-mono text-[11px] border border-slate-200">
                        {item.associatedOps.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Completed Orders & Technical Enclosure History */}
        {activeTab === 'concluidas' && (
          <div className="space-y-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="p-2 border border-slate-200">OP</th>
                  <th className="p-2 border border-slate-200">Produto Concluído</th>
                  <th className="p-2 text-center border border-slate-200">Qtd Entregue</th>
                  <th className="p-2 text-center border border-slate-200">Data Término</th>
                  <th className="p-2 border border-slate-200">Responsável Baixa</th>
                  <th className="p-2 border border-slate-200">Laudo / Observação</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter(o => o.status === 'CONCLUIDA')
                  .map(op => (
                    <tr key={op.id} className="border-b border-slate-200">
                      <td className="p-2 font-mono font-bold border border-slate-200">{op.code}</td>
                      <td className="p-2 font-medium border border-slate-200">{op.productName}</td>
                      <td className="p-2 text-center font-mono font-bold text-emerald-800 border border-slate-200">
                        {op.producedQuantity} un
                      </td>
                      <td className="p-2 text-center font-mono border border-slate-200">{op.actualEndDate || op.plannedEndDate}</td>
                      <td className="p-2 font-semibold border border-slate-200">{op.technicalResponsible}</td>
                      <td className="p-2 text-slate-600 italic border border-slate-200">{op.notes || 'Aprovado'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Sales Orders Report */}
        {activeTab === 'pedidos' && (
          <div className="space-y-4">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="p-2 border border-slate-200">Pedido</th>
                  <th className="p-2 border border-slate-200">Cliente</th>
                  <th className="p-2 text-center border border-slate-200">Data Pedido</th>
                  <th className="p-2 text-center border border-slate-200">Data Entrega</th>
                  <th className="p-2 text-right border border-slate-200">Valor Total</th>
                  <th className="p-2 text-center border border-slate-200">Status</th>
                  <th className="p-2 text-center border border-slate-200">OP Vinculada</th>
                </tr>
              </thead>
              <tbody>
                {salesOrders.map(ord => (
                  <tr key={ord.id} className="border-b border-slate-200">
                    <td className="p-2 font-mono font-bold border border-slate-200">{ord.code}</td>
                    <td className="p-2 font-medium border border-slate-200">{ord.customerName}</td>
                    <td className="p-2 text-center font-mono border border-slate-200">{ord.orderDate}</td>
                    <td className="p-2 text-center font-mono border border-slate-200">{ord.deliveryDate}</td>
                    <td className="p-2 text-right font-mono font-semibold border border-slate-200">
                      R$ {ord.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 text-center border border-slate-200">
                      <span className="font-bold uppercase text-[10px]">{ord.status}</span>
                    </td>
                    <td className="p-2 text-center font-mono border border-slate-200">
                      {ord.hasProductionOrder ? 'SIM (Em Produção)' : 'NÃO'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Technical Validation Signatures on Printed Report */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="h-10 border-b border-slate-900 mx-8"></div>
            <p className="font-bold text-slate-900 mt-1">{currentUser?.name}</p>
            <p className="text-slate-500 text-[11px]">Responsável Técnico pelo Planejamento (PCP)</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-900 mx-8"></div>
            <p className="font-bold text-slate-900 mt-1">Gerência Industrial & Operações</p>
            <p className="text-slate-500 text-[11px]">Diretoria de Manufatura</p>
          </div>
        </div>
      </div>
    </div>
  );
};
