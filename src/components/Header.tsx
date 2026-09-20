import { Shield, LogOut, ArrowLeft, UserCheck, Users } from 'lucide-react';
import { ColaboradorUser, RHUser } from '../types';

interface HeaderProps {
  view: 'login' | 'home' | 'formulario' | 'confirmacao' | 'rh';
  colaborador: ColaboradorUser | null;
  usuarioRH: RHUser | null;
  onNavigateHome: () => void;
  onNavigateRH: () => void;
  onAbrirEquipeRH?: () => void;
  onLogout: () => void;
}

export function Header({
  view,
  colaborador,
  usuarioRH,
  onNavigateHome,
  onNavigateRH,
  onAbrirEquipeRH,
  onLogout
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs">
      {/* Top Brand Crimson Stripe */}
      <div className="h-1 bg-gradient-to-r from-red-700 via-red-600 to-red-700 w-full" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          id="btn-logo-home"
          onClick={onNavigateHome}
          className="flex items-center gap-3 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-600 rounded-lg py-1 px-1.5 transition-colors cursor-pointer"
        >
          <img
            src="/katoen-natie.png"
            alt="Katoen Natie"
            className="h-10 sm:h-11 w-auto object-contain group-hover:opacity-95 transition-opacity"
            referrerPolicy="no-referrer"
          />
          <div className="hidden sm:block border-l border-slate-200 pl-3">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-950 text-base tracking-tight leading-none group-hover:text-red-600 transition-colors">
                Envio de Atestados
              </span>
              {view === 'rh' && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2.5 py-0.5 rounded-md shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Área do RH
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Canal Oficial de Entrega de Atestados
            </p>
          </div>
          <div className="sm:hidden">
            <span className="font-extrabold text-slate-950 text-sm block leading-tight">
              Envio de Atestados
            </span>
            {view === 'rh' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red-600">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                Área do RH
              </span>
            )}
          </div>
        </button>

        {/* Navigation actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {view === 'rh' ? (
            <div className="flex items-center gap-2">
              {/* Botão Equipe de Gestão de RH */}
              {onAbrirEquipeRH && (
                <button
                  id="btn-header-equipe-rh"
                  type="button"
                  onClick={onAbrirEquipeRH}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-900 hover:text-white bg-slate-50 hover:bg-slate-900 border border-slate-300 hover:border-slate-900 rounded-lg shadow-xs transition-all cursor-pointer group"
                  title="Gerenciar integrantes com permissão no RH"
                >
                  <Users className="w-3.5 h-3.5 text-red-600 group-hover:text-red-400 transition-colors" />
                  <span>Equipe de Gestão de RH</span>
                </button>
              )}

              {usuarioRH && (
                <span className="hidden xl:inline-flex items-center gap-1.5 text-xs text-slate-700 font-semibold px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200">
                  <Shield className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-slate-900">{usuarioRH.nome}</span>
                  {usuarioRH.matricula && (
                    <span className="text-[11px] font-mono text-slate-500">({usuarioRH.matricula})</span>
                  )}
                </span>
              )}

              <button
                id="btn-voltar-colaborador"
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Visão Colaborador</span>
              </button>

              <button
                id="btn-logout-rh"
                onClick={onLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg border border-red-200 hover:border-red-600 transition-colors cursor-pointer"
                title="Encerrar sessão de RH"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair do RH</span>
              </button>
            </div>
          ) : view === 'login' ? null : (
            <div className="flex items-center gap-2 sm:gap-3">
              {colaborador && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-800 bg-slate-100 rounded-full border border-slate-200/90">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-bold text-slate-950 truncate max-w-[150px]">
                    {colaborador.nomeCompleto.split(' ')[0]}
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-mono text-[11px] font-medium">{colaborador.matricula}</span>
                </div>
              )}

              <button
                id="btn-abrir-painel-rh"
                onClick={onNavigateRH}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 hover:text-white hover:bg-slate-900 rounded-lg transition-all border border-slate-200 hover:border-slate-900 cursor-pointer shadow-xs group"
                title="Acessar o Painel de Recursos Humanos"
              >
                <Shield className="w-3.5 h-3.5 text-red-600 group-hover:text-red-400 transition-colors" />
                <span>Área do RH</span>
              </button>

              <button
                id="btn-logout-colaborador"
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                title="Encerrar sessão"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
