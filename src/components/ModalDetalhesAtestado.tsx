import { useState } from 'react';
import {
  X,
  Download,
  Calendar,
  User,
  Building,
  Hash,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Edit3
} from 'lucide-react';
import { Atestado } from '../types';
import {
  formatarData,
  formatarDataHora,
  formatarTamanhoArquivo,
  getStatusColor
} from '../utils/formatters';
import { api } from '../utils/apiClient';

interface ModalDetalhesAtestadoProps {
  atestado: Atestado | null;
  isOpen: boolean;
  onClose: () => void;
  onAbrirAlterarStatus: (atestado: Atestado) => void;
}

export function ModalDetalhesAtestado({
  atestado,
  isOpen,
  onClose,
  onAbrirAlterarStatus
}: ModalDetalhesAtestadoProps) {
  if (!isOpen || !atestado) return null;

  const [downloading, setDownloading] = useState(false);
  const colors = getStatusColor(atestado.status);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.downloadDocumento(atestado.id, atestado.nomeArquivo);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const isImage =
    atestado.tipoMimeArquivo?.startsWith('image/') ||
    /\.(jpg|jpeg|png)$/i.test(atestado.nomeArquivo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <div className="border-l border-slate-200 pl-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Atestado: {atestado.protocolo}
                </h3>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`}></span>
                  {atestado.status}
                </span>
              </div>
              <p className="text-xs text-slate-700">
                Enviado em {formatarDataHora(atestado.dataHoraEnvio)}
              </p>
            </div>
          </div>

          <button
            id="btn-fechar-detalhes"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Dados Gerais Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Informações do Colaborador e Afastamento
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <User className="w-3.5 h-3.5 text-red-600" />
                  Colaborador
                </span>
                <p className="font-bold text-slate-900">{atestado.nomeCompleto}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <Hash className="w-3.5 h-3.5 text-red-600" />
                  Matrícula
                </span>
                <p className="font-bold text-slate-900">{atestado.matricula}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-red-600" />
                  Setor
                </span>
                <p className="font-bold text-slate-900">{atestado.setor}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-red-600" />
                  Período
                </span>
                <p className="font-bold text-slate-900">
                  {formatarData(atestado.dataInicio)} até {formatarData(atestado.dataTermino)}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  Duração
                </span>
                <p className="font-bold text-slate-900">
                  {atestado.quantidadeDias} {atestado.quantidadeDias === 1 ? 'dia' : 'dias'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                  <FileText className="w-3.5 h-3.5 text-red-600" />
                  Tipo de Documento
                </span>
                <p className="font-bold text-slate-900">{atestado.tipoDocumento}</p>
              </div>
            </div>
          </div>

          {/* Observações do Colaborador */}
          {atestado.observacoes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Observações do Colaborador:
              </span>
              <p className="text-sm text-slate-800 italic">"{atestado.observacoes}"</p>
            </div>
          )}

          {/* Parecer do RH se existir */}
          {atestado.parecerRH && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-xs font-bold text-amber-900 block mb-1">
                Parecer do RH:
              </span>
              <p className="text-sm text-amber-900">{atestado.parecerRH}</p>
            </div>
          )}

          {/* Documento Anexo e Visualização */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Documento Anexado
              </h4>
              <button
                id="btn-download-documento-detalhes"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading ? 'Baixando...' : 'Fazer Download'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-700 mb-3">
                <span className="font-semibold text-slate-800 truncate max-w-sm">
                  {atestado.nomeArquivo}
                </span>
                <span>{formatarTamanhoArquivo(atestado.tamanhoArquivo)}</span>
              </div>

              {/* Visualizador de documento */}
              <div className="bg-white rounded-xl border border-slate-200 p-2 overflow-hidden flex items-center justify-center min-h-[220px] max-h-[400px]">
                {isImage ? (
                  <img
                    src={`/api/atestados/${atestado.id}/documento`}
                    alt="Atestado médico"
                    className="max-h-[380px] max-w-full object-contain rounded-lg shadow-xs"
                    onError={e => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Documento em formato PDF
                    </p>
                    <p className="text-xs text-slate-700 mt-1 max-w-xs mx-auto">
                      Clique no botão de download para visualizar ou salvar o arquivo no seu computador.
                    </p>
                    <button
                      id="btn-baixar-pdf-view"
                      type="button"
                      onClick={handleDownload}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Baixar PDF Completo</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Linha do Tempo / Histórico de Status */}
          {atestado.historicoStatus && atestado.historicoStatus.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Histórico de Alterações
              </h4>
              <div className="space-y-2.5">
                {atestado.historicoStatus.map((item, idx) => {
                  const hColors = getStatusColor(item.status as any);
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${hColors.dot}`}></span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${hColors.text}`}>{item.status}</span>
                          <span className="text-slate-700">{formatarDataHora(item.dataHora)}</span>
                        </div>
                        {item.parecer && (
                          <p className="text-slate-700 mt-1">"{item.parecer}"</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <button
            id="btn-alterar-status-modal"
            type="button"
            onClick={() => onAbrirAlterarStatus(atestado)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Alterar Status</span>
          </button>

          <button
            id="btn-fechar-detalhes-footer"
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
