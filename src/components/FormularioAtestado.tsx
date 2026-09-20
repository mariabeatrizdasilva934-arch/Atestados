import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  X,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Hash,
  Building,
  Loader2,
  FileCheck,
  Shield
} from 'lucide-react';
import { TipoDocumento, Atestado, ColaboradorUser } from '../types';
import { calcularDiferencaDias, formatarTamanhoArquivo } from '../utils/formatters';
import { api } from '../utils/apiClient';

interface FormularioAtestadoProps {
  onVoltar: () => void;
  onSucesso: (atestado: Atestado) => void;
  colaborador?: ColaboradorUser | null;
}

const SETORES_PADRAO = [
  'Administrativo',
  'Ensaque',
  'Expedição',
  'Manutenção',
  'Outro'
];

export function FormularioAtestado({ onVoltar, onSucesso, colaborador }: FormularioAtestadoProps) {
  // Form fields
  const [nomeCompleto, setNomeCompleto] = useState(colaborador?.nomeCompleto || '');
  const [matricula, setMatricula] = useState(colaborador?.matricula || '');
  const [setor, setSetor] = useState(colaborador?.setor || '');
  const [dataInicio, setDataInicio] = useState('');
  const [dataTermino, setDataTermino] = useState('');
  const [quantidadeDias, setQuantidadeDias] = useState<number | ''>('');
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumento>('Atestado médico');
  const [observacoes, setObservacoes] = useState('');

  // File state
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Validation
  const [submitting, setSubmitting] = useState(false);
  const [errorMensagem, setErrorMensagem] = useState<string | null>(null);
  const [campoErros, setCampoErros] = useState<Record<string, string>>({});

  // Auto-calculate quantity of days when dates change
  useEffect(() => {
    if (dataInicio && dataTermino) {
      const dias = calcularDiferencaDias(dataInicio, dataTermino);
      if (dias > 0) {
        setQuantidadeDias(dias);
      } else {
        setQuantidadeDias('');
      }
    }
  }, [dataInicio, dataTermino]);

  // Clean preview URL on unmount or file change
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle file selection
  const processSelectedFile = (file: File) => {
    setErrorMensagem(null);
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(ext)) {
      setErrorMensagem('Formato de arquivo não aceito. Envie um arquivo PDF, JPG, JPEG ou PNG.');
      return;
    }

    // Limit to 20MB
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMensagem('O arquivo é muito grande. O tamanho máximo permitido é de 20MB.');
      return;
    }

    setArquivo(file);

    // Image preview
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoverArquivo = () => {
    setArquivo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validation
  const validarFormulario = (): boolean => {
    const erros: Record<string, string> = {};
    setErrorMensagem(null);

    if (!nomeCompleto.trim()) {
      erros.nomeCompleto = 'Informe seu nome completo.';
    } else if (nomeCompleto.trim().split(/\s+/).length < 2) {
      erros.nomeCompleto = 'Digite o nome e sobrenome.';
    }

    if (!matricula.trim()) {
      erros.matricula = 'Informe sua matrícula de colaborador.';
    }

    if (!setor.trim()) {
      erros.setor = 'Selecione ou informe seu setor.';
    }

    if (!dataInicio) {
      erros.dataInicio = 'Informe a data de início do atestado.';
    }

    if (!dataTermino) {
      erros.dataTermino = 'Informe a data de término do atestado.';
    } else if (dataInicio && dataTermino < dataInicio) {
      erros.dataTermino = 'A data de término não pode ser anterior à data de início.';
    }

    if (!erros.dataTermino && (!quantidadeDias || Number(quantidadeDias) <= 0)) {
      erros.quantidadeDias = 'A quantidade de dias deve ser pelo menos 1.';
    }

    if (!tipoDocumento) {
      erros.tipoDocumento = 'Selecione o tipo de documento.';
    }

    if (!arquivo) {
      erros.arquivo = 'É obrigatório anexar o arquivo do atestado (PDF, JPG, JPEG ou PNG).';
    }

    setCampoErros(erros);

    if (Object.keys(erros).length > 0) {
      setErrorMensagem('Por favor, preencha todos os campos obrigatórios corretamente.');
      return false;
    }

    return true;
  };

  // Convert file to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setSubmitting(true);
    setErrorMensagem(null);

    try {
      const base64Data = await fileToBase64(arquivo!);

      const payload = {
        nomeCompleto: nomeCompleto.trim(),
        matricula: matricula.trim(),
        setor: setor.trim(),
        dataInicio,
        dataTermino,
        quantidadeDias: Number(quantidadeDias),
        tipoDocumento,
        observacoes: observacoes.trim(),
        arquivo: {
          nome: arquivo!.name,
          tamanho: arquivo!.size,
          tipoMime: arquivo!.type,
          base64: base64Data
        }
      };

      const atestadoEnviado = await api.enviarAtestado(payload);
      onSucesso(atestadoEnviado);
    } catch (err: any) {
      console.error('Erro no envio:', err);
      setErrorMensagem(err.message || 'Falha na conexão com o servidor. Verifique sua conexão.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Top back button */}
      <button
        id="btn-voltar-inicio"
        type="button"
        onClick={onVoltar}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-red-700 mb-6 transition-colors cursor-pointer group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Voltar para tela inicial</span>
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header of the Form - Sophisticated Corporate Slate + Red Accent */}
        <div className="bg-slate-900 border-b-4 border-b-red-600 px-6 sm:px-8 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/10 text-slate-200 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>Protocolo Seguro • Katoen Natie</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Formulário de Envio de Atestado
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Preencha os dados com atenção e anexe seu comprovante legível.
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shrink-0 self-start sm:self-center shadow-xs border border-slate-200">
            <img
              src="/katoen-natie.png"
              alt="Katoen Natie"
              className="h-8 sm:h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMensagem && (
          <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-sm font-medium">
              <p>{errorMensagem}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Seção 1: Dados do Colaborador */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-xs font-black inline-flex items-center justify-center">1</span>
              <User className="w-4 h-4 text-red-600" />
              Identificação do Colaborador
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome Completo */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="input-nome-completo"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Nome completo do colaborador <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-nome-completo"
                  type="text"
                  placeholder="Nome completo do colaborador"
                  value={nomeCompleto}
                  onChange={e => {
                    setNomeCompleto(e.target.value);
                    if (campoErros.nomeCompleto) {
                      setCampoErros(prev => ({ ...prev, nomeCompleto: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    campoErros.nomeCompleto
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-500 text-red-900'
                      : 'border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                  }`}
                />
                {campoErros.nomeCompleto && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {campoErros.nomeCompleto}
                  </p>
                )}
              </div>

              {/* Matrícula */}
              <div>
                <label
                  htmlFor="input-matricula"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Matrícula <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </span>
                  <input
                    id="input-matricula"
                    type="text"
                    placeholder="Matrícula do colaborador"
                    value={matricula}
                    onChange={e => {
                      setMatricula(e.target.value.toUpperCase());
                      if (campoErros.matricula) {
                        setCampoErros(prev => ({ ...prev, matricula: '' }));
                      }
                    }}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm uppercase transition-all focus:outline-hidden focus:ring-2 ${
                      campoErros.matricula
                        ? 'border-red-400 bg-red-50/50 focus:ring-red-500 text-red-900'
                        : 'border-slate-300 bg-white hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  />
                </div>
                {campoErros.matricula && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {campoErros.matricula}
                  </p>
                )}
              </div>

              {/* Setor */}
              <div>
                <label
                  htmlFor="select-setor"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Setor <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </span>
                  <select
                    id="select-setor"
                    value={setor}
                    onChange={e => {
                      setSetor(e.target.value);
                      if (campoErros.setor) {
                        setCampoErros(prev => ({ ...prev, setor: '' }));
                      }
                    }}
                    className={`w-full pl-10 pr-8 py-3 rounded-xl border text-sm transition-all bg-white focus:outline-hidden focus:ring-2 ${
                      campoErros.setor
                        ? 'border-red-400 bg-red-50/50 focus:ring-red-500 text-red-900'
                        : 'border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  >
                    <option value="">Selecione o seu setor...</option>
                    {SETORES_PADRAO.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                {campoErros.setor && (
                  <p className="text-xs text-red-600 mt-1 font-medium">{campoErros.setor}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção 2: Dados do Período e Documento */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-slate-900 text-white text-xs font-black inline-flex items-center justify-center">2</span>
              <Calendar className="w-4 h-4 text-red-600" />
              Período e Tipo do Documento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Data Início */}
              <div>
                <label
                  htmlFor="input-data-inicio"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Data de início <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-data-inicio"
                  type="date"
                  value={dataInicio}
                  onChange={e => {
                    setDataInicio(e.target.value);
                    if (campoErros.dataInicio) {
                      setCampoErros(prev => ({ ...prev, dataInicio: '' }));
                    }
                  }}
                  className={`w-full px-3 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    campoErros.dataInicio
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                      : 'border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                  }`}
                />
                {campoErros.dataInicio && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {campoErros.dataInicio}
                  </p>
                )}
              </div>

              {/* Data Término */}
              <div>
                <label
                  htmlFor="input-data-termino"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Data de término <span className="text-red-600">*</span>
                </label>
                <input
                  id="input-data-termino"
                  type="date"
                  value={dataTermino}
                  min={dataInicio || undefined}
                  onChange={e => {
                    setDataTermino(e.target.value);
                    if (campoErros.dataTermino) {
                      setCampoErros(prev => ({ ...prev, dataTermino: '' }));
                    }
                  }}
                  className={`w-full px-3 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                    campoErros.dataTermino
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                      : 'border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                  }`}
                />
                {campoErros.dataTermino && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {campoErros.dataTermino}
                  </p>
                )}
              </div>

              {/* Quantidade de Dias */}
              <div>
                <label
                  htmlFor="input-quantidade-dias"
                  className="block text-sm font-semibold text-slate-700 mb-1"
                >
                  Quantidade de dias <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    id="input-quantidade-dias"
                    type="number"
                    min="1"
                    max="180"
                    placeholder="Ex: 3"
                    value={quantidadeDias}
                    onChange={e => {
                      const val = e.target.value ? parseInt(e.target.value, 10) : '';
                      setQuantidadeDias(val);
                      if (campoErros.quantidadeDias) {
                        setCampoErros(prev => ({ ...prev, quantidadeDias: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-hidden focus:ring-2 ${
                      campoErros.quantidadeDias
                        ? 'border-red-400 bg-red-50/50 focus:ring-red-500'
                        : 'border-slate-300 hover:border-slate-400 focus:border-red-600 focus:ring-red-600/20'
                    }`}
                  />
                  <span className="absolute right-3.5 top-3.5 text-xs font-semibold text-slate-400">
                    dias
                  </span>
                </div>
                {campoErros.quantidadeDias && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    {campoErros.quantidadeDias}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de Documento */}
            <div className="mt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tipo de documento <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['Atestado médico', 'Declaração', 'Outro'] as TipoDocumento[]).map(tipo => {
                  const isSelected = tipoDocumento === tipo;
                  return (
                    <label
                      key={tipo}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-red-600 bg-red-50/60 ring-2 ring-red-600/20 text-red-950 font-semibold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoDocumento"
                        value={tipo}
                        checked={isSelected}
                        onChange={() => setTipoDocumento(tipo)}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300"
                      />
                      <span className="text-sm">{tipo}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Observações */}
            <div className="mt-4">
              <label
                htmlFor="textarea-observacoes"
                className="block text-sm font-semibold text-slate-700 mb-1"
              >
                Campo para observações <span className="text-xs font-normal text-slate-700">(opcional)</span>
              </label>
              <textarea
                id="textarea-observacoes"
                rows={3}
                placeholder="Observações ou informações adicionais sobre o atestado (opcional)"
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 hover:border-slate-400 text-sm focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-hidden transition-all"
              ></textarea>
            </div>
          </div>

          {/* Seção 3: Upload do Documento */}
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 mb-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-red-600 text-white text-xs font-black inline-flex items-center justify-center shadow-xs">3</span>
              <UploadCloud className="w-4 h-4 text-red-600" />
              Upload do Documento <span className="text-red-600">*</span>
            </h3>
            <p className="text-xs text-slate-600 mb-3 font-medium">
              Permitido apenas 1 arquivo por envio. Aceita formatos: <strong className="text-slate-900">PDF, JPG, JPEG e PNG</strong> (máx. 20MB).
            </p>

            {/* Dropzone or Attached file box */}
            {!arquivo ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-red-600 bg-red-50/70 scale-[1.01]'
                    : campoErros.arquivo
                    ? 'border-red-300 bg-red-50/30'
                    : 'border-slate-300 hover:border-red-500 hover:bg-slate-50/70 bg-white'
                }`}
              >
                <input
                  id="input-arquivo-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <p className="text-sm font-bold text-slate-800">
                  Clique para selecionar ou arraste o arquivo aqui
                </p>
                <p className="text-xs text-slate-700 mt-1">
                  Pelo celular: você pode fotografar diretamente a receita/atestado
                </p>

                <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-50/80 px-3 py-1.5 rounded-lg border border-red-100">
                  <FileCheck className="w-3.5 h-3.5" />
                  PDF, JPG, JPEG ou PNG
                </div>
              </div>
            ) : (
              /* Attached file card */
              <div className="border border-emerald-300 bg-emerald-50/40 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Pré-visualização"
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <FileText className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Arquivo anexado com sucesso
                        </span>
                      </div>
                      <p className="font-bold text-slate-900 text-sm mt-1 break-all">
                        {arquivo.name}
                      </p>
                      <p className="text-xs text-slate-700 mt-0.5">
                        Tamanho: {formatarTamanhoArquivo(arquivo.size)} • {arquivo.type || 'Documento'}
                      </p>
                    </div>
                  </div>

                  {/* Remove button */}
                  <button
                    id="btn-remover-arquivo"
                    type="button"
                    onClick={handleRemoverArquivo}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remover arquivo selecionado"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {campoErros.arquivo && (
              <p className="text-xs text-red-600 mt-2 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {campoErros.arquivo}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              id="btn-cancelar-formulario"
              type="button"
              onClick={onVoltar}
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              id="btn-submit-atestado"
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-black tracking-wide text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-lg shadow-red-600/30 ring-4 ring-red-600/10 hover:ring-red-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando atestado...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-5 h-5" />
                  <span>ENVIAR ATESTADO</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
