import { useState, useEffect, useMemo } from 'react';
import {
  X,
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Mail,
  Hash,
  Briefcase,
  User,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { MembroRH, RHUser } from '../types';
import { formatarDataHora } from '../utils/formatters';
import { api } from '../utils/apiClient';

interface ModalGestaoEquipeRHProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioLogado: RHUser | null;
  onUsuarioAtualizado?: (usuario: RHUser) => void;
}

export function ModalGestaoEquipeRH({
  isOpen,
  onClose,
  usuarioLogado,
  onUsuarioAtualizado
}: ModalGestaoEquipeRHProps) {
  const [equipe, setEquipe] = useState<MembroRH[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [busca, setBusca] = useState('');

  // Formulário modal (Adicionar / Editar)
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [matricula, setMatricula] = useState('');
  const [cargo, setCargo] = useState('');
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Confirmação de exclusão
  const [membroParaExcluir, setMembroParaExcluir] = useState<MembroRH | null>(null);

  const carregarEquipe = async () => {
    try {
      setCarregando(true);
      setErro(null);
      const data = await api.listarEquipeRH();
      setEquipe(data);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar equipe de RH.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarEquipe();
      setErro(null);
      setSucessoMsg(null);
      setFormAberto(false);
      setMembroParaExcluir(null);
    }
  }, [isOpen]);

  const abrirNovo = () => {
    setEditandoId(null);
    setNome('');
    setMatricula('');
    setCargo('Analista de Recursos Humanos');
    setLogin('');
    setEmail('');
    setSenha('');
    setConfirmarSenha('');
    setAtivo(true);
    setMostrarSenha(false);
    setErro(null);
    setSucessoMsg(null);
    setFormAberto(true);
  };

  const abrirEditar = (m: MembroRH) => {
    setEditandoId(m.id);
    setNome(m.nome);
    setMatricula(m.matricula);
    setCargo(m.cargo || 'Gestão de Recursos Humanos');
    setLogin(m.login);
    setEmail(m.email || m.login);
    setSenha('');
    setConfirmarSenha('');
    setAtivo(m.ativo);
    setMostrarSenha(false);
    setErro(null);
    setSucessoMsg(null);
    setFormAberto(true);
  };

  const fecharFormulario = () => {
    setFormAberto(false);
    setEditandoId(null);
    setErro(null);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucessoMsg(null);

    if (!nome.trim()) {
      setErro('Informe o nome completo do integrante.');
      return;
    }
    if (!matricula.trim()) {
      setErro('Informe a matrícula do integrante de RH.');
      return;
    }
    if (!login.trim()) {
      setErro('Informe o login ou e-mail de acesso do integrante.');
      return;
    }

    if (!editandoId) {
      // Criação exige senha
      if (!senha.trim()) {
        setErro('Informe a senha de acesso para o novo integrante.');
        return;
      }
      if (senha.trim().length < 3) {
        setErro('A senha deve possuir no mínimo 3 caracteres.');
        return;
      }
      if (senha !== confirmarSenha) {
        setErro('A confirmação de senha não coincide com a senha digitada.');
        return;
      }
    } else {
      // Edição: senha opcional
      if (senha.trim() && senha.trim().length < 3) {
        setErro('Caso queira redefinir a senha, utilize no mínimo 3 caracteres.');
        return;
      }
      if (senha.trim() && senha !== confirmarSenha) {
        setErro('A confirmação de senha não coincide com a nova senha digitada.');
        return;
      }
    }

    try {
      setSalvando(true);

      const bodyData: any = {
        id: editandoId || undefined,
        nome: nome.trim(),
        matricula: matricula.trim().toUpperCase(),
        cargo: cargo.trim() || 'Gestão de Recursos Humanos',
        login: login.trim().toLowerCase(),
        email: email.trim() || login.trim().toLowerCase(),
        ativo
      };

      if (senha.trim()) {
        bodyData.senha = senha.trim();
      }

      const data = await api.salvarMembroRH(bodyData, Boolean(editandoId));

      setSucessoMsg(data?.message || 'Integrante salvo com sucesso!');
      await carregarEquipe();

      // Se o usuário logado atualizou o seu próprio cadastro, reflete nos dados da sessão
      if (
        usuarioLogado &&
        (usuarioLogado.id === editandoId ||
          usuarioLogado.login.toLowerCase() === login.trim().toLowerCase() ||
          usuarioLogado.matricula === matricula.trim().toUpperCase())
      ) {
        if (onUsuarioAtualizado && data?.membro) {
          onUsuarioAtualizado({
            ...usuarioLogado,
            nome: data.membro.nome,
            matricula: data.membro.matricula,
            cargo: data.membro.cargo,
            email: data.membro.email,
            login: data.membro.login
          });
        }
      }

      setFormAberto(false);
    } catch (err: any) {
      setErro(err.message || 'Falha ao salvar dados do integrante.');
    } finally {
      setSalvando(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!membroParaExcluir) return;

    try {
      setExcluindoId(membroParaExcluir.id);
      setErro(null);
      setSucessoMsg(null);

      await api.excluirMembroRH(membroParaExcluir.id);

      setSucessoMsg('Integrante removido com sucesso.');
      setMembroParaExcluir(null);
      await carregarEquipe();
    } catch (err: any) {
      setErro(err.message || 'Falha ao remover integrante.');
    } finally {
      setExcluindoId(null);
    }
  };

  const equipeFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return equipe;
    return equipe.filter(
      m =>
        m.nome.toLowerCase().includes(termo) ||
        m.matricula.toLowerCase().includes(termo) ||
        (m.cargo && m.cargo.toLowerCase().includes(termo)) ||
        m.login.toLowerCase().includes(termo) ||
        (m.email && m.email.toLowerCase().includes(termo))
    );
  }, [equipe, busca]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div
        id="modal-gestao-equipe-rh"
        className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho do Modal */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Equipe de Gestão de RH
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                  {equipe.length} {equipe.length === 1 ? 'Integrante' : 'Integrantes'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Controle de acessos, cadastros e permissões administrativas dos integrantes do Recursos Humanos.
              </p>
            </div>
          </div>

          <button
            id="btn-fechar-modal-equipe-rh"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações Globais */}
        {(erro || sucessoMsg) && (
          <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2">
            {erro && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs sm:text-sm text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{erro}</span>
              </div>
            )}
            {sucessoMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs sm:text-sm text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{sucessoMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Barra de Ações: Adicionar + Pesquisa */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por nome, matrícula, cargo ou e-mail..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-atualizar-lista-rh"
              onClick={carregarEquipe}
              disabled={carregando}
              className="p-2 sm:px-3 sm:py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Recarregar lista"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${carregando ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Recarregar</span>
            </button>

            <button
              id="btn-adicionar-membro-rh"
              onClick={abrirNovo}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Adicionar Integrante</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Principal: Lista ou Formulário */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {formAberto ? (
            /* FORMULÁRIO DE CADASTRO / EDIÇÃO */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
                    {editandoId ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {editandoId ? 'Editar Integrante do RH' : 'Cadastrar Novo Integrante de Gestão de RH'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {editandoId
                        ? 'Atualize os dados, credenciais ou permissões de acesso ao sistema do RH.'
                        : 'Preencha os dados. O integrante terá permissão imediata para entrar no Login do RH.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fecharFormulario}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <form onSubmit={handleSalvar} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Nome Completo */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Nome completo do integrante"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>
                  </div>

                  {/* Matrícula de RH */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Matrícula do RH <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={matricula}
                        onChange={e => setMatricula(e.target.value.toUpperCase())}
                        placeholder="Matrícula do integrante no RH"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Poderá ser utilizada para fazer login no Login do RH.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Cargo / Função no RH */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Cargo / Função no RH
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={cargo}
                        onChange={e => setCargo(e.target.value)}
                        placeholder="Cargo ou função no Recursos Humanos"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>
                  </div>

                  {/* Login / E-mail de Acesso */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Login / E-mail de Acesso <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={login}
                        onChange={e => setLogin(e.target.value)}
                        placeholder="E-mail corporativo ou login de acesso"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Senha e Confirmação */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-red-600" />
                      Credenciais de Senha {editandoId ? '(Preencha apenas para alterar)' : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="text-xs text-slate-600 hover:text-red-700 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      {mostrarSenha ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{mostrarSenha ? 'Ocultar' : 'Exibir'} senha</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        {editandoId ? 'Nova Senha (opcional)' : 'Senha de Acesso'} {!editandoId && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        required={!editandoId}
                        value={senha}
                        onChange={e => setSenha(e.target.value)}
                        placeholder={editandoId ? 'Manter a senha atual' : 'Mínimo 3 caracteres'}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Confirmar {editandoId ? 'Nova Senha' : 'Senha'} {!editandoId && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        required={!editandoId || !!senha.trim()}
                        value={confirmarSenha}
                        onChange={e => setConfirmarSenha(e.target.value)}
                        placeholder="Repita a senha digitada"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-600/20 focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Status Ativo / Inativo */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Status de Permissão no RH</span>
                    <span className="text-[11px] text-slate-500">
                      {ativo ? 'Ativo (pode fazer login e operar o sistema do RH)' : 'Inativo (acesso bloqueado ao Login do RH)'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ativo}
                      onChange={e => setAtivo(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {/* Botões de Ação do Formulário */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={fecharFormulario}
                    disabled={salvando}
                    className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    id="btn-salvar-membro-rh"
                    disabled={salvando}
                    className="inline-flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                  >
                    {salvando ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{editandoId ? 'Atualizar Integrante' : 'Concluir Cadastro'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* LISTAGEM DOS INTEGRANTES DA EQUIPE */
            <div className="space-y-3">
              {carregando ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Carregando integrantes da equipe de RH...</p>
                </div>
              ) : equipeFiltrada.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Nenhum integrante encontrado</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {busca ? 'Tente buscar com outros termos.' : 'Cadastre a primeira pessoa na equipe de Gestão de RH.'}
                  </p>
                  {busca && (
                    <button
                      onClick={() => setBusca('')}
                      className="mt-3 text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                    >
                      Limpar filtro de busca
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {equipeFiltrada.map(membro => {
                    const ehUsuarioLogado =
                      usuarioLogado &&
                      (usuarioLogado.id === membro.id ||
                        usuarioLogado.matricula === membro.matricula ||
                        usuarioLogado.login.toLowerCase() === membro.login.toLowerCase());

                    // Gerar iniciais para o avatar
                    const partesNome = membro.nome.trim().split(' ');
                    const iniciais = partesNome.length > 1
                      ? `${partesNome[0][0]}${partesNome[partesNome.length - 1][0]}`.toUpperCase()
                      : membro.nome.substring(0, 2).toUpperCase();

                    return (
                      <div
                        key={membro.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          ehUsuarioLogado
                            ? 'bg-red-50/40 border-red-200 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        {/* Identificação do Integrante */}
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 border border-slate-800 shadow-xs">
                            {iniciais}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-slate-900 text-sm sm:text-base">
                                {membro.nome}
                              </span>

                              {/* Badge de Matrícula */}
                              <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                                <Hash className="w-3 h-3 text-slate-400" />
                                {membro.matricula}
                              </span>

                              {/* Badge de Você se for o logado */}
                              {ehUsuarioLogado && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                                  <ShieldCheck className="w-3 h-3" />
                                  Sua Conta
                                </span>
                              )}

                              {/* Status Ativo/Inativo */}
                              {membro.ativo ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                  Ativo
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                  Inativo
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-x-4 gap-y-1 text-xs text-slate-700 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-slate-700 font-medium">
                                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                                {membro.cargo || 'Gestão de Recursos Humanos'}
                              </span>
                              <span className="flex items-center gap-1 text-slate-700 font-mono">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                {membro.login}
                              </span>
                              {membro.criadoEm && (
                                <span className="text-[11px] text-slate-600 hidden md:inline">
                                  Cadastrado em {formatarDataHora(membro.criadoEm)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Ações: Editar e Excluir */}
                        <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 w-full sm:w-auto justify-end">
                          <button
                            type="button"
                            onClick={() => abrirEditar(membro)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="Editar informações ou redefinir senha"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setMembroParaExcluir(membro)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                            title="Remover integrante da equipe de RH"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-6 py-3.5 bg-slate-100/90 border-t border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              Todos os integrantes desta lista possuem credenciais autorizadas para entrar no <strong>Login do RH</strong>.
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3 py-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

        {/* Modal de Confirmação de Exclusão */}
        {membroParaExcluir && (
          <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900">
                  Remover integrante do RH?
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Tem certeza que deseja remover <strong>{membroParaExcluir.nome}</strong> (Matrícula: {membroParaExcluir.matricula}) da Equipe de Gestão de RH?
                </p>
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  Essa pessoa perderá imediatamente o acesso às funções administrativas do RH.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMembroParaExcluir(null)}
                  disabled={!!excluindoId}
                  className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirmar-remover-membro-rh"
                  onClick={handleConfirmarExclusao}
                  disabled={!!excluindoId}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {excluindoId ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Removendo...</span>
                    </>
                  ) : (
                    <span>Confirmar Remoção</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
