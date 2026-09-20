import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  ShieldAlert,
  User,
  Hash,
  Briefcase
} from 'lucide-react';
import { MembroRH, RHUser } from '../types';
import { api } from '../utils/apiClient';
import { isPerfilGestorRH } from '../utils/formatters';

interface ModalAlterarSenhaRHProps {
  isOpen: boolean;
  onClose: () => void;
  targetMembro: MembroRH | null;
  usuarioLogado: RHUser | null;
  onSenhaAlterada: (membroId: string, registro?: { alteradoEm?: string; alteradoPor?: string }) => void;
}

export const ModalAlterarSenhaRH: React.FC<ModalAlterarSenhaRHProps> = ({
  isOpen,
  onClose,
  targetMembro,
  usuarioLogado,
  onSenhaAlterada
}) => {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  // Reset states when target changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setMostrarSenhaAtual(false);
      setMostrarNovaSenha(false);
      setMostrarConfirmar(false);
      setErro(null);
      setSucesso(null);
    }
  }, [isOpen, targetMembro]);

  if (!isOpen || !targetMembro) return null;

  // Verificar se o usuário logado está alterando a sua própria senha
  const ehPropriaConta = Boolean(
    usuarioLogado &&
      (usuarioLogado.id === targetMembro.id ||
        (usuarioLogado.matricula && usuarioLogado.matricula.toUpperCase() === targetMembro.matricula.toUpperCase()) ||
        (usuarioLogado.login && usuarioLogado.login.toLowerCase() === targetMembro.login.toLowerCase()))
  );

  // Verificar se o usuário logado possui perfil "Equipe de Gestão de RH"
  const ehGestorRH = isPerfilGestorRH(usuarioLogado);

  // Regra de permissão:
  // Se não for a própria conta e não for gestor de RH, a ação não é permitida
  const permissaoNegada = !ehPropriaConta && !ehGestorRH;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    if (permissaoNegada) {
      setErro('Permissão negada. Apenas usuários com perfil "Equipe de Gestão de RH" podem alterar a senha de outros integrantes.');
      return;
    }

    if (!usuarioLogado) {
      setErro('Sessão de RH expirada ou não identificada. Por favor, refaça o login.');
      return;
    }

    // Validação da senha atual se estiver alterando a própria conta
    if (ehPropriaConta) {
      if (!senhaAtual.trim()) {
        setErro('Por favor, informe sua senha atual para confirmação de identidade.');
        return;
      }
    }

    // Validação da nova senha
    if (!novaSenha.trim()) {
      setErro('Por favor, informe a nova senha.');
      return;
    }

    if (novaSenha.trim().length < 3) {
      setErro('A nova senha deve possuir no mínimo 3 caracteres.');
      return;
    }

    if (novaSenha.trim() !== confirmarSenha.trim()) {
      setErro('A confirmação da senha não confere com a nova senha digitada.');
      return;
    }

    if (ehPropriaConta && senhaAtual.trim() === novaSenha.trim()) {
      setErro('A nova senha deve ser diferente da sua senha atual.');
      return;
    }

    try {
      setSalvando(true);
      const res = await api.alterarSenhaRH({
        id: targetMembro.id,
        solicitante: {
          id: usuarioLogado.id,
          login: usuarioLogado.login,
          matricula: usuarioLogado.matricula,
          nome: usuarioLogado.nome,
          perfil: usuarioLogado.perfil
        },
        senhaAtual: ehPropriaConta ? senhaAtual.trim() : undefined,
        novaSenha: novaSenha.trim()
      });

      setSucesso(res.message || 'Senha alterada com sucesso! O acesso foi atualizado imediatamente.');
      onSenhaAlterada(targetMembro.id, res.registro);

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error('Erro ao alterar senha no modal:', err);
      setErro(err.message || 'Ocorreu um erro ao atualizar a senha. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      id="modal-alterar-senha-rh-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === e.currentTarget && !salvando) {
          onClose();
        }
      }}
    >
      <div
        id="modal-alterar-senha-rh-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {ehPropriaConta ? 'Alterar Minha Senha de Acesso' : 'Definir Senha do Integrante'}
              </h3>
              <p className="text-xs text-slate-400">
                {ehPropriaConta
                  ? 'Atualização de credencial da sua própria conta de RH'
                  : 'Ação autorizada para o perfil Equipe de Gestão de RH'}
              </p>
            </div>
          </div>

          <button
            id="btn-fechar-modal-senha"
            type="button"
            onClick={onClose}
            disabled={salvando}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card do Integrante Selecionado */}
        <div className="px-6 pt-5 pb-2">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {targetMembro.nome}
                  </p>
                  {ehPropriaConta && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3" />
                      Sua Conta
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 font-mono">
                    <Hash className="w-3 h-3 text-slate-400" />
                    {targetMembro.matricula}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-slate-400" />
                    {targetMembro.cargo || 'Gestão de RH'}
                  </span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[11px] font-semibold text-slate-500 block">Perfil</span>
              <span className="text-xs font-bold text-slate-800">
                {targetMembro.perfil || (targetMembro.matricula === 'RH-001' ? 'Equipe de Gestão de RH' : 'Integrante')}
              </span>
            </div>
          </div>
        </div>

        {/* Corpo do Formulário */}
        <div className="p-6 pt-3">
          {permissaoNegada ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 my-2">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">Permissão Exclusiva de Gestão de RH</p>
                <p>
                  Apenas usuários com perfil <strong>“Equipe de Gestão de RH”</strong> possuem permissão para alterar a senha de outros integrantes da equipe.
                </p>
                <p className="text-amber-800">
                  Como integrante, você tem permissão para alterar apenas a <strong>sua própria senha</strong>.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notificação / Banner Informativo */}
              {ehPropriaConta ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>
                    Para alterar a sua senha pessoal, informe sua senha atual e digite a nova credencial.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Definição Autorizada de Senha</span>
                    <span>
                      Como perfil <strong>Equipe de Gestão de RH</strong>, você está definindo a nova senha deste integrante. O novo acesso entrará em vigor imediatamente.
                    </span>
                  </div>
                </div>
              )}

              {/* Mensagem de Erro */}
              {erro && (
                <div
                  id="alerta-erro-senha"
                  className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-700 flex items-start gap-2 animate-in fade-in"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{erro}</span>
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {sucesso && (
                <div
                  id="alerta-sucesso-senha"
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-start gap-2 animate-in fade-in"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{sucesso}</span>
                </div>
              )}

              {/* Campo: Senha Atual (Apenas se for alteração da própria conta) */}
              {ehPropriaConta && (
                <div>
                  <label
                    htmlFor="input-senha-atual"
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                  >
                    Senha Atual *
                  </label>
                  <div className="relative">
                    <input
                      id="input-senha-atual"
                      type={mostrarSenhaAtual ? 'text' : 'password'}
                      value={senhaAtual}
                      onChange={e => setSenhaAtual(e.target.value)}
                      placeholder="Digite sua senha atual de RH"
                      disabled={salvando || Boolean(sucesso)}
                      className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-mono"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
                      disabled={salvando || Boolean(sucesso)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                      title={mostrarSenhaAtual ? 'Ocultar senha' : 'Exibir senha'}
                    >
                      {mostrarSenhaAtual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Campo: Nova Senha */}
              <div>
                <label
                  htmlFor="input-nova-senha"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  {ehPropriaConta ? 'Nova Senha *' : 'Definir Nova Senha para o Integrante *'}
                </label>
                <div className="relative">
                  <input
                    id="input-nova-senha"
                    type={mostrarNovaSenha ? 'text' : 'password'}
                    value={novaSenha}
                    onChange={e => setNovaSenha(e.target.value)}
                    placeholder="Mínimo de 3 caracteres"
                    disabled={salvando || Boolean(sucesso)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-mono"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
                    disabled={salvando || Boolean(sucesso)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                    title={mostrarNovaSenha ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarNovaSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Campo: Confirmar Nova Senha */}
              <div>
                <label
                  htmlFor="input-confirmar-nova-senha"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <input
                    id="input-confirmar-nova-senha"
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => setConfirmarSenha(e.target.value)}
                    placeholder="Repita a nova senha para confirmação"
                    disabled={salvando || Boolean(sucesso)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all font-mono"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    disabled={salvando || Boolean(sucesso)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                    title={mostrarConfirmar ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {mostrarConfirmar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {novaSenha && confirmarSenha && novaSenha !== confirmarSenha && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    As senhas digitadas não coincidem.
                  </p>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  id="btn-cancelar-alterar-senha"
                  type="button"
                  onClick={onClose}
                  disabled={salvando}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  id="btn-salvar-alterar-senha"
                  type="submit"
                  disabled={salvando || Boolean(sucesso)}
                  className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {salvando ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Salvando Senha...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{ehPropriaConta ? 'Salvar Nova Senha' : 'Confirmar e Atualizar Acesso'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {permissaoNegada && (
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
