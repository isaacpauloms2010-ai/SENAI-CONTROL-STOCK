import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { X, UserCheck, Shield, KeyRound, UserPlus, AlertCircle } from 'lucide-react';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { currentUser, allUsers, switchUser, login, createNewUser } = useAuth();
  const [tab, setTab] = useState<'switch' | 'login' | 'register'>('switch');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('Responsável Técnico PCP');
  const [newCrea, setNewCrea] = useState('CREA/SC ');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Informe o e-mail');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg('');
      await login(email);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha na autenticação');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setErrorMsg('Nome e email são obrigatórios');
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg('');
      await createNewUser({
        name: newName,
        email: newEmail,
        role: newRole,
        crea: newCrea
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao registrar novo técnico');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Identificação do Responsável Técnico</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setTab('switch')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              tab === 'switch'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Trocar Usuário
          </button>
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              tab === 'login'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Login / E-mail
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-3 text-center border-b-2 transition ${
              tab === 'register'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cadastrar Novo
          </button>
        </div>

        <div className="p-6 text-sm">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Selecione o profissional que está operando o sistema para emissão e assinatura de ordens de produção:
              </p>
              <div className="space-y-2">
                {allUsers.map(user => {
                  const isCurrent = currentUser?.id === user.id;
                  return (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user);
                        onClose();
                      }}
                      className={`w-full p-3 rounded-lg border text-left flex items-center justify-between transition ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {user.name}
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-semibold">
                              Ativo
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500">{user.role} • {user.crea || 'Sem registro'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </div>
                      <UserCheck className={`w-5 h-5 ${isCurrent ? 'text-blue-600' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">E-mail do Técnico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="exemplo@manufac.com.br"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-[10px] text-slate-400">Ambiente interno local: senha simplificada</span>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
              >
                {isLoading ? 'Autenticando...' : 'Acessar como Responsável'}
              </button>
            </form>
          )}

          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Eng. Isaac Paulo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">E-mail *</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="isaac@manufac.com.br"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    placeholder="Engenheiro PCP"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Registro CREA/CRQ</label>
                  <input
                    type="text"
                    value={newCrea}
                    onChange={e => setNewCrea(e.target.value)}
                    placeholder="CREA 12345-D"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition"
              >
                {isLoading ? 'Cadastrando...' : 'Cadastrar e Ativar Profissional'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
