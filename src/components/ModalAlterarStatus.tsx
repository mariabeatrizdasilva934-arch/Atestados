import { useState } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle, Edit3 } from 'lucide-react';
import { Atestado, StatusAtestado } from '../types';
import { getStatusColor } from '../utils/formatters';
import { api } from '../utils/apiClient';

interface ModalAlterarStatusProps {
  atestado: Atestado | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: (updatedAtestado: Atestado) => void;
}

const STATUS_OPTIONS: StatusAtestado[] = [
  'Recebido',
  'Em análise',
  'Aprovado',
  'Pendente',
  'Recusado'
];

export function ModalAlterarStatus({
  atestado,
  isOpen,
  onClose,
  onStatusUpdated
}: ModalAlterarStatusProps) {
  if (!isOpen || !atestado) return null;

  const [novoStatus, setNovoStatus] = useState<StatusAtestado>(atestado.status);
  const [parecerRH, setParecerRH] = useState(atestado.parecerRH || '');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErro(null);

    try {
      const data = await api.atualizarStatus(atestado.id, novoStatus, parecerRH.trim());

      onStatusUpdated({
        ...atestado,
        status: novoStatus,
        parecerRH: parecerRH.trim(),
        historicoStatus: data.atestado?.historicoStatus || atestado.historicoStatus
      });
      onClose();
    } catch (err: any) {
      setErro(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-red-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Alterar Status do Atestado
            </h3>
          </div>
          <button
            id="btn-fechar-modal-status"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSalvar} className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
            <p>
              Protocolo: <strong className="font-mono text-slate-900">{atestado.protocolo}</strong>
            </p>
            <p className="mt-0.5">
              Colaborador: <strong className="text-slate-900">{atestado.nomeCompleto}</strong> ({atestado.matricula})
            </p>
          </div>

          {erro && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Selecione o Novo Status
            </label>
            <div className="grid grid-cols-1 gap-2">
              {STATUS_OPTIONS.map(status => {
                const colors = getStatusColor(status);
                const isSelected = novoStatus === status;
                return (
                  <label
                    key={status}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `${colors.bg} ${colors.border} ring-2 ring-red-600/20 font-bold`
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="statusRadio"
                        value={status}
                        checked={isSelected}
                        onChange={() => setNovoStatus(status)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <span className={`text-sm ${isSelected ? colors.text : 'text-slate-800'}`}>
                        {status}
                      </span>
                    </div>
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`}></span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="textarea-parecer-rh"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Parecer ou Motivo do RH <span className="font-normal text-slate-700">(opcional)</span>
            </label>
            <textarea
              id="textarea-parecer-rh"
              rows={3}
              value={parecerRH}
              onChange={e => setParecerRH(e.target.value)}
              placeholder="Ex: Documento validado com CRM legível. Afastamento abonado no ponto."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:border-red-600 focus:ring-2 focus:ring-red-600/20"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              id="btn-cancelar-status"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-confirmar-status"
              type="submit"
              disabled={salvando}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-xs transition-colors disabled:opacity-50"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvar Alteração</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
