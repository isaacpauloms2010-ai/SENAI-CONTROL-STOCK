import React, { useState } from 'react';
import { api } from '../services/api.js';
import { X, RefreshCw, Download, Database, CheckCircle2, Terminal, BookOpen, Layers } from 'lucide-react';

interface SetupModalProps {
  onClose: () => void;
  onDataReset: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onClose, onDataReset }) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSeed = async () => {
    if (!confirm('Deseja recarregar o banco de dados com os dados de teste iniciais de fábrica (Produtos, BOMs, Matérias-Primas, Pedidos e OPs)?')) {
      return;
    }
    try {
      setIsResetting(true);
      await api.resetSeedData();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        onDataReset();
      }, 1200);
    } catch (err) {
      alert('Erro ao restaurar dados');
    } finally {
      setIsResetting(false);
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = await api.getSystemSnapshot();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manufac-erp-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erro ao exportar dados');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base">Instruções de Setup & Arquitetura do Sistema</h3>
              <p className="text-xs text-slate-400">Guia de execução local, banco de dados persistente e gestão de dados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Quick Actions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-blue-950 flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-600" />
                Dados Iniciais (Seeders) & Persistência Local
              </h4>
              <p className="text-xs text-blue-800 mt-0.5">
                O sistema já inicializa com dados reais de manufatura (fábrica metalmecânica). Você pode restaurar ou exportar a qualquer momento.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportBackup}
                className="px-3 py-1.5 bg-white border border-blue-300 hover:bg-blue-100 text-blue-900 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar JSON
              </button>
              <button
                onClick={handleResetSeed}
                disabled={isResetting}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                {resetSuccess ? 'Restaurado!' : 'Restaurar Dados Teste'}
              </button>
            </div>
          </div>

          {/* Setup Guide */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-600" />
              1. Instruções de Instalação e Execução em Ambiente Local
            </h4>
            <div className="bg-slate-900 text-slate-200 rounded-lg p-4 font-mono text-xs space-y-2 overflow-x-auto">
              <p className="text-slate-400"># 1. Clonar ou extrair o repositório</p>
              <p className="text-emerald-400">cd manufac-erp</p>
              <p className="text-slate-400"># 2. Instalar dependências (Node.js 18+ recomendado)</p>
              <p className="text-emerald-400">npm install</p>
              <p className="text-slate-400"># 3. Iniciar o servidor de desenvolvimento full-stack</p>
              <p className="text-emerald-400">npm run dev</p>
              <p className="text-slate-400"># O sistema estará acessível em http://localhost:3000</p>
            </div>
          </div>

          {/* Architecture Overview */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-600" />
              2. Arquitetura e Persistência de Dados
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Backend & API Express</span>
                <p className="text-slate-600 leading-relaxed">
                  Servidor Node.js com Express montado em <code>server.ts</code> e rotas em <code>server/api.ts</code>.
                  Fornece endpoints RESTful para produtos, matérias-primas, capacidade, pedidos, ordens de produção e relatórios de viabilidade.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Banco de Dados Persistente</span>
                <p className="text-slate-600 leading-relaxed">
                  Gerenciador <code>server/db.ts</code> com persistência atômica em disco no arquivo <code>data/db.json</code>.
                  Suporta gravação com escrita atômica (rename seguro) contra falhas, garantindo integridade e persistência entre reinicializações.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Responsável Técnico em Todas as Telas</span>
                <p className="text-slate-600 leading-relaxed">
                  O profissional logado (ex: Eng. Isaac Paulo) tem sua identidade estampada no cabeçalho fixo, nos laudos de baixa e nas ordens de produção impressas.
                </p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="font-bold text-slate-800 block mb-1">Cálculo de Viabilidade & Baixa</span>
                <p className="text-slate-600 leading-relaxed">
                  O módulo de viabilidade cruza a carga horária demandada contra a capacidade útil das máquinas cadastradas e alerta sobrecarga (&gt;100%) ou falta de materiais (MRP).
                </p>
              </div>
            </div>
          </div>

          {/* Test Dataset Summary */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              3. Dados de Teste Pré-Carregados
            </h4>
            <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
              <li><strong>4 Produtos com Ficha Técnica Completa</strong>: Mesas industriais, estantes pesadas, carrinhos com rodízios e armários de ferramentas com BOM estruturada.</li>
              <li><strong>7 Matérias-Primas</strong>: Tubos de aço, chapas de aço carbono #14, cantoneiras, parafusos M8, tinta epóxi, rodízios industriais e ponteiras.</li>
              <li><strong>4 Postos de Trabalho com Capacidade</strong>: Corte CNC, Solda MIG/TIG, Cabine de Pintura e Montagem Final.</li>
              <li><strong>Pedidos de Venda e Ordens de Produção Ativas</strong>: Incluindo ordens em andamento com alerta de estoque crítico para testar o MRP.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition"
          >
            Fechar Guia
          </button>
        </div>
      </div>
    </div>
  );
};
