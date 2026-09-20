import { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Inbox,
  Calendar,
  Building,
  User,
  Hash,
  SlidersHorizontal,
  RotateCcw,
  Edit3,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Atestado, DashboardStats, StatusAtestado, RHUser } from '../types';
import {
  formatarData,
  formatarDataHora,
  formatarTamanhoArquivo,
  getStatusColor
} from '../utils/formatters';
import { api } from '../utils/apiClient';

interface PainelRHProps {
  onVerDetalhes: (atestado: Atestado) => void;
  onAlterarStatus: (atestado: Atestado) => void;
  onAbrirEquipeRH?: () => void;
  usuarioRH?: RHUser | null;
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
  usuarioRH
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
  }, [busca, filtroSetor, filtroStatus, dataInicioFiltro, dataFimFiltro]);

  const limparFiltros = () => {
    setBusca('');
    setFiltroSetor('todos');
    setFiltroStatus('todos');
    setDataInicioFiltro('');
    setDataFimFiltro('');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-xs">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-10 sm:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Painel do Recursos Humanos
            </h1>
            <p className="text-sm text-slate-700 mt-1">
              Gestão corporativa, triagem e controle de atestados e declarações médicas Katoen Natie.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {onAbrirEquipeRH && (
            <button
              id="btn-painel-equipe-rh"
              type="button"
              onClick={onAbrirEquipeRH}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              title="Cadastrar e gerenciar integrantes da Equipe de Gestão de RH"
            >
              <Users className="w-4 h-4 text-red-400" />
              <span>Equipe de Gestão de RH</span>
            </button>
          )}

          <button
            id="btn-atualizar-painel-rh"
            onClick={() => carregarDados(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Atualizando...' : 'Atualizar Dados'}</span>
          </button>
        </div>
      </div>

      {/* PAINEL DE ESTATÍSTICAS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Recebidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Total Recebidos
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-950 mt-3">
            {stats.total}
          </p>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            {stats.recebidos} aguardando início de triagem
          </p>
        </div>

        {/* Em Análise */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Em Análise
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-800 mt-3">
            {stats.emAnalise}
          </p>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Atestados sendo conferidos
          </p>
        </div>

        {/* Aprovados */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Aprovados
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-3">
            {stats.aprovados}
          </p>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Lançados e validados no ponto
          </p>
        </div>

        {/* Pendentes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs border-t-4 border-t-red-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">
              Pendentes
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-red-700 mt-3">
            {stats.pendentes}
          </p>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Aguardando ajuste pelo colaborador
          </p>
        </div>
      </div>

      {/* ÁREA DE FILTROS E PESQUISA */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <SlidersHorizontal className="w-4 h-4 text-red-600" />
            <span>Filtros e Busca</span>
          </div>

          {temFiltrosAtivos && (
            <button
              id="btn-limpar-filtros"
              onClick={limparFiltros}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Pesquisa por nome, matrícula ou protocolo */}
          <div className="lg:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="input-busca-rh"
              type="text"
              placeholder="Pesquisar por nome, matrícula ou protocolo..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            />
          </div>

          {/* Filtro por Setor */}
          <div>
            <select
              id="select-filtro-setor"
              value={filtroSetor}
              onChange={e => setFiltroSetor(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            >
              <option value="todos">Todos os Setores</option>
              {SETORES_OPCOES.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <select
              id="select-filtro-status"
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            >
              <option value="todos">Todos os Status</option>
              <option value="Recebido">Recebido</option>
              <option value="Em análise">Em análise</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Pendente">Pendente</option>
              <option value="Recusado">Recusado</option>
            </select>
          </div>

          {/* Filtro de Período (Data Início) */}
          <div className="flex gap-2">
            <input
              id="input-filtro-data-inicio"
              type="date"
              value={dataInicioFiltro}
              onChange={e => setDataInicioFiltro(e.target.value)}
              placeholder="Data início"
              className="w-full px-2.5 py-2.5 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden focus:border-red-600"
              title="Filtrar por data inicial de afastamento"
            />
          </div>
        </div>

        {/* Quantidade de resultados */}
        <div className="pt-2 text-xs text-slate-700 flex items-center justify-between border-t border-slate-100">
          <span>
            Mostrando <strong>{atestados.length}</strong> atestado(s)
          </span>
          {temFiltrosAtivos && (
            <span className="text-red-600 font-medium">Filtros aplicados</span>
          )}
        </div>
      </div>

      {/* TABELA E LISTA DE ATESTADOS RECEBIDOS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {erro && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{erro}</span>
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-red-600" />
            <p className="text-sm">Carregando atestados recebidos...</p>
          </div>
        ) : atestados.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Nenhum atestado encontrado
            </h3>
            <p className="text-xs text-slate-700 mt-1">
              Tente ajustar os filtros de pesquisa ou aguarde novos envios pelos colaboradores.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    <th className="py-3.5 px-4">Protocolo</th>
                    <th className="py-3.5 px-4">Colaborador</th>
                    <th className="py-3.5 px-4">Setor</th>
                    <th className="py-3.5 px-4">Período / Dias</th>
                    <th className="py-3.5 px-4">Tipo</th>
                    <th className="py-3.5 px-4">Data Envio</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 text-xs">
                  {atestados.map(item => {
                    const colors = getStatusColor(item.status);
                    return (
                      <tr
                        key={item.id}
                        onClick={() => onVerDetalhes(item)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Protocolo */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {item.protocolo}
                        </td>

                        {/* Colaborador & Matrícula */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                            {item.nomeCompleto}
                          </p>
                          <span className="text-[11px] text-slate-700 font-mono">
                            {item.matricula}
                          </span>
                        </td>

                        {/* Setor */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                            {item.setor}
                          </span>
                        </td>

                        {/* Período */}
                        <td className="py-3.5 px-4 text-slate-800">
                          <span className="font-medium">
                            {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}
                          </span>
                          <span className="block text-[11px] text-slate-700">
                            {item.quantidadeDias} {item.quantidadeDias === 1 ? 'dia' : 'dias'}
                          </span>
                        </td>

                        {/* Tipo de Documento */}
                        <td className="py-3.5 px-4 text-slate-700">
                          {item.tipoDocumento}
                        </td>

                        {/* Data Envio */}
                        <td className="py-3.5 px-4 text-slate-700">
                          {formatarDataHora(item.dataHoraEnvio)}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                            {item.status}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="py-3.5 px-4 text-right">
                          <div
                            className="inline-flex items-center gap-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              id={`btn-ver-${item.id}`}
                              onClick={() => onVerDetalhes(item)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Visualizar detalhes e documento"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              id={`btn-download-${item.id}`}
                              onClick={e => handleDownloadArquivo(item, e)}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Baixar documento"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            <button
                              id={`btn-alterar-status-${item.id}`}
                              onClick={() => onAlterarStatus(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
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

            {/* Mobile Cards View */}
            <div className="lg:hidden divide-y divide-slate-200">
              {atestados.map(item => {
                const colors = getStatusColor(item.status);
                return (
                  <div
                    key={item.id}
                    onClick={() => onVerDetalhes(item)}
                    className="p-4 space-y-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {item.protocolo}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                        {item.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.nomeCompleto}</h4>
                      <p className="text-xs text-slate-700">
                        Matrícula: {item.matricula} • Setor: {item.setor}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <span className="text-slate-700 block text-[11px]">Período:</span>
                        <span className="font-semibold text-slate-800">
                          {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-700 block text-[11px]">Dias:</span>
                        <span className="font-semibold text-slate-800">
                          {item.quantidadeDias} {item.quantidadeDias === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-slate-700">
                      <span>Envio: {formatarDataHora(item.dataHoraEnvio)}</span>
                      <div
                        className="flex items-center gap-2"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          id={`btn-mobile-download-${item.id}`}
                          onClick={e => handleDownloadArquivo(item, e)}
                          className="p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          id={`btn-mobile-status-${item.id}`}
                          onClick={() => onAlterarStatus(item)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
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
      </div>
    </div>
  );
}
