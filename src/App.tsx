import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LoginColaborador } from './components/LoginColaborador';
import { LoginRHModal } from './components/LoginRHModal';
import { HomeView } from './components/HomeView';
import { FormularioAtestado } from './components/FormularioAtestado';
import { TelaConfirmacao } from './components/TelaConfirmacao';
import { ConsultaMatriculaModal } from './components/ConsultaMatriculaModal';
import { PainelRH } from './components/PainelRH';
import { ModalDetalhesAtestado } from './components/ModalDetalhesAtestado';
import { ModalAlterarStatus } from './components/ModalAlterarStatus';
import { ModalGestaoEquipeRH } from './components/ModalGestaoEquipeRH';
import { Atestado, ColaboradorUser, RHUser } from './types';

export default function App() {
  // Session states
  const [colaborador, setColaborador] = useState<ColaboradorUser | null>(() => {
    try {
      const saved = localStorage.getItem('katoen_colaborador_sessao');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.matricula) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [usuarioRH, setUsuarioRH] = useState<RHUser | null>(() => {
    try {
      const saved = localStorage.getItem('katoen_rh_sessao');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.id || parsed.login)) return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Current view: 'login' (1st screen), 'home' (2nd screen), 'formulario', 'confirmacao', 'rh'
  const [view, setView] = useState<'login' | 'home' | 'formulario' | 'confirmacao' | 'rh'>(() => {
    // If not logged in as collaborator, the first screen MUST be login
    try {
      const saved = localStorage.getItem('katoen_colaborador_sessao');
      return saved ? 'home' : 'login';
    } catch {
      return 'login';
    }
  });

  const [atestadoConfirmado, setAtestadoConfirmado] = useState<Atestado | null>(null);

  // Modals
  const [loginRHOpen, setLoginRHOpen] = useState(false);
  const [gestaoEquipeRHOpen, setGestaoEquipeRHOpen] = useState(false);
  const [consultaMatriculaOpen, setConsultaMatriculaOpen] = useState(false);
  const [detalhesAtestado, setDetalhesAtestado] = useState<Atestado | null>(null);
  const [statusAtestadoModal, setStatusAtestadoModal] = useState<Atestado | null>(null);

  // Keep localStorage updated
  useEffect(() => {
    try {
      if (colaborador) {
        localStorage.setItem('katoen_colaborador_sessao', JSON.stringify(colaborador));
      } else {
        localStorage.removeItem('katoen_colaborador_sessao');
      }
    } catch {
      // Ignore localStorage restrictions in iframe or private browsing
    }
  }, [colaborador]);

  useEffect(() => {
    try {
      if (usuarioRH) {
        localStorage.setItem('katoen_rh_sessao', JSON.stringify(usuarioRH));
      } else {
        localStorage.removeItem('katoen_rh_sessao');
      }
    } catch {
      // Ignore localStorage restrictions in iframe or private browsing
    }
  }, [usuarioRH]);

  // Auth Handlers
  const handleLoginColaboradorSucesso = (user: ColaboradorUser) => {
    if (!user || !user.matricula) {
      console.warn('Tentativa de login com objeto de usuário inválido:', user);
      return;
    }
    setColaborador(user);
    try {
      localStorage.setItem('katoen_colaborador_sessao', JSON.stringify(user));
    } catch {}
    setView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginRHSucesso = (user: RHUser) => {
    if (!user || (!user.id && !user.login)) {
      console.warn('Tentativa de login de RH com objeto inválido:', user);
      return;
    }
    setUsuarioRH(user);
    try {
      localStorage.setItem('katoen_rh_sessao', JSON.stringify(user));
    } catch {}
    setLoginRHOpen(false);
    setView('rh');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAbrirRH = () => {
    if (usuarioRH) {
      setView('rh');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setLoginRHOpen(true);
    }
  };

  const handleLogout = () => {
    if (view === 'rh') {
      setUsuarioRH(null);
      if (colaborador) {
        setView('home');
      } else {
        setView('login');
      }
    } else {
      setColaborador(null);
      setUsuarioRH(null);
      setView('login');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSucessoEnvio = (novoAtestado: Atestado) => {
    setAtestadoConfirmado(novoAtestado);
    setView('confirmacao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVoltarInicio = () => {
    setAtestadoConfirmado(null);
    setView(colaborador ? 'home' : 'login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEnviarOutro = () => {
    setAtestadoConfirmado(null);
    setView('formulario');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-red-500 selection:text-white">
      {/* Global Header (apenas para visão colaborador / público) */}
      {view !== 'rh' && (
        <Header
          view={view}
          colaborador={colaborador}
          usuarioRH={usuarioRH}
          onNavigateHome={() => {
            if (colaborador) {
              setView('home');
            } else {
              setView('login');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onNavigateRH={handleAbrirRH}
          onAbrirEquipeRH={() => setGestaoEquipeRHOpen(true)}
          onLogout={handleLogout}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Tela 1: LOGIN DO COLABORADOR */}
        {view === 'login' && (
          <LoginColaborador
            onLoginSucesso={handleLoginColaboradorSucesso}
            onAbrirLoginRH={() => setLoginRHOpen(true)}
          />
        )}

        {/* Tela 2: TELA PRINCIPAL (HomeView exatamente como na imagem) */}
        {view === 'home' && (
          <HomeView
            onIniciarEnvio={() => {
              setView('formulario');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAbrirConsulta={() => setConsultaMatriculaOpen(true)}
          />
        )}

        {/* Formulário de Envio com dados pré-preenchidos do colaborador */}
        {view === 'formulario' && (
          <FormularioAtestado
            colaborador={colaborador}
            onVoltar={() => setView('home')}
            onSucesso={handleSucessoEnvio}
          />
        )}

        {/* Tela de Confirmação com Protocolo */}
        {view === 'confirmacao' && atestadoConfirmado && (
          <TelaConfirmacao
            atestado={atestadoConfirmado}
            onEnviarOutro={handleEnviarOutro}
            onVoltarInicio={handleVoltarInicio}
          />
        )}

        {/* Área Administrativa do RH */}
        {view === 'rh' && usuarioRH && (
          <PainelRH
            onVerDetalhes={item => setDetalhesAtestado(item)}
            onAlterarStatus={item => setStatusAtestadoModal(item)}
            onAbrirEquipeRH={() => setGestaoEquipeRHOpen(true)}
            usuarioRH={usuarioRH}
            onVoltarColaborador={() => {
              setView(colaborador ? 'home' : 'login');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onLogout={handleLogout}
          />
        )}
      </main>

      {/* Footer (apenas para visão colaborador / público) */}
      {view !== 'rh' && (
        <footer className="bg-white border-t border-slate-200 mt-auto py-8 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <img
                src="/katoen-natie.png"
                alt="Katoen Natie"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center gap-4">
              <span>Privacidade e Segurança de Dados em conformidade com LGPD</span>
              {view !== 'login' && (
                <button
                  id="btn-footer-acesso-rh"
                  onClick={handleAbrirRH}
                  className="text-slate-700 hover:text-red-700 font-medium transition-colors cursor-pointer"
                >
                  Acesso do RH
                </button>
              )}
            </div>
          </div>
        </footer>
      )}

      {/* Modal: Login do RH */}
      <LoginRHModal
        isOpen={loginRHOpen}
        onClose={() => setLoginRHOpen(false)}
        onLoginSucesso={handleLoginRHSucesso}
      />

      {/* Modal: Consultar por Matrícula */}
      <ConsultaMatriculaModal
        isOpen={consultaMatriculaOpen}
        matriculaInicial={colaborador?.matricula}
        onClose={() => setConsultaMatriculaOpen(false)}
      />

      {/* Modal: Detalhes do Atestado (RH) */}
      <ModalDetalhesAtestado
        isOpen={!!detalhesAtestado}
        atestado={detalhesAtestado}
        onClose={() => setDetalhesAtestado(null)}
        onAbrirAlterarStatus={item => {
          setDetalhesAtestado(null);
          setStatusAtestadoModal(item);
        }}
      />

      {/* Modal: Alterar Status (RH) */}
      <ModalAlterarStatus
        isOpen={!!statusAtestadoModal}
        atestado={statusAtestadoModal}
        onClose={() => setStatusAtestadoModal(null)}
        onStatusUpdated={() => {
          setDetalhesAtestado(null);
        }}
      />

      {/* Modal: Gestão da Equipe de RH */}
      <ModalGestaoEquipeRH
        isOpen={gestaoEquipeRHOpen}
        onClose={() => setGestaoEquipeRHOpen(false)}
        usuarioLogado={usuarioRH}
        onUsuarioAtualizado={userAtualizado => {
          setUsuarioRH(userAtualizado);
        }}
      />
    </div>
  );
}
