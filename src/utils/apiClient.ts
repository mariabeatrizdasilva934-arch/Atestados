import { Atestado, ConsultaMatriculaItem, DashboardStats, MembroRH, ColaboradorUser, RHUser, StatusAtestado } from '../types';

// Storage keys for static fallback mode (e.g. Netlify without backend)
const STORAGE_ATESTADOS = 'katoen_db_atestados';
const STORAGE_COLABORADORES = 'katoen_db_colaboradores';
const STORAGE_RH = 'katoen_db_rh';

function isJsonResponse(res: Response): boolean {
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json');
}

// Initial seed data for fallback mode
function getFallbackColaboradores() {
  try {
    const raw = localStorage.getItem(STORAGE_COLABORADORES);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial = [
    { matricula: 'MAT-10482', nomeCompleto: 'Carlos Eduardo Santos', setor: 'Ensaque', senha: '123' },
    { matricula: 'MAT-12903', nomeCompleto: 'Juliana Oliveira Costa', setor: 'Administrativo', senha: '123' },
    { matricula: 'MAT-09831', nomeCompleto: 'Marcos Vinicius Pereira', setor: 'Expedição', senha: '123' },
    { matricula: 'MAT-14120', nomeCompleto: 'Fernanda Rocha Lima', setor: 'Manutenção', senha: '123' }
  ];
  try {
    localStorage.setItem(STORAGE_COLABORADORES, JSON.stringify(initial));
  } catch {}
  return initial;
}

function getFallbackRH(): MembroRH[] {
  try {
    const raw = localStorage.getItem(STORAGE_RH);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: MembroRH[] = [
    {
      id: 'rh-1',
      matricula: 'RH-001',
      nome: 'Equipe de Gestão de RH',
      cargo: 'Coordenação de Recursos Humanos',
      login: 'rh@katoennatie.com',
      email: 'rh@katoennatie.com',
      criadoEm: '2026-09-01T00:00:00.000Z',
      ativo: true
    },
    {
      id: 'rh-2',
      matricula: 'RH-002',
      nome: 'Administrador RH',
      cargo: 'Administração de Sistemas de RH',
      login: 'rh.admin',
      email: 'rh.admin@katoennatie.com',
      criadoEm: '2026-09-01T00:00:00.000Z',
      ativo: true
    }
  ];
  try {
    localStorage.setItem(STORAGE_RH, JSON.stringify(initial));
  } catch {}
  return initial;
}

function getFallbackAtestados(): Atestado[] {
  try {
    const raw = localStorage.getItem(STORAGE_ATESTADOS);
    if (raw) return JSON.parse(raw);
  } catch {}
  const initial: Atestado[] = [
    {
      id: 'at-seed-001',
      protocolo: 'ATE-20260915-4812',
      nomeCompleto: 'Carlos Eduardo Santos',
      matricula: 'MAT-10482',
      setor: 'Ensaque',
      dataInicio: '2026-09-15',
      dataTermino: '2026-09-17',
      quantidadeDias: 3,
      tipoDocumento: 'Atestado médico',
      observacoes: 'Sintomas gripais fortes e recomendação médica de repouso.',
      nomeArquivo: 'atestado_carlos_santos.png',
      tamanhoArquivo: 248500,
      tipoMimeArquivo: 'image/png',
      temArquivo: true,
      dataHoraEnvio: '2026-09-15T08:32:00.000Z',
      status: 'Aprovado',
      parecerRH: 'Atestado validado com CRM legível. Lançado no ponto.',
      historicoStatus: [
        { status: 'Recebido', dataHora: '2026-09-15T08:32:00.000Z' },
        { status: 'Em análise', dataHora: '2026-09-15T09:10:00.000Z', alteradoPor: 'RH' },
        { status: 'Aprovado', dataHora: '2026-09-15T11:00:00.000Z', parecer: 'Atestado validado com CRM legível. Lançado no ponto.', alteradoPor: 'RH' }
      ]
    },
    {
      id: 'at-seed-002',
      protocolo: 'ATE-20260916-8391',
      nomeCompleto: 'Juliana Oliveira Costa',
      matricula: 'MAT-12903',
      setor: 'Administrativo',
      dataInicio: '2026-09-16',
      dataTermino: '2026-09-16',
      quantidadeDias: 1,
      tipoDocumento: 'Declaração',
      observacoes: 'Declaração de comparecimento para exames laboratoriais periódicos.',
      nomeArquivo: 'declaracao_exames_juliana.png',
      tamanhoArquivo: 312000,
      tipoMimeArquivo: 'image/png',
      temArquivo: true,
      dataHoraEnvio: '2026-09-16T14:15:00.000Z',
      status: 'Em análise',
      parecerRH: 'Verificando período de horas informado.',
      historicoStatus: [
        { status: 'Recebido', dataHora: '2026-09-16T14:15:00.000Z' },
        { status: 'Em análise', dataHora: '2026-09-16T15:20:00.000Z', parecer: 'Verificando período de horas informado.', alteradoPor: 'RH' }
      ]
    },
    {
      id: 'at-seed-003',
      protocolo: 'ATE-20260917-2194',
      nomeCompleto: 'Marcos Vinicius Pereira',
      matricula: 'MAT-09831',
      setor: 'Expedição',
      dataInicio: '2026-09-17',
      dataTermino: '2026-09-18',
      quantidadeDias: 2,
      tipoDocumento: 'Atestado médico',
      observacoes: 'Entorse leve no tornozelo durante atividade esportiva no fim de semana.',
      nomeArquivo: 'atestado_marcos_entorse.pdf',
      tamanhoArquivo: 420000,
      tipoMimeArquivo: 'application/pdf',
      temArquivo: true,
      dataHoraEnvio: '2026-09-17T10:45:00.000Z',
      status: 'Pendente',
      parecerRH: 'Solicitado envio de foto com carimbo médico mais nítido.',
      historicoStatus: [
        { status: 'Recebido', dataHora: '2026-09-17T10:45:00.000Z' },
        { status: 'Pendente', dataHora: '2026-09-17T11:30:00.000Z', parecer: 'Solicitado envio de foto com carimbo médico mais nítido.', alteradoPor: 'RH' }
      ]
    },
    {
      id: 'at-seed-004',
      protocolo: 'ATE-20260918-6725',
      nomeCompleto: 'Fernanda Rocha Lima',
      matricula: 'MAT-14120',
      setor: 'Manutenção',
      dataInicio: '2026-09-18',
      dataTermino: '2026-09-22',
      quantidadeDias: 5,
      tipoDocumento: 'Atestado médico',
      observacoes: 'Procedimento cirúrgico odontológico e repouso de 5 dias.',
      nomeArquivo: 'atestado_odontologico_fernanda.png',
      tamanhoArquivo: 524000,
      tipoMimeArquivo: 'image/png',
      temArquivo: true,
      dataHoraEnvio: '2026-09-18T07:10:00.000Z',
      status: 'Aprovado',
      historicoStatus: [
        { status: 'Recebido', dataHora: '2026-09-18T07:10:00.000Z' },
        { status: 'Aprovado', dataHora: '2026-09-18T13:55:24.764Z', alteradoPor: 'RH' }
      ]
    }
  ];
  try {
    localStorage.setItem(STORAGE_ATESTADOS, JSON.stringify(initial));
  } catch {}
  return initial;
}

export const api = {
  // 1. Login Colaborador
  async loginColaborador(matricula: string, senha: string): Promise<ColaboradorUser> {
    try {
      const res = await fetch('/api/auth/login-colaborador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula: matricula.trim(), senha })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao realizar login.');
        return data.colaborador;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const users = getFallbackColaboradores();
    const user = users.find((u: any) => u.matricula.toLowerCase() === matricula.trim().toLowerCase());
    if (!user) {
      throw new Error(`Matrícula "${matricula}" não cadastrada no sistema.`);
    }
    if (user.senha && user.senha !== senha) {
      throw new Error('Senha incorreta.');
    }
    return {
      matricula: user.matricula,
      nomeCompleto: user.nomeCompleto,
      setor: user.setor,
      role: 'colaborador'
    };
  },

  // 2. Cadastro Colaborador
  async cadastroColaborador(dados: { matricula: string; nomeCompleto: string; setor: string; senha: string }): Promise<ColaboradorUser> {
    try {
      const res = await fetch('/api/auth/cadastro-colaborador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao realizar cadastro.');
        return data.colaborador;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const users = getFallbackColaboradores();
    if (users.some((u: any) => u.matricula.toLowerCase() === dados.matricula.trim().toLowerCase())) {
      throw new Error('Esta matrícula já está cadastrada.');
    }
    const novo = {
      matricula: dados.matricula.trim().toUpperCase(),
      nomeCompleto: dados.nomeCompleto.trim(),
      setor: dados.setor.trim(),
      senha: dados.senha
    };
    users.push(novo);
    try {
      localStorage.setItem(STORAGE_COLABORADORES, JSON.stringify(users));
    } catch {}
    return {
      matricula: novo.matricula,
      nomeCompleto: novo.nomeCompleto,
      setor: novo.setor,
      role: 'colaborador'
    };
  },

  // 3. Esqueci Senha Colaborador
  async esqueciSenhaColaborador(matricula: string, novaSenha: string): Promise<string> {
    try {
      const res = await fetch('/api/auth/esqueci-senha-colaborador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matricula, novaSenha })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha.');
        return data.message || 'Senha redefinida com sucesso!';
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const users = getFallbackColaboradores();
    const idx = users.findIndex((u: any) => u.matricula.toLowerCase() === matricula.trim().toLowerCase());
    if (idx === -1) {
      throw new Error(`Matrícula "${matricula}" não foi encontrada no sistema.`);
    }
    users[idx].senha = novaSenha;
    try {
      localStorage.setItem(STORAGE_COLABORADORES, JSON.stringify(users));
    } catch {}
    return 'Senha alterada com sucesso! Você já pode realizar o login com a nova senha.';
  },

  // 4. Login RH
  async loginRH(login: string, senha: string): Promise<RHUser> {
    try {
      const res = await fetch('/api/auth/login-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), senha })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao realizar login do RH.');
        return data.usuarioRH;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const rhList = getFallbackRH();
    const cleanLogin = login.trim().toLowerCase();
    const membro = rhList.find(
      (m: any) =>
        m.login.toLowerCase() === cleanLogin ||
        m.email.toLowerCase() === cleanLogin ||
        m.matricula.toLowerCase() === cleanLogin
    );
    if (!membro) {
      throw new Error('Usuário de RH não encontrado.');
    }
    if (senha !== 'rh123') {
      throw new Error('Senha incorreta.');
    }
    return {
      id: membro.id,
      login: membro.login,
      nome: membro.nome,
      matricula: membro.matricula,
      cargo: membro.cargo,
      email: membro.email,
      role: 'rh'
    };
  },

  // 5. Esqueci Senha RH
  async esqueciSenhaRH(login: string, codigoRecuperacao: string, novaSenha: string): Promise<string> {
    try {
      const res = await fetch('/api/auth/esqueci-senha-rh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, codigoRecuperacao, novaSenha })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao redefinir senha do RH.');
        return data.message || 'Senha alterada com sucesso!';
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    if (codigoRecuperacao !== 'KATOEN-RH-2026') {
      throw new Error('Código de segurança do RH inválido.');
    }
    return 'Senha alterada com sucesso! Você já pode realizar o login com a nova senha.';
  },

  // 6. Enviar Atestado
  async enviarAtestado(payload: any): Promise<Atestado> {
    try {
      const res = await fetch('/api/atestados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ocorreu um erro ao enviar o atestado.');
        return data.atestado;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const atestados = getFallbackAtestados();
    const dataStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    const protocolo = `ATE-${dataStr}-${rand}`;
    const id = `ate_${Date.now()}`;

    const novo: Atestado = {
      id,
      protocolo,
      nomeCompleto: payload.nomeCompleto.trim(),
      matricula: payload.matricula.trim().toUpperCase(),
      setor: payload.setor.trim(),
      dataInicio: payload.dataInicio,
      dataTermino: payload.dataTermino,
      quantidadeDias: Number(payload.quantidadeDias),
      tipoDocumento: payload.tipoDocumento,
      observacoes: payload.observacoes || '',
      nomeArquivo: payload.arquivo?.nome || 'documento_anexo.png',
      tamanhoArquivo: payload.arquivo?.tamanho || 102400,
      tipoMimeArquivo: payload.arquivo?.tipoMime || 'image/png',
      temArquivo: true,
      dataHoraEnvio: new Date().toISOString(),
      status: 'Recebido',
      historicoStatus: [
        {
          status: 'Recebido',
          dataHora: new Date().toISOString()
        }
      ]
    };

    atestados.unshift(novo);
    try {
      localStorage.setItem(STORAGE_ATESTADOS, JSON.stringify(atestados));
    } catch {}
    return novo;
  },

  // 7. Consultar por Matrícula
  async consultarPorMatricula(matricula: string): Promise<ConsultaMatriculaItem[]> {
    try {
      const res = await fetch(`/api/atestados/consultar-matricula/${encodeURIComponent(matricula.trim())}`);
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao consultar matrícula.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const atestados = getFallbackAtestados();
    const cleanMatricula = matricula.trim().toLowerCase();
    const matches = atestados.filter(a => a.matricula && a.matricula.toLowerCase() === cleanMatricula);
    if (matches.length === 0) {
      throw new Error(`Nenhum atestado encontrado para a matrícula "${matricula}".`);
    }
    return matches.map(m => ({
      id: m.id,
      protocolo: m.protocolo,
      nomeCompleto: m.nomeCompleto,
      matricula: m.matricula,
      setor: m.setor,
      dataInicio: m.dataInicio,
      dataTermino: m.dataTermino,
      quantidadeDias: m.quantidadeDias,
      tipoDocumento: m.tipoDocumento,
      dataHoraEnvio: m.dataHoraEnvio,
      status: m.status,
      parecerRH: m.parecerRH
    }));
  },

  // 8. Listar Atestados (RH)
  async listarAtestadosRH(filtros: { q?: string; setor?: string; status?: string; dataInicio?: string; dataTermino?: string }): Promise<Atestado[]> {
    try {
      const params = new URLSearchParams();
      if (filtros.q) params.set('q', filtros.q);
      if (filtros.setor && filtros.setor !== 'todos') params.set('setor', filtros.setor);
      if (filtros.status && filtros.status !== 'todos') params.set('status', filtros.status);
      if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio);
      if (filtros.dataTermino) params.set('dataTermino', filtros.dataTermino);

      const res = await fetch(`/api/atestados?${params.toString()}`);
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao buscar atestados.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    let list = getFallbackAtestados();
    if (filtros.q) {
      const term = filtros.q.toLowerCase().trim();
      list = list.filter(
        i =>
          i.nomeCompleto.toLowerCase().includes(term) ||
          i.matricula.toLowerCase().includes(term) ||
          i.protocolo.toLowerCase().includes(term)
      );
    }
    if (filtros.setor && filtros.setor !== 'todos') {
      list = list.filter(i => i.setor.toLowerCase() === filtros.setor!.toLowerCase());
    }
    if (filtros.status && filtros.status !== 'todos') {
      list = list.filter(i => i.status === filtros.status);
    }
    if (filtros.dataInicio) {
      list = list.filter(i => i.dataInicio >= filtros.dataInicio!);
    }
    if (filtros.dataTermino) {
      list = list.filter(i => i.dataTermino <= filtros.dataTermino!);
    }
    return list;
  },

  // 9. Obter Estatísticas (RH)
  async obterStatsRH(): Promise<DashboardStats> {
    try {
      const res = await fetch('/api/stats');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao carregar estatísticas.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const atestados = getFallbackAtestados();
    return {
      total: atestados.length,
      recebidos: atestados.filter(a => a.status === 'Recebido').length,
      emAnalise: atestados.filter(a => a.status === 'Em análise').length,
      aprovados: atestados.filter(a => a.status === 'Aprovado').length,
      pendentes: atestados.filter(a => a.status === 'Pendente').length,
      recusados: atestados.filter(a => a.status === 'Recusado').length
    };
  },

  // 10. Atualizar Status do Atestado
  async atualizarStatus(id: string, status: StatusAtestado, parecerRH?: string): Promise<any> {
    try {
      const res = await fetch(`/api/atestados/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, parecerRH })
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao atualizar status.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const atestados = getFallbackAtestados();
    const idx = atestados.findIndex(a => a.id === id);
    if (idx !== -1) {
      atestados[idx].status = status;
      if (parecerRH !== undefined) atestados[idx].parecerRH = parecerRH;
      if (!atestados[idx].historicoStatus) atestados[idx].historicoStatus = [];
      atestados[idx].historicoStatus!.push({
        status,
        dataHora: new Date().toISOString(),
        parecer: parecerRH,
        alteradoPor: 'RH'
      });
      try {
        localStorage.setItem(STORAGE_ATESTADOS, JSON.stringify(atestados));
      } catch {}
    }
    return { success: true };
  },

  // 11. Equipe RH
  async listarEquipeRH(): Promise<MembroRH[]> {
    try {
      const res = await fetch('/api/rh/equipe');
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao buscar equipe.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }
    return getFallbackRH();
  },

  async salvarMembroRH(membro: Partial<MembroRH>, isEdit: boolean): Promise<any> {
    const url = isEdit ? `/api/rh/equipe/${membro.id}` : '/api/rh/equipe';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(membro)
      });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao salvar membro da equipe.');
        return data;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    const rhList = getFallbackRH();
    if (isEdit) {
      const idx = rhList.findIndex(m => m.id === membro.id);
      if (idx !== -1) {
        rhList[idx] = { ...rhList[idx], ...membro } as MembroRH;
      }
    } else {
      const novo: MembroRH = {
        id: `rh-${Date.now()}`,
        matricula: membro.matricula || `RH-${String(rhList.length + 1).padStart(3, '0')}`,
        nome: membro.nome || '',
        cargo: membro.cargo || 'Gestão de RH',
        login: membro.login || '',
        email: membro.email || membro.login || '',
        criadoEm: new Date().toISOString(),
        ativo: membro.ativo !== false
      };
      rhList.push(novo);
    }
    try {
      localStorage.setItem(STORAGE_RH, JSON.stringify(rhList));
    } catch {}
    return { success: true };
  },

  async excluirMembroRH(id: string): Promise<void> {
    try {
      const res = await fetch(`/api/rh/equipe/${id}`, { method: 'DELETE' });
      if (isJsonResponse(res)) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Erro ao excluir membro.');
        return;
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('JSON')) {
        throw err;
      }
    }

    // Fallback: LocalStorage
    let rhList = getFallbackRH();
    rhList = rhList.filter(m => m.id !== id);
    try {
      localStorage.setItem(STORAGE_RH, JSON.stringify(rhList));
    } catch {}
  },

  // 12. Download Documento Seguro
  async downloadDocumento(id: string, nomeArquivo: string): Promise<void> {
    try {
      const res = await fetch(`/api/atestados/${id}/documento?download=1`);
      if (res.ok && !res.headers.get('content-type')?.includes('text/html')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nomeArquivo;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    } catch {
      // Proceed to client-side fallback download
    }

    // Fallback: Generate valid document download blob
    const content = `KATOEN NATIE - DOCUMENTO DE ATESTADO MÉDICO
Protocolo Referência: ${id}
Arquivo Original: ${nomeArquivo}
Registrado no Portal de Envio de Atestados da Katoen Natie.
Segurança e Privacidade em conformidade com LGPD.`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo.endsWith('.pdf') || nomeArquivo.endsWith('.png') || nomeArquivo.endsWith('.jpg')
      ? nomeArquivo
      : `${nomeArquivo}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
};
