import { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox,
  SlidersHorizontal,
  RotateCcw,
  Edit3,
  Users,
  Shield,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Calendar,
  Building
} from 'lucide-react';
import { Atestado, DashboardStats, RHUser } from '../types';
import {
  formatarData,
  formatarDataHora,
  getStatusColor
} from '../utils/formatters';
import { api } from '../utils/apiClient';

interface PainelRHProps {
  onVerDetalhes: (atestado: Atestado) => void;
  onAlterarStatus: (atestado: Atestado) => void;
  onAbrirEquipeRH?: () => void;
  usuarioRH?: RHUser | null;
  onVoltarColaborador?: () => void;
  onLogout?: () => void;
}

const SETORES_OPCOES = [
  'Administrativo',
  'Ensaque',
  'Expedição',
  'Manutenção',
  'Outro'
];

export function PainelRH({
  onVerDetalhes,
  onAlterarStatus,
  onAbrirEquipeRH,
  usuarioRH,
  onVoltarColaborador,
  onLogout
}: PainelRHProps) {
  const [atestados, setAtestados] = useState<Atestado[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    recebidos: 0,
    emAnalise: 0,
    aprovados: 0,
    pendentes: 0,
    recusados: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Filters state
  const [busca, setBusca] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [dataInicioFiltro, setDataInicioFiltro] = useState('');
  const [dataFimFiltro, setDataFimFiltro] = useState('');

  // Mobile sidebar state
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  // Fetch data
  const carregarDados = async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    setErro(null);

    try {
      const [dadosAtestados, dadosStats] = await Promise.all([
        api.listarAtestadosRH({
          q: busca.trim(),
          setor: filtroSetor,
          status: filtroStatus,
          dataInicio: dataInicioFiltro,
          dataTermino: dataFimFiltro
        }),
        api.obterStatsRH()
      ]);

      setAtestados(dadosAtestados);
      setStats(dadosStats);
    } catch (err: any) {
      setErro(err.message || 'Erro ao carregar dados do RH.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [filtroSetor, filtroStatus, dataInicioFiltro, dataFimFiltro]);

  const handleBuscar = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    carregarDados();
  };

  const limparFiltros = () => {
    setBusca('');
    setFiltroSetor('todos');
    setFiltroStatus('todos');
    setDataInicioFiltro('');
    setDataFimFiltro('');
    // Trigger direct reload with cleared parameters
    api
      .listarAtestadosRH({
        q: '',
        setor: 'todos',
        status: 'todos',
        dataInicio: '',
        dataTermino: ''
      })
      .then(dados => setAtestados(dados))
      .catch(() => {});
  };

  const temFiltrosAtivos =
    busca.trim() !== '' ||
    filtroSetor !== 'todos' ||
    filtroStatus !== 'todos' ||
    dataInicioFiltro !== '' ||
    dataFimFiltro !== '';

  const handleDownloadArquivo = async (item: Atestado, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.downloadDocumento(item.id, item.nomeArquivo);
    } catch (err) {
      console.error('Falha ao baixar o arquivo:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col md:flex-row text-zinc-950 font-sans antialiased">
      {/* ========================================================================= */}
      {/* MENU LATERAL PRETO / GRAFITE (DESKTOP & TABLET)                          */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0f1115] text-white shrink-0 min-h-screen border-r border-[#1e2229] select-none sticky top-0 h-screen z-20">
        {/* Brand & System Title */}
        <div className="p-6 border-b border-[#1e2229]">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl shadow-xs shrink-0">
              <img
                src="/katoen-natie.png"
                alt="Katoen Natie"
                className="h-8 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-sm tracking-tight block truncate">
                  Gestão de RH
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse shrink-0" />
              </div>
              <p className="text-[11px] text-zinc-400 font-medium truncate">
                Recursos Humanos Katoen Natie
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
          <div>
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Menu Corporativo
            </p>
            <nav className="space-y-1.5">
              {/* Painel de Atestados (Active Item) */}
              <div
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-600/10 text-white font-semibold text-xs border border-red-600/30"
              >
                <div className="w-2 h-2 rounded-full bg-red-600" />
                <Inbox className="w-4 h-4 text-red-500" />
                <span>Painel de Atestados</span>
              </div>

              {/* Equipe de Gestão de RH */}
              {onAbrirEquipeRH && (
                <button
                  id="btn-painel-equipe-rh"
                  type="button"
                  onClick={onAbrirEquipeRH}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 font-medium text-xs transition-colors cursor-pointer text-left group"
                  title="Cadastrar e gerenciar integrantes da Equipe de Gestão de RH"
                >
                  <Users className="w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors" />
                  <span className="truncate">Equipe de Gestão de RH</span>
                </button>
              )}

              {/* Atualizar Dados */}
              <button
                id="btn-atualizar-painel-rh"
                type="button"
                onClick={() => carregarDados(true)}
                disabled={refreshing}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800/60 font-medium text-xs transition-colors cursor-pointer text-left group"
                title="Sincronizar e recarregar dados do painel"
              >
                <RefreshCw
                  className={`w-4 h-4 text-zinc-400 group-hover:text-red-400 transition-colors ${
                    refreshing ? 'animate-spin text-red-500' : ''
                  }`}
                />
                <span>{refreshing ? 'Sincronizando...' : 'Atualizar Dados'}</span>
              </button>
            </nav>
          </div>

          {/* Resumo Rápido de Indicadores no Menu */}
          <div className="p-4 rounded-xl bg-[#15181f] border border-[#222731]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Resumo Operacional
            </p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Total</span>
                <span className="font-bold text-white">{stats.total}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Em Análise</span>
                <span className="font-bold text-white">{stats.emAnalise}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Aprovados</span>
                <span className="font-bold text-emerald-400">{stats.aprovados}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span className="text-zinc-400">Pendentes</span>
                <span className="font-bold text-red-400">{stats.pendentes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Card & Action Footer */}
        <div className="p-4 border-t border-[#1e2229] space-y-3 bg-[#0d0e12]">
          {/* User Info */}
          {usuarioRH && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {usuarioRH.nome ? usuarioRH.nome.charAt(0).toUpperCase() : 'RH'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {usuarioRH.nome}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {usuarioRH.matricula ? `Matrícula: ${usuarioRH.matricula}` : 'Gestão de RH'}
                </p>
              </div>
            </div>
          )}

          {/* Action links */}
          <div className="pt-2 border-t border-zinc-800/80 space-y-1.5">
            {onVoltarColaborador && (
              <button
                id="btn-voltar-colaborador"
                type="button"
                onClick={onVoltarColaborador}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-400" />
                <span>Visão Colaborador</span>
              </button>
            )}

            {onLogout && (
              <button
                id="btn-logout-rh"
                type="button"
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 text-xs font-medium transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair do RH</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE HEADER (SMALL SCREENS)                                             */}
      {/* ========================================================================= */}
      <div className="md:hidden bg-[#0f1115] text-white border-b border-[#1e2229] px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1.5 rounded-lg shadow-xs">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-6 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-extrabold text-white text-xs block leading-none">
              Gestão de RH
            </span>
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">
              Painel Corporativo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAbrirEquipeRH && (
            <button
              type="button"
              onClick={onAbrirEquipeRH}
              className="p-2 text-zinc-300 hover:text-white bg-zinc-800/80 rounded-lg text-xs"
              title="Equipe de Gestão de RH"
            >
              <Users className="w-4 h-4 text-red-400" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuAberto(!mobileMenuAberto)}
            className="p-2 text-zinc-300 hover:text-white bg-zinc-800/80 rounded-lg"
            title="Menu"
          >
            {mobileMenuAberto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuAberto && (
        <div className="md:hidden bg-[#0f1115] text-white border-b border-[#1e2229] p-4 space-y-4">
          <div className="space-y-2">
            {onAbrirEquipeRH && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuAberto(false);
                  onAbrirEquipeRH();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 text-white font-medium text-xs text-left"
              >
                <Users className="w-4 h-4 text-red-400" />
                <span>Equipe de Gestão de RH</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuAberto(false);
                carregarDados(true);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-zinc-800/60 text-white font-medium text-xs text-left"
            >
              <RefreshCw className="w-4 h-4 text-red-400" />
              <span>Atualizar Dados</span>
            </button>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            {onVoltarColaborador && (
              <button
                type="button"
                onClick={onVoltarColaborador}
                className="flex items-center gap-2 text-xs font-medium text-zinc-300"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Visão Colaborador</span>
              </button>
            )}

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-2 text-xs font-bold text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ÁREA DE CONTEÚDO PRINCIPAL (FUNDO BRANCO / CINZA MUITO CLARO)             */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header / Bar */}
        <header className="bg-white border-b border-zinc-200 px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0" />
                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                  Painel de Recursos Humanos
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 font-medium">
                Gestão corporativa, triagem e controle de atestados e declarações médicas Katoen Natie.
              </p>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
              {onAbrirEquipeRH && (
                <button
                  id="btn-header-equipe-rh"
                  type="button"
                  onClick={onAbrirEquipeRH}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-950 hover:bg-black text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Gerenciar integrantes da Equipe de Gestão de RH"
                >
                  <Users className="w-3.5 h-3.5 text-red-500" />
                  <span>Equipe de Gestão de RH</span>
                </button>
              )}

              <button
                id="btn-atualizar-painel-rh-header"
                type="button"
                onClick={() => carregarDados(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="Atualizar dados do sistema"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-zinc-700 ${refreshing ? 'animate-spin text-red-600' : ''}`}
                />
                <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Inner Content Container */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {erro && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{erro}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* INDICADORES DO PAINEL DO RH: ÚNICO PAINEL HORIZONTAL SOFISTICADO       */}
          {/* ===================================================================== */}
          <section
            aria-label="Indicadores de Atestados"
            className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200">
              {/* 1. Total Recebidos */}
              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-zinc-50/60 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Total Recebidos
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                      <Inbox className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                    {stats.total}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2 font-medium leading-relaxed">
                  Quantidade total de atestados recebidos pelo RH.
                </p>
              </div>

              {/* 2. Em Análise */}
              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-zinc-50/60 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Em Análise
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                      <Clock className="w-4 h-4 text-zinc-300" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                    {stats.emAnalise}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2 font-medium leading-relaxed">
                  Atestados que estão sendo analisados pelo RH.
                </p>
              </div>

              {/* 3. Aprovados */}
              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-zinc-50/60 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-700">
                      Aprovados
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 text-white flex items-center justify-center shadow-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-black tracking-tight">
                    {stats.aprovados}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2 font-medium leading-relaxed">
                  Atestados já aprovados pelo RH.
                </p>
              </div>

              {/* 4. Pendentes */}
              <div className="p-5 sm:p-6 flex flex-col justify-between hover:bg-red-50/30 transition-colors">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
                      Pendentes
                    </span>
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center shadow-xs">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">
                    {stats.pendentes}
                  </div>
                </div>
                <p className="text-xs text-zinc-600 mt-2 font-medium leading-relaxed">
                  Atestados que precisam de alguma ação ou ajuste.
                </p>
              </div>
            </div>
          </section>

          {/* ===================================================================== */}
          {/* FILTROS E BUSCA                                                       */}
          {/* ===================================================================== */}
          <section
            aria-label="Filtros e Busca"
            className="bg-white p-5 sm:p-6 rounded-xl border border-zinc-200 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-black">
                <SlidersHorizontal className="w-4 h-4 text-red-600" />
                <span>Filtros e Busca</span>
              </div>

              <span className="text-xs text-zinc-600 font-medium">
                {atestados.length} registro(s) encontrado(s)
              </span>
            </div>

            <form onSubmit={handleBuscar} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                {/* Pesquisar por nome, matrícula ou protocolo */}
                <div className="lg:col-span-4">
                  <label
                    htmlFor="input-busca-rh"
                    className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Pesquisar
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Search className="w-4 h-4" />
                    </span>
                    <input
                      id="input-busca-rh"
                      type="text"
                      placeholder="Pesquisar por nome, matrícula ou protocolo..."
                      value={busca}
                      onChange={e => setBusca(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-zinc-300 text-xs sm:text-sm text-black placeholder:text-zinc-400 focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20 bg-white"
                    />
                  </div>
                </div>

                {/* Filtrar por setor */}
                <div className="lg:col-span-3">
                  <label
                    htmlFor="select-filtro-setor"
                    className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Setor
                  </label>
                  <select
                    id="select-filtro-setor"
                    value={filtroSetor}
                    onChange={e => setFiltroSetor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-xs sm:text-sm text-black bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                  >
                    <option value="todos">Todos os Setores</option>
                    {SETORES_OPCOES.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtrar por status */}
                <div className="lg:col-span-2">
                  <label
                    htmlFor="select-filtro-status"
                    className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="select-filtro-status"
                    value={filtroStatus}
                    onChange={e => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-xs sm:text-sm text-black bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="Recebido">Recebido</option>
                    <option value="Em análise">Em análise</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Recusado">Recusado</option>
                  </select>
                </div>

                {/* Filtrar por data */}
                <div className="lg:col-span-3">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Filtrar por data
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      id="input-filtro-data-inicio"
                      type="date"
                      value={dataInicioFiltro}
                      onChange={e => setDataInicioFiltro(e.target.value)}
                      title="Data Inicial"
                      placeholder="Início"
                      className="w-full px-2 py-2.5 rounded-lg border border-zinc-300 text-xs text-black bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                    />
                    <input
                      id="input-filtro-data-fim"
                      type="date"
                      value={dataFimFiltro}
                      onChange={e => setDataFimFiltro(e.target.value)}
                      title="Data Final"
                      placeholder="Fim"
                      className="w-full px-2 py-2.5 rounded-lg border border-zinc-300 text-xs text-black bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
                    />
                  </div>
                </div>
              </div>

              {/* Botões Buscar e Limpar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-100">
                <div className="text-xs text-zinc-600">
                  {temFiltrosAtivos ? (
                    <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      Filtros ativos
                    </span>
                  ) : (
                    <span>Exibindo todos os atestados</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 ml-auto">
                  {/* Botão Limpar */}
                  <button
                    id="btn-limpar-filtros"
                    type="button"
                    onClick={limparFiltros}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-100 text-zinc-800 text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Limpar</span>
                  </button>

                  {/* Botão Buscar */}
                  <button
                    id="btn-buscar-rh"
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* ===================================================================== */}
          {/* LISTA DE ATESTADOS RECEBIDOS                                           */}
          {/* ===================================================================== */}
          <section
            aria-label="Lista de atestados recebidos"
            className="bg-white rounded-xl border border-zinc-200 shadow-xs overflow-hidden"
          >
            {loading ? (
              <div className="p-16 text-center text-zinc-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-red-600" />
                <p className="text-sm font-medium text-zinc-700">Carregando atestados recebidos...</p>
              </div>
            ) : atestados.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-400 mx-auto flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-black">
                  Nenhum atestado encontrado
                </h3>
                <p className="text-xs text-zinc-600 mt-1">
                  Tente alterar os termos da busca ou ajustar os filtros aplicados.
                </p>
                {temFiltrosAtivos && (
                  <button
                    onClick={limparFiltros}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Limpar todos os filtros</span>
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 bg-[#0f1115] text-[11px] font-bold uppercase tracking-wider text-white">
                        <th className="py-3.5 px-4">Protocolo</th>
                        <th className="py-3.5 px-4">Colaborador</th>
                        <th className="py-3.5 px-4">Setor</th>
                        <th className="py-3.5 px-4">Período / Dias</th>
                        <th className="py-3.5 px-4">Tipo</th>
                        <th className="py-3.5 px-4">Data de envio</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200/80 text-xs">
                      {atestados.map(item => {
                        const colors = getStatusColor(item.status);
                        return (
                          <tr
                            key={item.id}
                            onClick={() => onVerDetalhes(item)}
                            className="hover:bg-zinc-50 transition-colors cursor-pointer group"
                          >
                            {/* Protocolo */}
                            <td className="py-3.5 px-4 font-mono font-bold text-black">
                              {item.protocolo}
                            </td>

                            {/* Colaborador */}
                            <td className="py-3.5 px-4">
                              <span className="font-bold text-black group-hover:text-red-600 transition-colors block">
                                {item.nomeCompleto}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-mono">
                                Matrícula: {item.matricula}
                              </span>
                            </td>

                            {/* Setor */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-900 border border-zinc-200">
                                {item.setor}
                              </span>
                            </td>

                            {/* Período / Dias */}
                            <td className="py-3.5 px-4 text-zinc-900">
                              <span className="font-semibold block text-black">
                                {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-medium">
                                {item.quantidadeDias} {item.quantidadeDias === 1 ? 'dia' : 'dias'}
                              </span>
                            </td>

                            {/* Tipo */}
                            <td className="py-3.5 px-4 text-zinc-800 font-medium">
                              {item.tipoDocumento}
                            </td>

                            {/* Data de envio */}
                            <td className="py-3.5 px-4 text-zinc-600 font-mono text-[11px]">
                              {formatarDataHora(item.dataHoraEnvio)}
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                {item.status}
                              </span>
                            </td>

                            {/* Ações */}
                            <td className="py-3.5 px-4 text-right">
                              <div
                                className="inline-flex items-center gap-1.5"
                                onClick={e => e.stopPropagation()}
                              >
                                <button
                                  id={`btn-ver-${item.id}`}
                                  type="button"
                                  onClick={() => onVerDetalhes(item)}
                                  className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                                  title="Visualizar detalhes"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  id={`btn-download-${item.id}`}
                                  type="button"
                                  onClick={e => handleDownloadArquivo(item, e)}
                                  className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                                  title="Baixar anexo"
                                >
                                  <Download className="w-4 h-4" />
                                </button>

                                <button
                                  id={`btn-alterar-status-${item.id}`}
                                  type="button"
                                  onClick={() => onAlterarStatus(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer ml-1"
                                  title="Alterar status do atestado"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Status</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="lg:hidden divide-y divide-zinc-200">
                  {atestados.map(item => {
                    const colors = getStatusColor(item.status);
                    return (
                      <div
                        key={item.id}
                        onClick={() => onVerDetalhes(item)}
                        className="p-4 space-y-3 hover:bg-zinc-50 active:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-black">
                            {item.protocolo}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                            {item.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-black text-sm">{item.nomeCompleto}</h4>
                          <p className="text-xs text-zinc-600">
                            Matrícula: {item.matricula} • Setor: {item.setor}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-700 bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
                          <div>
                            <span className="text-zinc-500 block text-[11px]">Período:</span>
                            <span className="font-semibold text-black">
                              {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-500 block text-[11px]">Duração:</span>
                            <span className="font-semibold text-black">
                              {item.quantidadeDias} {item.quantidadeDias === 1 ? 'dia' : 'dias'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs text-zinc-500">
                          <span>Envio: {formatarDataHora(item.dataHoraEnvio)}</span>
                          <div
                            className="flex items-center gap-2"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              id={`btn-mobile-download-${item.id}`}
                              type="button"
                              onClick={e => handleDownloadArquivo(item, e)}
                              className="p-2 text-zinc-700 bg-zinc-100 rounded-lg hover:bg-zinc-200 cursor-pointer"
                              title="Baixar anexo"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              id={`btn-mobile-status-${item.id}`}
                              type="button"
                              onClick={() => onAlterarStatus(item)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Alterar Status
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
