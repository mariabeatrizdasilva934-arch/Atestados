import { useState, useEffect } from 'react';
import { Search, X, Loader2, AlertCircle, Calendar, Hash, FileText, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import { ConsultaMatriculaItem } from '../types';
import { formatarData, formatarDataHora, getStatusColor } from '../utils/formatters';
import { api } from '../utils/apiClient';

interface ConsultaMatriculaModalProps {
  isOpen: boolean;
  onClose: () => void;
  matriculaInicial?: string;
}

export function ConsultaMatriculaModal({ isOpen, onClose, matriculaInicial }: ConsultaMatriculaModalProps) {
  const [matriculaInput, setMatriculaInput] = useState(matriculaInicial || '');
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<ConsultaMatriculaItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && matriculaInicial) {
      setMatriculaInput(matriculaInicial);
    }
  }, [isOpen, matriculaInicial]);

  if (!isOpen) return null;

  const handleConsultar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matriculaInput.trim()) {
      setErro('Por favor, informe a matrícula.');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultados(null);

    try {
      const data = await api.consultarPorMatricula(matriculaInput.trim());
      setResultados(data);
    } catch (err: any) {
      setErro(err.message || 'Erro ao consultar atestados pela matrícula.');
    } finally {
      setLoading(false);
    }
  };

  const handleLimpar = () => {
    setMatriculaInput('');
    setResultados(null);
    setErro(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl max-h-[90vh] rounded-2xl shadow-xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-8 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="border-l border-slate-200 pl-3">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                Consultar por Matrícula
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o andamento dos seus atestados
              </p>
            </div>
          </div>
          <button
            id="btn-fechar-consulta-matricula"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Form */}
          <form onSubmit={handleConsultar} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Matrícula do Colaborador
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  id="input-consulta-matricula"
                  type="text"
                  value={matriculaInput}
                  onChange={e => setMatriculaInput(e.target.value)}
                  placeholder="Digite a matrícula"
                  className="w-full pl-3.5 pr-4 py-2.5 text-sm font-medium border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all bg-white"
                  autoFocus
                />
              </div>
              <button
                id="btn-buscar-matricula"
                type="submit"
                disabled={loading || !matriculaInput.trim()}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Buscar</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error message */}
          {erro && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 text-sm">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Nenhum registro localizado</p>
                <p className="text-xs text-red-700 mt-0.5">{erro}</p>
              </div>
            </div>
          )}

          {/* Results List */}
          {resultados && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {resultados.length === 1 ? '1 atestado encontrado' : `${resultados.length} atestados encontrados`}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {resultados[0]?.nomeCompleto} • Setor: {resultados[0]?.setor}
                </span>
              </div>

              <div className="space-y-3">
                {resultados.map(item => {
                  const colors = getStatusColor(item.status);
                  return (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-all shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                              Protocolo: {item.protocolo}
                            </span>
                            <span className="text-xs text-slate-500">
                              {item.tipoDocumento}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            Enviado em {formatarDataHora(item.dataHoraEnvio)}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text} ${colors.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                          {item.status}
                        </span>
                      </div>

                      {/* Period info */}
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-500 block">Período de afastamento:</span>
                          <span className="font-semibold text-slate-800">
                            {formatarData(item.dataInicio)} até {formatarData(item.dataTermino)}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Duração total:</span>
                          <span className="font-semibold text-slate-800">
                            {item.quantidadeDias} {item.quantidadeDias === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>

                      {/* RH Feedback if available */}
                      {item.parecerRH && (
                        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                            <span>Observação do Recursos Humanos:</span>
                          </div>
                          <p className="text-amber-950 font-medium pl-5">{item.parecerRH}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          {resultados ? (
            <button
              onClick={handleLimpar}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Nova Consulta
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              Dúvidas? Entre em contato com seu setor de RH.
            </span>
          )}

          <button
            id="btn-fechar-consulta-modal"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
