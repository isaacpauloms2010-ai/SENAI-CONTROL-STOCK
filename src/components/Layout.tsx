import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Factory,
  LayoutDashboard,
  Clock,
  TrendingUp,
  ShoppingCart,
  Layers,
  Package,
  Cpu,
  Truck,
  Users,
  FileText,
  UserCheck,
  Shield,
  HelpCircle,
  RefreshCw,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface LayoutProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenLogin: () => void;
  onOpenSetup: () => void;
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  onOpenLogin,
  onOpenSetup,
  children
}) => {
  const { currentUser, company } = useAuth();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: LayoutDashboard },
    { id: 'ordens', label: 'Ordens de Produção (PCP)', icon: Clock },
    { id: 'viabilidade', label: 'Viabilidade Produtiva', icon: TrendingUp },
    { id: 'pedidos', label: 'Pedidos de Venda', icon: ShoppingCart },
    { id: 'produtos', label: 'Fichas Técnicas (BOM)', icon: Layers },
    { id: 'materias-primas', label: 'Almoxarifado & Insumos', icon: Package },
    { id: 'capacidade', label: 'Capacidade & Máquinas', icon: Cpu },
    { id: 'fornecedores', label: 'Fornecedores', icon: Truck },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'relatorios', label: 'Relatórios & MRP', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Header - Fixed & Prominent Technical Responsible Badge on ALL Screens */}
      <header className="print:hidden sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Company Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-black tracking-wider">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">ManufacERP</span>
                <span className="text-[10px] bg-blue-950 border border-blue-800 text-blue-300 px-1.5 py-0.5 rounded font-mono font-bold">
                  PCP v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                {company?.name || "Metalúrgica & Manufatura Progresso"}
              </p>
            </div>
          </div>

          {/* Center/Right: Technical Responsible Badge (Mandatory Requirement) */}
          <div className="flex items-center gap-3">
            {/* Responsável Técnico Pill */}
            <div
              onClick={onOpenLogin}
              className="bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl px-3.5 py-1.5 cursor-pointer transition flex items-center gap-2.5 shadow-2xs group"
              title="Clique para trocar de usuário ou autenticar novo responsável técnico"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-xs">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <span>Responsável Técnico:</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="font-bold text-xs text-white group-hover:text-blue-300 transition flex items-center gap-1">
                  <span>{currentUser?.name || 'Não identificado'}</span>
                  {currentUser?.crea && (
                    <span className="text-[10px] text-slate-400 font-normal font-mono">
                      ({currentUser.crea})
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Setup / Instructions button */}
            <button
              onClick={onOpenSetup}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              title="Instruções de setup, arquitetura e restauração de dados"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Setup & Dados</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Bar */}
        <nav className="border-t border-slate-800/80 bg-slate-900/95 overflow-x-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 py-1.5">
            {navigationItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="print:hidden border-t border-slate-200 bg-white py-4 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>ManufacERP</strong> • Sistema de Planejamento e Controle da Produção (PCP) Industrial
          </div>
          <div className="flex items-center gap-4">
            <span>
              Resp. Técnico: <strong className="text-slate-700">{currentUser?.name}</strong>
            </span>
            <span>•</span>
            <button onClick={onOpenSetup} className="hover:text-blue-600 underline">
              Guia de Setup e Testes
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
