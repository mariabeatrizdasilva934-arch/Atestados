export type StatusAtestado = 'Recebido' | 'Em análise' | 'Aprovado' | 'Pendente' | 'Recusado';

export type TipoDocumento = 'Atestado médico' | 'Declaração' | 'Outro';

export interface HistoricoItem {
  status: StatusAtestado;
  dataHora: string;
  parecer?: string;
  alteradoPor?: string;
}

export interface Atestado {
  id: string;
  protocolo: string;
  nomeCompleto: string;
  matricula: string;
  setor: string;
  dataInicio: string;
  dataTermino: string;
  quantidadeDias: number;
  tipoDocumento: TipoDocumento;
  observacoes?: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoMimeArquivo: string;
  caminhoArquivo?: string;
  temArquivo: boolean;
  dataHoraEnvio: string;
  status: StatusAtestado;
  parecerRH?: string;
  historicoStatus?: HistoricoItem[];
}

export interface AtestadoFormValues {
  nomeCompleto: string;
  matricula: string;
  setor: string;
  dataInicio: string;
  dataTermino: string;
  quantidadeDias: number;
  tipoDocumento: TipoDocumento;
  observacoes: string;
  arquivo: File | null;
}

export interface ConsultaMatriculaItem {
  id: string;
  protocolo: string;
  nomeCompleto: string;
  matricula: string;
  setor: string;
  dataInicio: string;
  dataTermino: string;
  quantidadeDias: number;
  tipoDocumento: TipoDocumento;
  dataHoraEnvio: string;
  status: StatusAtestado;
  parecerRH?: string;
}

export interface DashboardStats {
  total: number;
  recebidos: number;
  emAnalise: number;
  aprovados: number;
  pendentes: number;
  recusados: number;
}

export type UserRole = 'colaborador' | 'rh';

export interface ColaboradorUser {
  matricula: string;
  nomeCompleto: string;
  setor: string;
  role: 'colaborador';
}

export type PerfilRH = 'Equipe de Gestão de RH' | 'Integrante da Equipe';

export interface RHUser {
  id?: string;
  login: string;
  nome: string;
  matricula?: string;
  cargo?: string;
  email?: string;
  role: 'rh';
  perfil?: PerfilRH;
}

export interface MembroRH {
  id: string;
  matricula: string;
  nome: string;
  cargo: string;
  login: string;
  email: string;
  criadoEm: string;
  ativo: boolean;
  perfil?: PerfilRH;
  senhaAlteradaEm?: string;
  senhaAlteradaPor?: string;
}
