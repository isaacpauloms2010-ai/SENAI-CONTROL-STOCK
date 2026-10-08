import React from 'react';
import { ProductionOrder, CompanyInfo, Product } from '../types/index.js';
import { Printer, X, CheckSquare, Clock, UserCheck, ShieldAlert, Layers } from 'lucide-react';

interface PrintProductionOrderModalProps {
  order: ProductionOrder;
  product?: Product;
  company: CompanyInfo | null;
  onClose: () => void;
}

export const PrintProductionOrderModal: React.FC<PrintProductionOrderModalProps> = ({
  order,
  product,
  company,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container - hide action buttons when printing */}
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Top Bar - Hidden during print */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-800 text-white border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Printer className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Folha de Ordem de Produção - Chão de Fábrica</h3>
              <p className="text-xs text-slate-400">Pronta para impressão e apontamento físico na linha industrial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir OP (A4)
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Body */}
        <div id="printable-op" className="p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible text-slate-900 bg-white font-sans text-sm">
          {/* Document Header */}
          <div className="border-2 border-slate-900 p-4 mb-4">
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 mb-3">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
                  {company?.name || "METALÚRGICA & MANUFATURA PROGRESSO LTDA."}
                </h1>
                <p className="text-xs text-slate-600">
                  CNPJ: {company?.cnpj || "14.285.932/0001-44"} | Endereço: {company?.address || "Distrito Fabril"}
                </p>
                <p className="text-xs text-slate-600">
                  PCP - Planejamento e Controle da Produção | Contato: {company?.phone || "(47) 3456-7890"}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block border-2 border-slate-900 bg-slate-100 px-3 py-1 font-mono font-black text-lg">
                  {order.code}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Status: <span className="font-bold uppercase">{order.status}</span>
                </div>
              </div>
            </div>

            {/* OP General Details Grid */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="border border-slate-300 p-2 bg-slate-50">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Código do Produto</span>
                <span className="font-mono font-bold text-sm">{order.productCode}</span>
              </div>
              <div className="col-span-2 border border-slate-300 p-2 bg-slate-50">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Descrição do Item</span>
                <span className="font-bold text-sm truncate block">{order.productName}</span>
              </div>
              <div className="border border-slate-300 p-2 bg-slate-50 text-right">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Qtd Programada</span>
                <span className="font-mono font-black text-base text-blue-900">{order.quantity} un</span>
              </div>

              <div className="border border-slate-300 p-2">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Posto Principal</span>
                <span className="font-semibold">{order.assignedWorkstation}</span>
              </div>
              <div className="border border-slate-300 p-2">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Data Início Prevista</span>
                <span className="font-semibold">{order.plannedStartDate || 'N/A'}</span>
              </div>
              <div className="border border-slate-300 p-2">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Data Conclusão Prevista</span>
                <span className="font-semibold">{order.plannedEndDate || 'N/A'}</span>
              </div>
              <div className="border border-slate-300 p-2 text-right">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Carga Prevista</span>
                <span className="font-mono font-bold">{order.totalProcessHours} horas</span>
              </div>

              <div className="col-span-2 border border-slate-300 p-2">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Cliente / Destino</span>
                <span className="font-semibold">{order.customerName || 'Estoque da Fábrica'}</span>
              </div>
              <div className="col-span-2 border border-slate-300 p-2">
                <span className="block font-bold text-slate-500 text-[10px] uppercase">Responsável Técnico Emissor</span>
                <span className="font-bold text-slate-800">{order.technicalResponsible}</span>
              </div>
            </div>
          </div>

          {/* Section: Bill of Materials (BOM) */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1 border-b border-slate-800 pb-1">
              <Layers className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Lista de Materiais Requisitados (BOM / Almoxarifado)
              </h2>
            </div>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="p-1.5 text-left border-r border-slate-300">Cód. MP</th>
                  <th className="p-1.5 text-left border-r border-slate-300">Descrição da Matéria-Prima</th>
                  <th className="p-1.5 text-right border-r border-slate-300">Qtd Prevista</th>
                  <th className="p-1.5 text-center border-r border-slate-300">Unid.</th>
                  <th className="p-1.5 text-center border-r border-slate-300">Status Estoque</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-24">Visto Almox.</th>
                  <th className="p-1.5 text-center w-24">Qtd Real Usada</th>
                </tr>
              </thead>
              <tbody>
                {order.bomRequirements && order.bomRequirements.length > 0 ? (
                  order.bomRequirements.map((item, i) => (
                    <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-1.5 font-mono text-slate-600 border-r border-slate-300">{item.code}</td>
                      <td className="p-1.5 font-medium border-r border-slate-300">{item.name}</td>
                      <td className="p-1.5 text-right font-mono font-bold border-r border-slate-300">{item.requiredQuantity}</td>
                      <td className="p-1.5 text-center border-r border-slate-300">{item.unit}</td>
                      <td className="p-1.5 text-center border-r border-slate-300">
                        <span className={`inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                          item.status === 'SUFICIENTE' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'CRITICO' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-1.5 border-r border-slate-300 text-center">
                        <div className="h-4 border-b border-dotted border-slate-400"></div>
                      </td>
                      <td className="p-1.5 text-center">
                        <div className="h-4 border-b border-dotted border-slate-400"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-2 text-center text-slate-500 italic">
                      Nenhum insumo listado na ficha técnica para esta ordem.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Section: Shop Floor Routing and Workstation Logs */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1 border-b border-slate-800 pb-1">
              <CheckSquare className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800">
                2. Roteiro de Operações e Apontamento Manual de Fábrica
              </h2>
            </div>
            <table className="w-full text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-bold">
                  <th className="p-1.5 text-left border-r border-slate-300 w-12">Seq.</th>
                  <th className="p-1.5 text-left border-r border-slate-300">Operação / Posto</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-24">Data Início</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-24">Data Fim</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-28">Operador / Matrícula</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-20">Qtd Boa</th>
                  <th className="p-1.5 text-center border-r border-slate-300 w-20">Refugo</th>
                  <th className="p-1.5 text-center w-28">Rubrica</th>
                </tr>
              </thead>
              <tbody>
                {['01. Corte & Conformação', '02. Soldagem MIG/TIG', '03. Tratamento & Pintura', '04. Montagem & Embalagem'].map((stage, idx) => (
                  <tr key={idx} className="border-b border-slate-200 h-9">
                    <td className="p-1.5 text-center font-mono border-r border-slate-300">{idx + 1}</td>
                    <td className="p-1.5 font-medium border-r border-slate-300">{stage}</td>
                    <td className="p-1.5 border-r border-slate-300 text-center">___/___/___</td>
                    <td className="p-1.5 border-r border-slate-300 text-center">___/___/___</td>
                    <td className="p-1.5 border-r border-slate-300"></td>
                    <td className="p-1.5 border-r border-slate-300"></td>
                    <td className="p-1.5 border-r border-slate-300"></td>
                    <td className="p-1.5"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section: Quality and Technical Guidelines */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
            <div className="border border-slate-300 p-2.5 bg-slate-50 rounded-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Segurança & Instruções de Processo
              </span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Uso obrigatório de EPI (óculos de proteção, protetor auricular, calçado de segurança com biqueira e luvas de raspa para solda).
                Conferir esquadro e dimensões conforme desenho técnico antes de liberar para o próximo posto.
              </p>
            </div>
            <div className="border border-slate-300 p-2.5 bg-slate-50 rounded-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                Observações Técnicas da Ordem
              </span>
              <p className="text-[11px] text-slate-600 italic">
                {order.notes || "Nenhuma observação especial registrada pelo PCP."}
              </p>
            </div>
          </div>

          {/* Signatures Footer */}
          <div className="pt-6 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-10 border-b border-slate-900 mx-8"></div>
              <p className="font-bold text-slate-900 mt-1">{order.technicalResponsible}</p>
              <p className="text-slate-500 text-[11px]">Responsável Técnico / PCP</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-900 mx-8"></div>
              <p className="font-bold text-slate-900 mt-1">Controle de Qualidade & Liberação</p>
              <p className="text-slate-500 text-[11px]">Inspetor Técnico de Fábrica</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
