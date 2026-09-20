import { useState } from 'react';
import { Shield, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowRight, X, ArrowLeft } from 'lucide-react';
import { RHUser } from '../types';
import { api } from '../utils/apiClient';

interface LoginRHModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSucesso: (user: RHUser) => void;
}

export function LoginRHModal({ isOpen, onClose, onLoginSucesso }: LoginRHModalProps) {
  const [modo, setModo] = useState<'login' | 'recuperar'>('login');
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [codigoSeguranca, setCodigoSeguranca] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [erro, setErro] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!login.trim()) {
      setErro('Informe o login de RH.');
      return;
    }
    if (!senha.trim()) {
      setErro('Digite a senha.');
      return;
    }

    try {
      setCarregando(true);
      const user = await api.loginRH(login.trim(), senha.trim());
      onLoginSucesso(user);
    } catch (err: any) {
      setErro(err.message || 'Falha ao autenticar RH.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!login.trim()) {
      setErro('Informe seu login de RH.');
      return;
    }
    if (!codigoSeguranca.trim()) {
      setErro('Informe o código institucional.');
      return;
    }
    if (novaSenha.trim().length < 3) {
      setErro('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    try {
      setCarregando(true);
      const msg = await api.esqueciSenhaRH(login.trim(), codigoSeguranca.trim(), novaSenha.trim());
      setSucessoMsg(msg);
      setSenha(novaSenha.trim());
      setModo('login');
    } catch (err: any) {
      setErro(err.message || 'Falha na validação do código institucional.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Katoen Red branding */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-red-600/90 text-white text-[11px] font-bold uppercase tracking-wider mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Área Administrativa RH</span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white">
            Autenticação do Recursos Humanos
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Acesso restrito para gestão, conferência e validação de atestados médicos.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {erro && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{erro}</span>
            </div>
          )}

          {sucessoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{sucessoMsg}</span>
            </div>
          )}

          {modo === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="rh-input-login" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Matrícula, Login ou E-mail do RH <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="rh-input-login"
                    type="text"
                    required
                    value={login}
                    onChange={e => setLogin(e.target.value)}
                    placeholder="Matrícula, login ou e-mail corporativo"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Integrantes da Equipe de Gestão de RH podem entrar com Matrícula ou E-mail.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="rh-input-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Senha do RH <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setModo('recuperar');
                      setErro(null);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="rh-input-senha"
                    type="password"
                    required
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Digite a senha institucional"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-entrar-rh"
                disabled={carregando}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-70"
              >
                {carregando ? (
                  <span>Validando credenciais...</span>
                ) : (
                  <>
                    <span>ACESSAR PAINEL RH</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRecuperar} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                <KeyRound className="w-4 h-4 text-red-600" />
                <span>Recuperação Segura de Senha RH</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Login de RH <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  placeholder="rh@katoennatie.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Código Institucional <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={codigoSeguranca}
                  onChange={e => setCodigoSeguranca(e.target.value)}
                  placeholder="Código institucional de segurança"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 uppercase"
                />
                <p className="text-[11px] text-slate-700 mt-1">
                  Código padrão do sistema: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">KATOEN-RH-2026</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nova Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirmar Nova Senha <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmarSenha}
                  onChange={e => setConfirmarSenha(e.target.value)}
                  placeholder="Repita a senha"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModo('login');
                    setErro(null);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                >
                  {carregando ? 'Salvando...' : 'Gravar Senha'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar para tela de colaborador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
