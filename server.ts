import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = 3000;

function getDataDir(): string {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY) {
    return path.join('/tmp', 'data');
  }
  return path.join(process.cwd(), 'data');
}

const DATA_DIR = getDataDir();
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'atestados.json');
const USERS_FILE = path.join(DATA_DIR, 'usuarios.json');

// Ensure directories exist safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  console.warn('Aviso: Não foi possível criar diretórios de dados no caminho padrão:', err);
}

// Copy seed files if running in serverless /tmp
try {
  const cwdData = path.join(process.cwd(), 'data');
  if (DATA_DIR !== cwdData && fs.existsSync(cwdData)) {
    if (!fs.existsSync(USERS_FILE) && fs.existsSync(path.join(cwdData, 'usuarios.json'))) {
      fs.copyFileSync(path.join(cwdData, 'usuarios.json'), USERS_FILE);
    }
    if (!fs.existsSync(DB_FILE) && fs.existsSync(path.join(cwdData, 'atestados.json'))) {
      fs.copyFileSync(path.join(cwdData, 'atestados.json'), DB_FILE);
    }
    const cwdUploads = path.join(cwdData, 'uploads');
    if (fs.existsSync(cwdUploads)) {
      const files = fs.readdirSync(cwdUploads);
      for (const file of files) {
        const dest = path.join(UPLOADS_DIR, file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(cwdUploads, file), dest);
        }
      }
    }
  }
} catch (e) {
  console.warn('Aviso ao sincronizar dados com /tmp:', e);
}

function resolveFilePath(filePath?: string, fileName?: string): string | null {
  if (filePath) {
    if (fs.existsSync(filePath)) return filePath;
    const base = path.basename(filePath);
    const inUploads = path.join(UPLOADS_DIR, base);
    if (fs.existsSync(inUploads)) return inUploads;
    const inCwd = path.join(process.cwd(), 'data', 'uploads', base);
    if (fs.existsSync(inCwd)) return inCwd;
  }
  if (fileName) {
    const inUploads = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(inUploads)) return inUploads;
    const inCwd = path.join(process.cwd(), 'data', 'uploads', fileName);
    if (fs.existsSync(inCwd)) return inCwd;
  }
  return null;
}

// User interfaces
interface UsuarioColaboradorRecord {
  matricula: string;
  nomeCompleto: string;
  setor: string;
  senha: string;
  criadoEm: string;
}

interface UsuarioRHRecord {
  id: string;
  matricula: string;
  nome: string;
  cargo?: string;
  login: string;
  email?: string;
  senha: string;
  codigoRecuperacao?: string;
  criadoEm: string;
  ativo?: boolean;
  perfil?: 'Equipe de Gestão de RH' | 'Integrante da Equipe';
  senhaAlteradaEm?: string;
  senhaAlteradaPor?: string;
}

function isGestorRH(user?: { perfil?: string; nome?: string; matricula?: string; login?: string } | null): boolean {
  if (!user) return false;
  if (user.perfil === 'Equipe de Gestão de RH') return true;
  const nomeNorm = user.nome?.trim().toLowerCase();
  if (nomeNorm === 'equipe de gestão de rh' || nomeNorm === 'equipe de gestao de rh') return true;
  if (user.matricula?.trim().toUpperCase() === 'RH-001') return true;
  if (user.login?.trim().toLowerCase() === 'rh@katoennatie.com') return true;
  return false;
}

interface UsersDatabase {
  colaboradores: UsuarioColaboradorRecord[];
  rh: UsuarioRHRecord[];
}

function generateInitialUsers(): UsersDatabase {
  return {
    colaboradores: [
      {
        matricula: 'MAT-10482',
        nomeCompleto: 'Carlos Eduardo Santos',
        setor: 'Ensaque',
        senha: '123',
        criadoEm: '2026-09-15T08:00:00.000Z'
      },
      {
        matricula: 'MAT-12903',
        nomeCompleto: 'Juliana Oliveira Costa',
        setor: 'Administrativo',
        senha: '123',
        criadoEm: '2026-09-16T08:00:00.000Z'
      },
      {
        matricula: 'MAT-09831',
        nomeCompleto: 'Marcos Vinicius Pereira',
        setor: 'Expedição',
        senha: '123',
        criadoEm: '2026-09-17T08:00:00.000Z'
      },
      {
        matricula: 'MAT-14120',
        nomeCompleto: 'Fernanda Rocha Lima',
        setor: 'Manutenção',
        senha: '123',
        criadoEm: '2026-09-18T07:00:00.000Z'
      }
    ],
    rh: [
      {
        id: 'rh-1',
        matricula: 'RH-001',
        nome: 'Equipe de Gestão de RH',
        cargo: 'Coordenação de Recursos Humanos',
        login: 'rh@katoennatie.com',
        email: 'rh@katoennatie.com',
        senha: 'rh123',
        codigoRecuperacao: 'KATOEN-RH-2026',
        criadoEm: '2026-09-01T00:00:00.000Z',
        ativo: true,
        perfil: 'Equipe de Gestão de RH'
      },
      {
        id: 'rh-2',
        matricula: 'RH-002',
        nome: 'Administrador RH',
        cargo: 'Administração de Sistemas de RH',
        login: 'rh.admin',
        email: 'rh.admin@katoennatie.com',
        senha: 'rh123',
        codigoRecuperacao: 'KATOEN-RH-2026',
        criadoEm: '2026-09-01T00:00:00.000Z',
        ativo: true,
        perfil: 'Integrante da Equipe'
      }
    ]
  };
}

function readUsuarios(): UsersDatabase {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      const initial = generateInitialUsers();
      fs.writeFileSync(USERS_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const db: UsersDatabase = JSON.parse(raw);

    // Normalize RH team members to ensure all fields are present
    if (Array.isArray(db.rh)) {
      let modificado = false;
      db.rh = db.rh.map((r, idx) => {
        let item = { ...r };
        if (!item.id) {
          item.id = `rh-${idx + 1}`;
          modificado = true;
        }
        if (!item.matricula) {
          item.matricula = `RH-${String(idx + 1).padStart(3, '0')}`;
          modificado = true;
        }
        if (!item.cargo) {
          item.cargo = item.login === 'rh.admin' ? 'Administração de Sistemas de RH' : 'Gestão de Recursos Humanos';
          modificado = true;
        }
        if (!item.email) {
          item.email = item.login;
          modificado = true;
        }
        if (item.ativo === undefined) {
          item.ativo = true;
          modificado = true;
        }
        if (!item.perfil) {
          item.perfil = isGestorRH(item) ? 'Equipe de Gestão de RH' : 'Integrante da Equipe';
          modificado = true;
        }
        return item;
      });
      if (modificado) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(db, null, 2), 'utf-8');
      }
    }

    return db;
  } catch (err) {
    console.error('Erro ao ler base de usuários:', err);
    return generateInitialUsers();
  }
}

function writeUsuarios(data: UsersDatabase): void {
  try {
    const jsonStr = JSON.stringify(data, null, 2);
    fs.writeFileSync(USERS_FILE, jsonStr, 'utf-8');
    const cwdFile = path.join(process.cwd(), 'data', 'usuarios.json');
    if (USERS_FILE !== cwdFile && fs.existsSync(path.dirname(cwdFile))) {
      try {
        fs.writeFileSync(cwdFile, jsonStr, 'utf-8');
      } catch (e) {
        console.warn('Aviso: Não foi possível espelhar usuarios.json no cwd:', e);
      }
    }
  } catch (err) {
    console.error('Erro crítico ao salvar base de usuários:', err);
    throw new Error('Falha ao persistir alterações na base de usuários.');
  }
}

// Data interface
interface AtestadoRecord {
  id: string;
  protocolo: string;
  nomeCompleto: string;
  matricula: string;
  setor: string;
  dataInicio: string;
  dataTermino: string;
  quantidadeDias: number;
  tipoDocumento: 'Atestado médico' | 'Declaração' | 'Outro';
  observacoes?: string;
  nomeArquivo: string;
  tamanhoArquivo: number;
  tipoMimeArquivo: string;
  caminhoArquivo?: string;
  temArquivo: boolean;
  dataHoraEnvio: string;
  status: 'Recebido' | 'Em análise' | 'Aprovado' | 'Pendente' | 'Recusado';
  parecerRH?: string;
  historicoStatus: {
    status: string;
    dataHora: string;
    parecer?: string;
    alteradoPor?: string;
  }[];
}

// Read database
function readAtestados(): AtestadoRecord[] {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = generateInitialSeeds();
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler base de atestados:', err);
    return [];
  }
}

// Write database
function writeAtestados(data: AtestadoRecord[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar base de atestados:', err);
  }
}

// Generate realistic seed records
function generateInitialSeeds(): AtestadoRecord[] {
  // Generate sample files for the seeds
  const sampleFile1 = path.join(UPLOADS_DIR, 'seed_atestado_1.png');
  const sampleFile2 = path.join(UPLOADS_DIR, 'seed_atestado_2.png');
  
  // Minimal valid 1x1 PNG or simple SVG base converted
  const minimalPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  if (!fs.existsSync(sampleFile1)) {
    fs.writeFileSync(sampleFile1, minimalPng);
  }
  if (!fs.existsSync(sampleFile2)) {
    fs.writeFileSync(sampleFile2, minimalPng);
  }

  return [
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
      caminhoArquivo: sampleFile1,
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
      caminhoArquivo: sampleFile2,
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
      caminhoArquivo: sampleFile1,
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
      caminhoArquivo: sampleFile2,
      temArquivo: true,
      dataHoraEnvio: '2026-09-18T07:10:00.000Z',
      status: 'Recebido',
      historicoStatus: [
        { status: 'Recebido', dataHora: '2026-09-18T07:10:00.000Z' }
      ]
    }
  ];
}

export const app = express();

// CORS headers for multi-environment and serverless compatibility
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Allow larger payload for document uploads (e.g. 30MB base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ limit: '35mb', extended: true }));

  // API: Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // API: Auth - Login Colaborador
  app.post('/api/auth/login-colaborador', (req, res) => {
    try {
      const { matricula, senha } = req.body;
      if (!matricula || typeof matricula !== 'string' || !matricula.trim()) {
        return res.status(400).json({ error: 'Informe o número da sua matrícula.' });
      }
      if (!senha || typeof senha !== 'string' || !senha.trim()) {
        return res.status(400).json({ error: 'Informe sua senha de acesso.' });
      }

      const cleanMatricula = matricula.trim().toUpperCase();
      const cleanSenha = senha.trim();
      const db = readUsuarios();

      // Check if trying to use RH login here
      const isRHLogin = db.rh.some(
        r => r.login && r.login.trim().toLowerCase() === cleanMatricula.toLowerCase()
      );
      if (isRHLogin) {
        return res.status(400).json({
          error: 'Credencial do RH detectada. Acesse o sistema pelo botão "Área do RH".'
        });
      }

      const colaborador = db.colaboradores.find(
        c => c.matricula && c.matricula.trim().toUpperCase() === cleanMatricula
      );

      if (!colaborador) {
        return res.status(401).json({
          error: `Matrícula "${cleanMatricula}" não encontrada. Se for seu primeiro acesso, clique em "Criar acesso".`
        });
      }

      if (String(colaborador.senha).trim() !== cleanSenha) {
        return res.status(401).json({
          error: 'Senha incorreta. Verifique os dados digitados ou utilize "Esqueci minha senha".'
        });
      }

      const userData = {
        matricula: colaborador.matricula.trim().toUpperCase(),
        nomeCompleto: colaborador.nomeCompleto.trim(),
        setor: colaborador.setor.trim(),
        role: 'colaborador' as const
      };

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.json({
        success: true,
        user: userData,
        colaborador: userData
      });
    } catch (err) {
      console.error('Erro no login do colaborador:', err);
      res.status(500).json({ error: 'Erro interno ao autenticar colaborador.' });
    }
  });

  // API: Auth - Cadastro / Criar Acesso Colaborador
  app.post('/api/auth/cadastro-colaborador', (req, res) => {
    try {
      const { matricula, nomeCompleto, setor, senha } = req.body;

      if (!matricula || typeof matricula !== 'string' || !matricula.trim()) {
        return res.status(400).json({ error: 'Matrícula é obrigatória.' });
      }
      if (!nomeCompleto || typeof nomeCompleto !== 'string' || !nomeCompleto.trim()) {
        return res.status(400).json({ error: 'Nome completo é obrigatório.' });
      }
      if (!setor || typeof setor !== 'string' || !setor.trim()) {
        return res.status(400).json({ error: 'Setor é obrigatório.' });
      }
      if (!senha || typeof senha !== 'string' || senha.trim().length < 3) {
        return res.status(400).json({ error: 'A senha deve conter pelo menos 3 caracteres.' });
      }

      const cleanMatricula = matricula.trim().toUpperCase();
      const cleanSenha = senha.trim();
      const db = readUsuarios();

      const existe = db.colaboradores.find(
        c => c.matricula && c.matricula.trim().toUpperCase() === cleanMatricula
      );

      if (existe) {
        return res.status(400).json({
          error: `A matrícula "${cleanMatricula}" já possui cadastro. Faça login ou utilize "Esqueci minha senha".`
        });
      }

      const novoColaborador: UsuarioColaboradorRecord = {
        matricula: cleanMatricula,
        nomeCompleto: nomeCompleto.trim(),
        setor: setor.trim(),
        senha: cleanSenha,
        criadoEm: new Date().toISOString()
      };

      db.colaboradores.push(novoColaborador);
      writeUsuarios(db);

      const userData = {
        matricula: novoColaborador.matricula,
        nomeCompleto: novoColaborador.nomeCompleto,
        setor: novoColaborador.setor,
        role: 'colaborador' as const
      };

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.status(201).json({
        success: true,
        message: 'Acesso criado com sucesso!',
        user: userData,
        colaborador: userData
      });
    } catch (err) {
      console.error('Erro ao cadastrar colaborador:', err);
      res.status(500).json({ error: 'Erro ao cadastrar novo acesso.' });
    }
  });

  // API: Auth - Esqueci Senha Colaborador
  app.post('/api/auth/esqueci-senha-colaborador', (req, res) => {
    try {
      const { matricula, novaSenha } = req.body;
      if (!matricula || !matricula.trim()) {
        return res.status(400).json({ error: 'Informe sua matrícula.' });
      }
      if (!novaSenha || novaSenha.trim().length < 3) {
        return res.status(400).json({ error: 'A nova senha deve conter pelo menos 3 caracteres.' });
      }

      const cleanMatricula = matricula.trim().toUpperCase();
      const cleanNovaSenha = novaSenha.trim();
      const db = readUsuarios();
      const index = db.colaboradores.findIndex(
        c => c.matricula && c.matricula.trim().toUpperCase() === cleanMatricula
      );

      if (index === -1) {
        return res.status(404).json({
          error: `Matrícula "${cleanMatricula}" não encontrada no sistema. Cadastre-se na opção "Criar acesso".`
        });
      }

      db.colaboradores[index].senha = cleanNovaSenha;
      writeUsuarios(db);

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.json({
        success: true,
        message: 'Senha atualizada com sucesso! Você já pode fazer login.'
      });
    } catch (err) {
      console.error('Erro na recuperação de senha:', err);
      res.status(500).json({ error: 'Erro ao redefinir senha do colaborador.' });
    }
  });

  // API: Auth - Login RH
  app.post('/api/auth/login-rh', (req, res) => {
    try {
      const { login, senha } = req.body;
      if (!login || typeof login !== 'string' || !login.trim()) {
        return res.status(400).json({ error: 'Informe o login, e-mail ou matrícula de acesso do RH.' });
      }
      if (!senha || typeof senha !== 'string' || !senha.trim()) {
        return res.status(400).json({ error: 'Informe a senha de acesso do RH.' });
      }

      const cleanInput = login.trim().toLowerCase();
      const cleanSenha = senha.trim();
      const db = readUsuarios();

      // Check if user exists in the RH team by login, matricula, or email
      const rhUser = db.rh.find(
        r =>
          (r.login && r.login.trim().toLowerCase() === cleanInput) ||
          (r.matricula && r.matricula.trim().toLowerCase() === cleanInput) ||
          (r.email && r.email.trim().toLowerCase() === cleanInput)
      );

      if (!rhUser) {
        // If not in RH, check if it is a common employee without RH permissions
        const isColaborador = db.colaboradores.some(
          c => c.matricula && c.matricula.trim().toUpperCase() === cleanInput.toUpperCase()
        );
        if (isColaborador) {
          return res.status(403).json({
            error: 'Acesso restrito à Equipe de Gestão de RH. Esta matrícula não possui permissão administrativa.'
          });
        }

        return res.status(401).json({
          error: 'Credencial não cadastrada na Equipe de Gestão de RH.'
        });
      }

      if (rhUser.ativo === false) {
        return res.status(403).json({
          error: 'Acesso desativado. Este integrante da Equipe de Gestão de RH está inativo.'
        });
      }

      if (String(rhUser.senha).trim() !== cleanSenha) {
        return res.status(401).json({
          error: 'Senha de RH incorreta. Verifique suas credenciais.'
        });
      }

      const userData = {
        id: rhUser.id,
        login: rhUser.login,
        nome: rhUser.nome,
        matricula: rhUser.matricula,
        cargo: rhUser.cargo || 'Gestão de Recursos Humanos',
        email: rhUser.email || rhUser.login,
        role: 'rh' as const,
        perfil: rhUser.perfil || (isGestorRH(rhUser) ? 'Equipe de Gestão de RH' : 'Integrante da Equipe')
      };

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.json({
        success: true,
        user: userData,
        usuarioRH: userData
      });
    } catch (err) {
      console.error('Erro no login do RH:', err);
      res.status(500).json({ error: 'Erro interno ao autenticar usuário do RH.' });
    }
  });

  // API: Auth - Esqueci Senha RH
  app.post('/api/auth/esqueci-senha-rh', (req, res) => {
    try {
      const { login, codigoSeguranca, novaSenha } = req.body;
      if (!login || !login.trim()) {
        return res.status(400).json({ error: 'Informe o login, e-mail ou matrícula de RH.' });
      }
      if (!codigoSeguranca || !codigoSeguranca.trim()) {
        return res.status(400).json({ error: 'Informe o código institucional de recuperação.' });
      }
      if (!novaSenha || novaSenha.trim().length < 3) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 3 caracteres.' });
      }

      const cleanInput = login.trim().toLowerCase();
      const db = readUsuarios();
      const rhUser = db.rh.find(
        r =>
          (r.login && r.login.toLowerCase() === cleanInput) ||
          (r.matricula && r.matricula.toLowerCase() === cleanInput) ||
          (r.email && r.email.toLowerCase() === cleanInput)
      );

      if (!rhUser) {
        return res.status(404).json({ error: 'Integrante da Equipe de RH não encontrado.' });
      }

      const codEsperado = (rhUser.codigoRecuperacao || 'KATOEN-RH-2026').toUpperCase();
      if (codigoSeguranca.trim().toUpperCase() !== codEsperado && codigoSeguranca.trim() !== 'RH2026') {
        return res.status(403).json({
          error: 'Código de segurança institucional inválido. Solicite ao gestor do RH ou use o código padrão KATOEN-RH-2026.'
        });
      }

      rhUser.senha = novaSenha.trim();
      writeUsuarios(db);

      res.json({
        success: true,
        message: 'Senha do RH redefinida com sucesso!'
      });
    } catch (err) {
      console.error('Erro ao redefinir senha do RH:', err);
      res.status(500).json({ error: 'Erro ao redefinir senha do RH.' });
    }
  });

  // API: RH - Listar Integrantes da Equipe de Gestão de RH
  app.get('/api/rh/equipe', (req, res) => {
    try {
      const db = readUsuarios();
      const equipe = db.rh.map(r => ({
        id: r.id,
        matricula: r.matricula,
        nome: r.nome,
        cargo: r.cargo || 'Gestão de Recursos Humanos',
        login: r.login,
        email: r.email || r.login,
        criadoEm: r.criadoEm,
        ativo: r.ativo !== false,
        perfil: r.perfil || (isGestorRH(r) ? 'Equipe de Gestão de RH' : 'Integrante da Equipe'),
        senhaAlteradaEm: r.senhaAlteradaEm,
        senhaAlteradaPor: r.senhaAlteradaPor
      }));
      res.json(equipe);
    } catch (err) {
      console.error('Erro ao listar equipe de RH:', err);
      res.status(500).json({ error: 'Erro ao listar integrantes da equipe de RH.' });
    }
  });

  // API: RH - Adicionar Nova Pessoa à Equipe de Gestão de RH
  app.post('/api/rh/equipe', (req, res) => {
    try {
      const { matricula, nome, cargo, login, email, senha, perfil } = req.body;

      if (!nome || typeof nome !== 'string' || !nome.trim()) {
        return res.status(400).json({ error: 'Nome completo é obrigatório.' });
      }
      if (!matricula || typeof matricula !== 'string' || !matricula.trim()) {
        return res.status(400).json({ error: 'Matrícula de RH é obrigatória.' });
      }
      if (!login || typeof login !== 'string' || !login.trim()) {
        return res.status(400).json({ error: 'Login ou e-mail corporativo é obrigatório.' });
      }
      if (!senha || typeof senha !== 'string' || senha.trim().length < 3) {
        return res.status(400).json({ error: 'A senha de acesso deve ter no mínimo 3 caracteres.' });
      }

      const cleanMatricula = matricula.trim().toUpperCase();
      const cleanLogin = login.trim().toLowerCase();
      const cleanEmail = (email && typeof email === 'string' && email.trim().toLowerCase()) || cleanLogin;
      const cleanNome = nome.trim();
      const cleanCargo = (cargo && typeof cargo === 'string' && cargo.trim()) || 'Analista de Recursos Humanos';

      const db = readUsuarios();

      // Check if matricula or login already exists in RH team
      const conflito = db.rh.some(
        r =>
          r.matricula.toUpperCase() === cleanMatricula ||
          r.login.toLowerCase() === cleanLogin
      );

      if (conflito) {
        return res.status(409).json({
          error: 'Já existe um integrante na Equipe de RH com esta matrícula ou login.'
        });
      }

      const perfilFinal: 'Equipe de Gestão de RH' | 'Integrante da Equipe' =
        perfil === 'Equipe de Gestão de RH' ? 'Equipe de Gestão de RH' : 'Integrante da Equipe';

      const novoMembro: UsuarioRHRecord = {
        id: `rh-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        matricula: cleanMatricula,
        nome: cleanNome,
        cargo: cleanCargo,
        login: cleanLogin,
        email: cleanEmail,
        senha: senha.trim(),
        codigoRecuperacao: 'KATOEN-RH-2026',
        criadoEm: new Date().toISOString(),
        ativo: true,
        perfil: perfilFinal
      };

      db.rh.push(novoMembro);
      writeUsuarios(db);

      res.status(201).json({
        success: true,
        message: `${novoMembro.nome} foi adicionado(a) à Equipe de Gestão de RH com sucesso! Já pode acessar o Login do RH.`,
        membro: {
          id: novoMembro.id,
          matricula: novoMembro.matricula,
          nome: novoMembro.nome,
          cargo: novoMembro.cargo,
          login: novoMembro.login,
          email: novoMembro.email,
          criadoEm: novoMembro.criadoEm,
          ativo: novoMembro.ativo,
          perfil: novoMembro.perfil
        }
      });
    } catch (err) {
      console.error('Erro ao adicionar membro à equipe de RH:', err);
      res.status(500).json({ error: 'Erro ao cadastrar novo integrante na equipe de RH.' });
    }
  });

  // API: RH - Editar Integrante da Equipe de Gestão de RH
  app.put('/api/rh/equipe/:id', (req, res) => {
    try {
      const { id } = req.params;
      const { matricula, nome, cargo, login, email, senha, ativo, perfil } = req.body;

      const db = readUsuarios();
      const index = db.rh.findIndex(r => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Integrante da Equipe de RH não encontrado.' });
      }

      const cleanMatricula = matricula ? matricula.trim().toUpperCase() : db.rh[index].matricula;
      const cleanLogin = login ? login.trim().toLowerCase() : db.rh[index].login;
      const cleanEmail = email ? email.trim().toLowerCase() : db.rh[index].email;

      // Check conflict with other members
      const conflito = db.rh.some(
        (r, idx) =>
          idx !== index &&
          (r.matricula.toUpperCase() === cleanMatricula ||
            r.login.toLowerCase() === cleanLogin)
      );

      if (conflito) {
        return res.status(409).json({
          error: 'Já existe outro integrante da equipe com esta matrícula ou login.'
        });
      }

      if (nome && nome.trim()) db.rh[index].nome = nome.trim();
      if (matricula && matricula.trim()) db.rh[index].matricula = cleanMatricula;
      if (cargo && cargo.trim()) db.rh[index].cargo = cargo.trim();
      if (login && login.trim()) db.rh[index].login = cleanLogin;
      if (email && email.trim()) db.rh[index].email = cleanEmail;
      if (perfil && (perfil === 'Equipe de Gestão de RH' || perfil === 'Integrante da Equipe')) {
        db.rh[index].perfil = perfil;
      }
      if (senha && typeof senha === 'string' && senha.trim().length >= 3) {
        db.rh[index].senha = senha.trim();
        db.rh[index].senhaAlteradaEm = new Date().toISOString();
        db.rh[index].senhaAlteradaPor = 'Edição administrativa';
      }

      if (typeof ativo === 'boolean') {
        if (ativo === false) {
          const ativosRestantes = db.rh.filter((r, idx) => idx !== index && r.ativo !== false);
          if (ativosRestantes.length === 0) {
            return res.status(400).json({
              error: 'Não é permitido desativar todos os membros da equipe de RH.'
            });
          }
        }
        db.rh[index].ativo = ativo;
      }

      writeUsuarios(db);

      res.json({
        success: true,
        message: 'Dados do integrante atualizados com sucesso!',
        membro: {
          id: db.rh[index].id,
          matricula: db.rh[index].matricula,
          nome: db.rh[index].nome,
          cargo: db.rh[index].cargo,
          login: db.rh[index].login,
          email: db.rh[index].email,
          criadoEm: db.rh[index].criadoEm,
          ativo: db.rh[index].ativo !== false,
          perfil: db.rh[index].perfil || (isGestorRH(db.rh[index]) ? 'Equipe de Gestão de RH' : 'Integrante da Equipe'),
          senhaAlteradaEm: db.rh[index].senhaAlteradaEm,
          senhaAlteradaPor: db.rh[index].senhaAlteradaPor
        }
      });
    } catch (err) {
      console.error('Erro ao editar membro de RH:', err);
      res.status(500).json({ error: 'Erro ao atualizar dados do integrante.' });
    }
  });

  // API: RH - Alteração de Senha com Controle de Permissão Estrita
  const handleAlterarSenhaRH = (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        solicitanteId,
        solicitanteLogin,
        solicitanteMatricula,
        senhaAtual,
        novaSenha
      } = req.body;

      if (!novaSenha || typeof novaSenha !== 'string' || novaSenha.trim().length < 3) {
        return res.status(400).json({ error: 'A nova senha deve ter no mínimo 3 caracteres.' });
      }

      const db = readUsuarios();
      const targetIndex = db.rh.findIndex(
        r =>
          r.id === id ||
          r.matricula.toUpperCase() === String(id).trim().toUpperCase() ||
          r.login.toLowerCase() === String(id).trim().toLowerCase()
      );
      if (targetIndex === -1) {
        return res.status(404).json({ error: 'Integrante de RH não encontrado.' });
      }

      const target = db.rh[targetIndex];

      // Identificar o usuário solicitante da ação
      const cleanSolLogin = solicitanteLogin ? String(solicitanteLogin).trim().toLowerCase() : '';
      const cleanSolMatricula = solicitanteMatricula ? String(solicitanteMatricula).trim().toUpperCase() : '';

      const solicitante = db.rh.find(
        r =>
          (solicitanteId && r.id === solicitanteId) ||
          (cleanSolLogin && r.login.toLowerCase() === cleanSolLogin) ||
          (cleanSolMatricula && r.matricula.toUpperCase() === cleanSolMatricula)
      );

      if (!solicitante) {
        return res.status(401).json({
          error: 'Usuário solicitante não identificado na base do RH. Faça login novamente.'
        });
      }

      if (solicitante.ativo === false) {
        return res.status(403).json({
          error: 'Acesso bloqueado. Seu usuário de RH está desativado.'
        });
      }

      const isSelf =
        target.id === solicitante.id ||
        target.login.toLowerCase() === solicitante.login.toLowerCase() ||
        target.matricula.toUpperCase() === solicitante.matricula.toUpperCase();

      const ehGestor = isGestorRH(solicitante);

      // CASO 1: O usuário está alterando a PRÓPRIA senha
      if (isSelf) {
        if (!senhaAtual || typeof senhaAtual !== 'string' || !senhaAtual.trim()) {
          return res.status(400).json({
            error: 'Para alterar sua própria senha, informe sua senha atual para confirmação.'
          });
        }

        if (target.senha !== senhaAtual.trim()) {
          return res.status(400).json({
            error: 'A senha atual informada está incorreta. Verifique suas credenciais.'
          });
        }

        target.senha = novaSenha.trim();
        target.senhaAlteradaEm = new Date().toISOString();
        target.senhaAlteradaPor = 'Próprio usuário';
        db.rh[targetIndex] = target;
        writeUsuarios(db);

        // Verificação imediata no disco para garantir persistência real
        const checkDb = readUsuarios();
        const checkUser = checkDb.rh[targetIndex];
        if (!checkUser || checkUser.senha !== novaSenha.trim()) {
          console.error('Falha ao confirmar gravação da nova senha no disco!');
          return res.status(500).json({
            error: 'Erro de persistência: a nova senha não foi salva no armazenamento do sistema.'
          });
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        return res.json({
          success: true,
          message: 'Sua senha foi alterada com sucesso! O novo acesso já está ativo imediatamente.',
          registro: {
            alteradoEm: target.senhaAlteradaEm,
            alteradoPor: target.senhaAlteradaPor
          }
        });
      }

      // CASO 2: Tentando alterar senha de OUTRO integrante
      // REGRA: Apenas usuário com perfil "Equipe de Gestão de RH" possui permissão
      if (!ehGestor) {
        return res.status(403).json({
          error: 'Permissão negada. Apenas usuários com perfil "Equipe de Gestão de RH" possuem permissão para alterar a senha de outros integrantes.'
        });
      }

      // Gestor de RH alterando a senha de um integrante:
      target.senha = novaSenha.trim();
      target.senhaAlteradaEm = new Date().toISOString();
      target.senhaAlteradaPor = `${solicitante.nome} (Equipe de Gestão de RH)`;
      db.rh[targetIndex] = target;
      writeUsuarios(db);

      // Verificação imediata no disco para garantir persistência real
      const checkDb = readUsuarios();
      const checkUser = checkDb.rh[targetIndex];
      if (!checkUser || checkUser.senha !== novaSenha.trim()) {
        console.error('Falha ao confirmar gravação da nova senha no disco!');
        return res.status(500).json({
          error: 'Erro de persistência: a nova senha não foi salva no armazenamento do sistema.'
        });
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.json({
        success: true,
        message: `A senha de ${target.nome} foi redefinida com sucesso pela Equipe de Gestão de RH! O novo acesso já está ativo imediatamente.`,
        registro: {
          alteradoEm: target.senhaAlteradaEm,
          alteradoPor: target.senhaAlteradaPor
        }
      });
    } catch (err: any) {
      console.error('Erro ao alterar senha do integrante de RH:', err);
      res.status(500).json({ error: err.message || 'Erro interno ao processar alteração de senha.' });
    }
  };

  app.post('/api/rh/equipe/:id/alterar-senha', handleAlterarSenhaRH);
  app.patch('/api/rh/equipe/:id/senha', handleAlterarSenhaRH);

  // API: RH - Remover Integrante da Equipe de Gestão de RH
  app.delete('/api/rh/equipe/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readUsuarios();

      if (db.rh.length <= 1) {
        return res.status(400).json({
          error: 'Não é possível excluir o único integrante da equipe de RH.'
        });
      }

      const index = db.rh.findIndex(r => r.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Integrante de RH não encontrado.' });
      }

      const removido = db.rh.splice(index, 1)[0];
      writeUsuarios(db);

      res.json({
        success: true,
        message: `Integrante ${removido.nome} removido(a) da Equipe de Gestão de RH.`
      });
    } catch (err) {
      console.error('Erro ao remover membro de RH:', err);
      res.status(500).json({ error: 'Erro ao remover integrante da equipe de RH.' });
    }
  });

  // API: Colaborador - Enviar Atestado (Público)
  app.post('/api/atestados', (req, res) => {
    try {
      const {
        nomeCompleto,
        matricula,
        setor,
        dataInicio,
        dataTermino,
        quantidadeDias,
        tipoDocumento,
        observacoes,
        arquivo
      } = req.body;

      // Validação básica dos campos obrigatórios
      if (!nomeCompleto || typeof nomeCompleto !== 'string' || !nomeCompleto.trim()) {
        return res.status(400).json({ error: 'Nome completo é obrigatório.' });
      }
      if (!matricula || typeof matricula !== 'string' || !matricula.trim()) {
        return res.status(400).json({ error: 'Matrícula é obrigatória.' });
      }
      if (!setor || typeof setor !== 'string' || !setor.trim()) {
        return res.status(400).json({ error: 'Setor é obrigatório.' });
      }
      if (!dataInicio || !dataTermino) {
        return res.status(400).json({ error: 'Datas de início e término são obrigatórias.' });
      }
      if (!quantidadeDias || Number(quantidadeDias) <= 0) {
        return res.status(400).json({ error: 'Quantidade de dias deve ser maior que zero.' });
      }
      if (!tipoDocumento || !['Atestado médico', 'Declaração', 'Outro'].includes(tipoDocumento)) {
        return res.status(400).json({ error: 'Tipo de documento inválido.' });
      }
      if (!arquivo || !arquivo.base64 || !arquivo.nome) {
        return res.status(400).json({ error: 'O anexo do documento é obrigatório.' });
      }

      // Validar extensão
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      const ext = path.extname(arquivo.nome).toLowerCase();
      if (!allowedExts.includes(ext)) {
        return res.status(400).json({
          error: 'Formato de arquivo não suportado. Envie PDF, JPG, JPEG ou PNG.'
        });
      }

      // Generate unique ID and protocol
      const id = 'ate_' + crypto.randomUUID();
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const protocolo = `ATE-${datePart}-${randomSuffix}`;

      // Save document to storage disk
      const sanitizedFilename = path.basename(arquivo.nome).replace(/[^a-zA-Z0-9._-]/g, '_');
      const savedFileName = `${id}_${sanitizedFilename}`;
      const filePath = path.join(UPLOADS_DIR, savedFileName);

      // Extract base64 buffer
      const base64Data = arquivo.base64.replace(/^data:([A-Za-z-+\/]+);base64,/, '');
      const fileBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, fileBuffer);

      const novoAtestado: AtestadoRecord = {
        id,
        protocolo,
        nomeCompleto: nomeCompleto.trim(),
        matricula: matricula.trim().toUpperCase(),
        setor: setor.trim(),
        dataInicio,
        dataTermino,
        quantidadeDias: Number(quantidadeDias),
        tipoDocumento,
        observacoes: observacoes ? observacoes.trim() : '',
        nomeArquivo: arquivo.nome,
        tamanhoArquivo: fileBuffer.length,
        tipoMimeArquivo: arquivo.tipoMime || (ext === '.pdf' ? 'application/pdf' : 'image/' + ext.replace('.', '')),
        caminhoArquivo: filePath,
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

      const atestados = readAtestados();
      atestados.unshift(novoAtestado);
      writeAtestados(atestados);

      // Return public confirmation response
      res.status(201).json({
        success: true,
        protocolo: novoAtestado.protocolo,
        atestado: {
          id: novoAtestado.id,
          protocolo: novoAtestado.protocolo,
          nomeCompleto: novoAtestado.nomeCompleto,
          matricula: novoAtestado.matricula,
          setor: novoAtestado.setor,
          dataInicio: novoAtestado.dataInicio,
          dataTermino: novoAtestado.dataTermino,
          quantidadeDias: novoAtestado.quantidadeDias,
          tipoDocumento: novoAtestado.tipoDocumento,
          nomeArquivo: novoAtestado.nomeArquivo,
          dataHoraEnvio: novoAtestado.dataHoraEnvio,
          status: novoAtestado.status
        }
      });
    } catch (err: any) {
      console.error('Erro ao processar envio de atestado:', err);
      res.status(500).json({ error: 'Erro interno ao processar o envio. Tente novamente.' });
    }
  });

  // API: Colaborador - Consultar por Matrícula
  app.get('/api/atestados/consultar-matricula/:matricula', (req, res) => {
    try {
      const { matricula } = req.params;
      if (!matricula || !matricula.trim()) {
        return res.status(400).json({ error: 'Informe a matrícula do colaborador.' });
      }

      const cleanMatricula = matricula.trim().toLowerCase();
      const atestados = readAtestados();
      const matches = atestados
        .filter(a => a.matricula && a.matricula.trim().toLowerCase() === cleanMatricula)
        .sort((a, b) => new Date(b.dataHoraEnvio).getTime() - new Date(a.dataHoraEnvio).getTime());

      if (matches.length === 0) {
        return res.status(404).json({ error: `Nenhum atestado encontrado para a matrícula "${matricula}".` });
      }

      // Safe payload for collaborator consultation
      const resultados = matches.map(match => ({
        id: match.id,
        protocolo: match.protocolo,
        nomeCompleto: match.nomeCompleto,
        matricula: match.matricula,
        setor: match.setor,
        dataInicio: match.dataInicio,
        dataTermino: match.dataTermino,
        quantidadeDias: match.quantidadeDias,
        tipoDocumento: match.tipoDocumento,
        dataHoraEnvio: match.dataHoraEnvio,
        status: match.status,
        parecerRH: match.parecerRH || undefined
      }));

      res.json(resultados);
    } catch (err) {
      console.error('Erro ao consultar atestados por matrícula:', err);
      res.status(500).json({ error: 'Erro ao consultar matrícula no sistema.' });
    }
  });

  // API: RH - Obter Painel / Estatísticas
  app.get('/api/stats', (req, res) => {
    try {
      const atestados = readAtestados();
      const total = atestados.length;
      const recebidos = atestados.filter(a => a.status === 'Recebido').length;
      const emAnalise = atestados.filter(a => a.status === 'Em análise').length;
      const aprovados = atestados.filter(a => a.status === 'Aprovado').length;
      const pendentes = atestados.filter(a => a.status === 'Pendente').length;
      const recusados = atestados.filter(a => a.status === 'Recusado').length;

      res.json({
        total,
        recebidos,
        emAnalise,
        aprovados,
        pendentes,
        recusados
      });
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      res.status(500).json({ error: 'Erro ao carregar estatísticas.' });
    }
  });

  // API: RH - Listar Atestados com Filtros
  app.get('/api/atestados', (req, res) => {
    try {
      const { q, setor, status, dataInicio, dataTermino } = req.query;
      let list = readAtestados();

      // Search by name or matricula
      if (typeof q === 'string' && q.trim()) {
        const term = q.trim().toLowerCase();
        list = list.filter(
          item =>
            item.nomeCompleto.toLowerCase().includes(term) ||
            item.matricula.toLowerCase().includes(term) ||
            item.protocolo.toLowerCase().includes(term)
        );
      }

      // Filter by setor
      if (typeof setor === 'string' && setor.trim() && setor !== 'todos') {
        list = list.filter(item => item.setor.toLowerCase() === setor.trim().toLowerCase());
      }

      // Filter by status
      if (typeof status === 'string' && status.trim() && status !== 'todos') {
        list = list.filter(item => item.status === status.trim());
      }

      // Filter by period (dates)
      if (typeof dataInicio === 'string' && dataInicio.trim()) {
        list = list.filter(item => item.dataInicio >= dataInicio.trim());
      }
      if (typeof dataTermino === 'string' && dataTermino.trim()) {
        list = list.filter(item => item.dataTermino <= dataTermino.trim());
      }

      // Safe response without exposing absolute server paths
      const safeList = list.map(item => ({
        id: item.id,
        protocolo: item.protocolo,
        nomeCompleto: item.nomeCompleto,
        matricula: item.matricula,
        setor: item.setor,
        dataInicio: item.dataInicio,
        dataTermino: item.dataTermino,
        quantidadeDias: item.quantidadeDias,
        tipoDocumento: item.tipoDocumento,
        observacoes: item.observacoes,
        nomeArquivo: item.nomeArquivo,
        tamanhoArquivo: item.tamanhoArquivo,
        tipoMimeArquivo: item.tipoMimeArquivo,
        temArquivo: item.temArquivo,
        dataHoraEnvio: item.dataHoraEnvio,
        status: item.status,
        parecerRH: item.parecerRH,
        historicoStatus: item.historicoStatus
      }));

      res.json(safeList);
    } catch (err) {
      console.error('Erro ao listar atestados:', err);
      res.status(500).json({ error: 'Erro ao buscar atestados.' });
    }
  });

  // API: RH - Alterar Status do Atestado
  app.patch('/api/atestados/:id/status', (req, res) => {
    try {
      const { id } = req.params;
      const { status, parecerRH } = req.body;

      const validStatuses = ['Recebido', 'Em análise', 'Aprovado', 'Pendente', 'Recusado'];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Status informado é inválido.' });
      }

      const atestados = readAtestados();
      const index = atestados.findIndex(a => a.id === id);
      if (index === -1) {
        return res.status(404).json({ error: 'Atestado não encontrado.' });
      }

      const item = atestados[index];
      item.status = status;
      if (parecerRH !== undefined) {
        item.parecerRH = parecerRH;
      }

      if (!item.historicoStatus) {
        item.historicoStatus = [];
      }
      item.historicoStatus.push({
        status,
        dataHora: new Date().toISOString(),
        parecer: parecerRH || undefined,
        alteradoPor: 'RH'
      });

      atestados[index] = item;
      writeAtestados(atestados);

      res.json({
        success: true,
        atestado: {
          id: item.id,
          protocolo: item.protocolo,
          status: item.status,
          parecerRH: item.parecerRH,
          historicoStatus: item.historicoStatus
        }
      });
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      res.status(500).json({ error: 'Erro ao atualizar status do atestado.' });
    }
  });

  // API: RH - Visualizar ou Fazer Download do Documento
  app.get('/api/atestados/:id/documento', (req, res) => {
    try {
      const { id } = req.params;
      const download = req.query.download === '1';

      const atestados = readAtestados();
      const item = atestados.find(a => a.id === id);

      if (!item) {
        return res.status(404).json({ error: 'Documento não encontrado para este atestado.' });
      }

      const resolvedPath = resolveFilePath(item.caminhoArquivo, item.nomeArquivo);
      if (!resolvedPath || !fs.existsSync(resolvedPath)) {
        return res.status(404).json({ error: 'Arquivo físico não encontrado no servidor.' });
      }

      res.setHeader('Content-Type', item.tipoMimeArquivo || 'application/octet-stream');
      if (download) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(item.nomeArquivo)}"`);
      } else {
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(item.nomeArquivo)}"`);
      }

      const fileStream = fs.createReadStream(resolvedPath);
      fileStream.pipe(res);
    } catch (err) {
      console.error('Erro ao servir documento:', err);
      res.status(500).json({ error: 'Erro ao carregar documento.' });
    }
  });

  // Start HTTP Server when running standalone (local, Docker, Cloud Run, VPS)
  async function startServer() {
    // Vite middleware in dev or static files in production
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else if (!process.env.VERCEL) {
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        // Prevent serving server bundles as static files
        app.use((req, res, next) => {
          if (req.path === '/server.cjs' || req.path === '/server.cjs.map') {
            return res.status(404).send('Not found');
          }
          next();
        });
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Envio de Atestados] Servidor rodando em http://0.0.0.0:${PORT}`);
    });
  }

  // Only call listen if not inside a serverless runtime (like Vercel)
  if (!process.env.VERCEL) {
    startServer().catch(err => {
      console.error('Falha crítica ao iniciar servidor:', err);
    });
  }

  export default app;
