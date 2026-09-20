import { PlusCircle, Search, CheckCircle2, FileCheck2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

interface HomeViewProps {
  onIniciarEnvio: () => void;
  onAbrirConsulta: () => void;
}

export function HomeView({ onIniciarEnvio, onAbrirConsulta }: HomeViewProps) {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50/70 to-slate-100/90 border-b border-slate-200/80 pt-10 pb-14 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo Katoen Natie */}
          <div className="flex justify-center mb-5">
            <div className="bg-white px-6 py-3.5 rounded-2xl shadow-sm border border-slate-200/90 inline-flex items-center justify-center">
              <img
                src="/katoen-natie.png"
                alt="Katoen Natie"
                className="h-14 sm:h-18 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 text-white border border-slate-800 text-xs font-semibold mb-4 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
            <span>Katoen Natie • Canal Oficial de Atendimento RH</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight leading-tight sm:leading-none">
            Envio de Atestados
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-slate-700 font-semibold max-w-2xl mx-auto">
            Envie seu atestado de forma rápida e segura.
          </p>

          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Substitua mensagens de WhatsApp ou e-mails por este canal oficial integrado
            diretamente ao Recursos Humanos. Seu envio gera protocolo com validação imediata.
          </p>

          {/* Main Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="btn-iniciar-envio-atestado"
              onClick={onIniciarEnvio}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base sm:text-lg font-black tracking-wide text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-lg shadow-red-600/30 ring-4 ring-red-600/10 hover:ring-red-600/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <PlusCircle className="w-6 h-6 stroke-[2.4]" />
              <span>ENVIAR ATESTADO</span>
            </button>

            <button
              id="btn-consultar-matricula"
              onClick={onAbrirConsulta}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-4 text-base font-bold text-slate-900 hover:text-slate-950 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl border-2 border-slate-300 hover:border-slate-400 shadow-xs transition-all cursor-pointer"
            >
              <Search className="w-5 h-5 text-slate-600" />
              <span>Consultar por Matrícula</span>
            </button>
          </div>

          {/* Quick trust reassurance */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Aceita PDF, JPG, JPEG e PNG
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Gera protocolo na hora
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Privacidade e sigilo médico garantidos
            </span>
          </div>
        </div>
      </section>

      {/* Como funciona - 3 Passos */}
      <section className="py-12 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950">
            Como funciona o envio digital
          </h2>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Processo 100% online sem burocracia para você e seu setor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Passo 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              1
            </div>
            <h3 className="text-base font-extrabold text-slate-950 mb-1.5">
              Informe seus dados
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Preencha seu nome, matrícula, setor e as datas de início e término do afastamento.
            </p>
          </div>

          {/* Passo 2 - Destaque em Vermelho Katoen Natie */}
          <div className="bg-white p-6 rounded-2xl border-2 border-red-600/30 hover:border-red-600/70 shadow-xs transition-colors relative">
            <span className="absolute top-4 right-4 text-[10px] font-extrabold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-md">
              Etapa Principal
            </span>
            <div className="w-11 h-11 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-lg mb-4 shadow-sm shadow-red-600/30">
              2
            </div>
            <h3 className="text-base font-extrabold text-slate-950 mb-1.5">
              Anexe o documento
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tire uma foto nítida do atestado pelo celular ou anexe o PDF emitido pelo médico.
            </p>
          </div>

          {/* Passo 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
            <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg mb-4 shadow-xs">
              3
            </div>
            <h3 className="text-base font-extrabold text-slate-950 mb-1.5">
              Guarde seu protocolo
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Receba o número de protocolo único para acompanhar a análise e validação pelo RH.
            </p>
          </div>
        </div>

        {/* Informações importantes / Avisos do RH */}
        <div className="mt-10 bg-white border-l-4 border-l-amber-500 border-y border-r border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl shrink-0 border border-amber-200/60">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-950">
                Orientações importantes para a entrega
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs sm:text-sm text-slate-700 list-disc list-inside">
                <li>
                  Envie o documento em até <strong className="text-slate-950 font-bold">48 horas</strong> a contar do início do afastamento.
                </li>
                <li>
                  Certifique-se de que a foto esteja nítida, com o nome do médico, CRM e carimbo legíveis.
                </li>
                <li>
                  Apenas <strong className="text-slate-950 font-bold">1 arquivo</strong> por envio (PDF ou imagem nítida).
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
