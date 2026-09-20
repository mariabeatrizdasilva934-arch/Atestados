import { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Printer,
  PlusCircle,
  Home,
  FileText,
  Calendar,
  User,
  Building,
  Hash
} from 'lucide-react';
import { Atestado } from '../types';
import { formatarData, formatarDataHora } from '../utils/formatters';

interface TelaConfirmacaoProps {
  atestado: Atestado;
  onEnviarOutro: () => void;
  onVoltarInicio: () => void;
}

export function TelaConfirmacao({
  atestado,
  onEnviarOutro,
  onVoltarInicio
}: TelaConfirmacaoProps) {
  const [copiado, setCopiado] = useState(false);

  const copiarProtocolo = () => {
    navigator.clipboard.writeText(atestado.protocolo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Confirmation Card */}
      <div
        id="comprovante-print"
        className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
      >
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-b from-red-600 to-red-700 text-white p-8 text-center">
          <div className="inline-flex items-center justify-center bg-white px-4 py-2 rounded-xl shadow-md mb-5">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Atestado enviado com sucesso!
          </h1>

          <p className="mt-2 text-sm sm:text-base text-red-100 max-w-md mx-auto">
            Seu documento foi recebido. Guarde o número de protocolo para acompanhamento.
          </p>
        </div>

        {/* Protocol Box */}
        <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
          <div className="bg-white rounded-2xl border-2 border-dashed border-red-200 p-5 text-center shadow-xs">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-700">
              Número de Protocolo
            </span>

            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-red-600 tracking-wider font-mono select-all">
                {atestado.protocolo}
              </span>

              <button
                id="btn-copiar-protocolo"
                type="button"
                onClick={copiarProtocolo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Copiar protocolo"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-700 mt-2">
              Envio registrado em <strong>{formatarDataHora(atestado.dataHoraEnvio)}</strong>
            </p>
          </div>
        </div>

        {/* Resumo dos Dados Enviados */}
        <div className="p-6 sm:p-8 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Resumo do Envio
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <User className="w-3.5 h-3.5 text-red-600" />
                Colaborador
              </span>
              <p className="font-bold text-slate-900">{atestado.nomeCompleto}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <Hash className="w-3.5 h-3.5 text-red-600" />
                Matrícula
              </span>
              <p className="font-bold text-slate-900">{atestado.matricula}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <Building className="w-3.5 h-3.5 text-red-600" />
                Setor
              </span>
              <p className="font-bold text-slate-900">{atestado.setor}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <Calendar className="w-3.5 h-3.5 text-red-600" />
                Período e Duração
              </span>
              <p className="font-bold text-slate-900">
                {formatarData(atestado.dataInicio)} a {formatarData(atestado.dataTermino)}{' '}
                <span className="text-xs font-normal text-slate-700">
                  ({atestado.quantidadeDias} {atestado.quantidadeDias === 1 ? 'dia' : 'dias'})
                </span>
              </p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <FileText className="w-3.5 h-3.5 text-red-600" />
                Tipo de Documento
              </span>
              <p className="font-bold text-slate-900">{atestado.tipoDocumento}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-1.5 mb-1 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Status Atual
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <span className="font-bold text-blue-700">Recebido</span>
                <span className="text-xs text-slate-700">(Em fila para análise do RH)</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <span className="text-xs text-slate-700 block mb-1 font-medium">
              Arquivo Anexado
            </span>
            <p className="font-semibold text-slate-800 text-xs sm:text-sm break-all">
              {atestado.nomeArquivo}
            </p>
          </div>
        </div>

        {/* Print / Action Buttons */}
        <div className="p-6 sm:p-8 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-imprimir-comprovante"
            type="button"
            onClick={handleImprimir}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Imprimir / Salvar Comprovante</span>
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2">
            <button
              id="btn-enviar-outro"
              type="button"
              onClick={onEnviarOutro}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-sm font-semibold transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Enviar Outro Atestado</span>
            </button>

            <button
              id="btn-voltar-inicio-confirmacao"
              type="button"
              onClick={onVoltarInicio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Concluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
