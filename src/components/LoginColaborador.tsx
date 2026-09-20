import { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Eye, EyeOff, UserPlus, KeyRound, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { ColaboradorUser } from '../types';
import { api } from '../utils/apiClient';

interface LoginColaboradorProps {
  onLoginSucesso: (user: ColaboradorUser) => void;
  onAbrirLoginRH: () => void;
}

const SETORES_OPCOES = [
  'Administrativo',
  'Ensaque',
  'Expedição',
  'Manutenção',
  'Outro'
];

export function LoginColaborador({ onLoginSucesso, onAbrirLoginRH }: LoginColaboradorProps) {
  const [modo, setModo] = useState<'login' | 'cadastro' | 'recuperar'>('login');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  // Login form state
  const [matricula, setMatricula] = useState('');
  const [senha, setSenha] = useState('');

  // Cadastro form state
  const [cadMatricula, setCadMatricula] = useState('');
  const [cadNome, setCadNome] = useState('');
  const [cadSetor, setCadSetor] = useState('');
  const [cadSenha, setCadSenha] = useState('');
  const [cadConfirmarSenha, setCadConfirmarSenha] = useState('');

  // Recuperação form state
  const [recMatricula, setRecMatricula] = useState('');
  const [recNovaSenha, setRecNovaSenha] = useState('');
  const [recConfirmarSenha, setRecConfirmarSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!matricula.trim()) {
      setErro('Informe sua matrícula.');
      return;
    }
    if (!senha.trim()) {
      setErro('Digite sua senha.');
      return;
    }

    try {
      setCarregando(true);
      const user = await api.loginColaborador(matricula.trim(), senha.trim());
      onLoginSucesso(user);
    } catch (err: any) {
      setErro(err.message || 'Falha ao autenticar.');
    } finally {
      setCarregando(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!cadMatricula.trim()) {
      setErro('Informe sua matrícula corporativa.');
      return;
    }
    if (!cadNome.trim()) {
      setErro('Informe seu nome completo.');
      return;
    }
    if (!cadSetor) {
      setErro('Selecione seu setor de atuação.');
      return;
    }
    if (cadSenha.trim().length < 3) {
      setErro('A senha deve ter no mínimo 3 caracteres.');
      return;
    }
    if (cadSenha !== cadConfirmarSenha) {
      setErro('As senhas digitadas não coincidem.');
      return;
    }

    try {
      setCarregando(true);
      const user = await api.cadastroColaborador({
        matricula: cadMatricula.trim(),
        nomeCompleto: cadNome.trim(),
        setor: cadSetor,
        senha: cadSenha.trim()
      });
      onLoginSucesso(user);
    } catch (err: any) {
      setErro(err.message || 'Falha ao cadastrar.');
    } finally {
      setCarregando(false);
    }
  };

  const handleRecuperarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!recMatricula.trim()) {
      setErro('Informe sua matrícula.');
      return;
    }
    if (recNovaSenha.trim().length < 3) {
      setErro('A nova senha deve ter no mínimo 3 caracteres.');
      return;
    }
    if (recNovaSenha !== recConfirmarSenha) {
      setErro('As senhas digitadas não conferem.');
      return;
    }

    try {
      setCarregando(true);
      const msg = await api.esqueciSenhaColaborador(recMatricula.trim(), recNovaSenha.trim());
      setSucessoMsg(msg);
      setMatricula(recMatricula.trim().toUpperCase());
      setSenha(recNovaSenha.trim());
      setModo('login');
    } catch (err: any) {
      setErro(err.message || 'Falha ao redefinir senha.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col justify-center items-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl shadow-sm border border-slate-200/90 mb-4">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-12 sm:h-14 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white border border-slate-800 text-xs font-semibold mb-3 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Canal Oficial de Entrega de Atestados</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Envio de Atestados
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Faça login para enviar seu documento ou consultar solicitações
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 border-t-4 border-t-red-600">
          {/* Tabs */}
          {modo !== 'recuperar' ? (
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6 border border-slate-200/80">
              <button
                type="button"
                id="tab-login-entrar"
                onClick={() => {
                  setModo('login');
                  setErro(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  modo === 'login'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950 font-medium'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                id="tab-login-criar-acesso"
                onClick={() => {
                  setModo('cadastro');
                  setErro(null);
                }}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  modo === 'cadastro'
                    ? 'bg-white text-slate-950 shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950 font-medium'
                }`}
              >
                Criar acesso
              </button>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-red-600" />
                Redefinir Senha do Colaborador
              </h2>
              <button
                type="button"
                onClick={() => {
                  setModo('login');
                  setErro(null);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
              >
                Voltar ao Login
              </button>
            </div>
          )}

          {/* Feedback Messages */}
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

          {/* Form 1: LOGIN */}
          {modo === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="input-matricula" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Matrícula <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="input-matricula"
                    type="text"
                    required
                    value={matricula}
                    onChange={e => setMatricula(e.target.value)}
                    placeholder="Digite sua matrícula"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors uppercase"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    id="btn-esqueci-senha"
                    onClick={() => {
                      setModo('recuperar');
                      setRecMatricula(matricula);
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
                    id="input-senha"
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-entrar"
                disabled={carregando}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-70"
              >
                {carregando ? (
                  <span>Acessando...</span>
                ) : (
                  <>
                    <span>ENTRAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form 2: CRIAR ACESSO (CADASTRO) */}
          {modo === 'cadastro' && (
            <form onSubmit={handleCadastro} className="space-y-3.5">
              <div>
                <label htmlFor="cad-matricula" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Matrícula <span className="text-red-500">*</span>
                </label>
                <input
                  id="cad-matricula"
                  type="text"
                  required
                  value={cadMatricula}
                  onChange={e => setCadMatricula(e.target.value)}
                  placeholder="Digite sua matrícula"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors uppercase"
                />
              </div>

              <div>
                <label htmlFor="cad-nome" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <input
                  id="cad-nome"
                  type="text"
                  required
                  value={cadNome}
                  onChange={e => setCadNome(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="cad-setor" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Setor <span className="text-red-500">*</span>
                </label>
                <select
                  id="cad-setor"
                  required
                  value={cadSetor}
                  onChange={e => setCadSetor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                >
                  <option value="">Selecione seu setor...</option>
                  {SETORES_OPCOES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="cad-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cad-senha"
                    type="password"
                    required
                    value={cadSenha}
                    onChange={e => setCadSenha(e.target.value)}
                    placeholder="Mín. 3 dígitos"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="cad-confirma-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cad-confirma-senha"
                    type="password"
                    required
                    value={cadConfirmarSenha}
                    onChange={e => setCadConfirmarSenha(e.target.value)}
                    placeholder="Repita a senha"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-cadastrar-entrar"
                disabled={carregando}
                className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-70"
              >
                {carregando ? (
                  <span>Criando acesso...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>CRIAR ACESSO E ENTRAR</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form 3: ESQUECI MINHA SENHA */}
          {modo === 'recuperar' && (
            <form onSubmit={handleRecuperarSenha} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Informe sua matrícula e digite a nova senha desejada para restabelecer seu acesso:
              </p>

              <div>
                <label htmlFor="rec-matricula" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Sua Matrícula <span className="text-red-500">*</span>
                </label>
                <input
                  id="rec-matricula"
                  type="text"
                  required
                  value={recMatricula}
                  onChange={e => setRecMatricula(e.target.value)}
                  placeholder="Digite sua matrícula"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors uppercase"
                />
              </div>

              <div>
                <label htmlFor="rec-nova-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nova Senha <span className="text-red-500">*</span>
                </label>
                <input
                  id="rec-nova-senha"
                  type="password"
                  required
                  value={recNovaSenha}
                  onChange={e => setRecNovaSenha(e.target.value)}
                  placeholder="Mínimo 3 caracteres"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="rec-confirma-senha" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Confirmar Nova Senha <span className="text-red-500">*</span>
                </label>
                <input
                  id="rec-confirma-senha"
                  type="password"
                  required
                  value={recConfirmarSenha}
                  onChange={e => setRecConfirmarSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                >
                  {carregando ? 'Atualizando...' : 'Gravar Nova Senha'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Link to RH */}
        <div className="mt-6 text-center">
          <button
            type="button"
            id="btn-login-ir-rh"
            onClick={onAbrirLoginRH}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 hover:text-white bg-white hover:bg-slate-900 py-2.5 px-4 rounded-xl transition-all border border-slate-300 hover:border-slate-900 shadow-xs cursor-pointer group"
          >
            <Shield className="w-3.5 h-3.5 text-red-600 group-hover:text-red-400 transition-colors" />
            <span>É membro do Recursos Humanos? <strong className="underline underline-offset-2 decoration-red-500">Acesse o Login do RH</strong></span>
          </button>
        </div>
      </div>
    </div>
  );
}
