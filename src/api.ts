// TrueNorth API Client
// Conecta o frontend ao backend real

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Auth Types
export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Auth Functions
export async function register(email: string, password: string, confirmPassword: string, name?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, confirmPassword, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar conta');
  }

  return response.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer login');
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<{ user: User }> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao verificar autenticação');
  }

  return response.json();
}

// Auth helpers
export function getStoredToken(): string | null {
  return localStorage.getItem('truenorth_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('truenorth_token', token);
}

export function removeStoredToken(): void {
  localStorage.removeItem('truenorth_token');
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('truenorth_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setStoredUser(user: User): void {
  localStorage.setItem('truenorth_user', JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem('truenorth_user');
}

export function logout(): void {
  removeStoredToken();
  removeStoredUser();
}

// Tipos
export interface IncotermInfo {
  code: string;
  location?: string;
  location_type?: 'port' | 'airport' | 'city' | 'factory';
  country_code?: string;
  validated?: boolean;
  validation_message?: string;
  suggestions?: string[];
}

export interface ExtractedData {
  invoice_number: string;
  invoice_date: string;
  supplier: {
    name: string;
    address: string;
    country: string;
  };
  buyer: {
    name: string;
    cnpj: string;
  };
  incoterm: string | null;
  incoterm_info?: IncotermInfo;
  currency: string;
  total_value: number;
  freight: number | null;
  insurance: number | null;
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    total_price: number;
    ncm_sugerido: string | null;
    ncm_descricao?: string;
    ncm_confianca?: 'ALTA' | 'MEDIA' | 'BAIXA';
    ncm_fonte: 'documento' | 'recomendado';  // Origem do NCM
    ncm_documento?: string;   // NCM original do documento (se existir)
    ncm_editado?: string;     // NCM corrigido pelo usuário
    ncm_editado_por?: string; // userId
    ncm_editado_em?: string;  // ISO timestamp
    peso_kg: number | null;
    origem: string | null;
    anuentes_necessarios?: string[];
  }>;
  observacoes: string[];
  campos_faltando: string[];
  setor_detectado?: string;
  anuentes_operacao?: string[];
  feedback_especialista?: string;

  // Novas features - Impostos, Descrição DI, Subfaturamento
  impostos_estimados?: {
    ii: number;
    ipi: number;
    pis_cofins: number;
    total_impostos: number;
    base_calculo: number;
  };
  descricao_di?: string;
  alerta_subfaturamento?: string | null;
}

export interface ValidationResult {
  validacoes: Array<{
    campo: string;
    valor_encontrado: string | number | null;
    valor_esperado: string | number | null;
    status: 'OK' | 'ALERTA' | 'ERRO';
    codigo_erro?: string;
    explicacao: string;
    fonte: string;
    sugestao_correcao?: string;
  }>;
  erros: Array<{
    tipo_erro: string;
    campo: string;
    valor_original: any;
    valor_esperado: any;
    explicacao: string;
    fonte: string;
    custo_estimado?: number;
    severidade?: string;
  }>;
  custos: {
    custoMultas: number;
    custoDemurrage: number;
    custoTotal: number;
    diasAtrasoEstimado: number;
    detalhamento: Array<{
      erro: string;
      custoMulta: number;
      custoDemurrage: number;
      diasAtraso: number;
      calculo: string;
    }>;
  };
  anuentes_necessarios: string[];
  risco_geral: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
}

export interface Operation {
  id: string;
  arquivoNome: string;
  arquivoTipo: string;
  status: string;
  dadosExtraidos: ExtractedData | null;
  dadosValidados: any | null;
  erros: any[];
  custoTotalErros: number | null;
  tempoEconomizadoMin: number | null;
  createdAt: string;
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = getStoredToken();
  if (token) {
    return { 'Authorization': `Bearer ${token}` };
  }
  return {};
}

// API Functions

export async function uploadFile(file: File): Promise<{
  operationId: string;
  fileName: string;
  extractedData?: ExtractedData;
  status?: string;
}> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Você precisa estar logado para fazer upload de arquivos');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao fazer upload');
  }

  const data = await response.json();

  // API now processes in memory and returns extracted data directly
  return {
    operationId: data.operationId,
    fileName: data.file?.name || file.name,
    extractedData: data.dadosExtraidos,
    status: data.status,
  };
}

export async function processDocument(operationId: string): Promise<{
  operationId: string;
  extractedData: ExtractedData;
  processingTime: string;
}> {
  // This endpoint is now optional - upload already extracts data
  // Keeping for backwards compatibility
  const response = await fetch(`${API_URL}/api/process/${operationId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao processar documento');
  }

  const data = await response.json();

  // Map backend field name to frontend expected name
  const extractedData = data.dadosExtraidos || data.extractedData || { items: [] };

  return {
    operationId: data.operationId,
    extractedData,
    processingTime: data.processingTime || '0s',
  };
}

export async function validateOperation(operationId: string): Promise<ValidationResult & { operationId: string }> {
  const response = await fetch(`${API_URL}/api/validate/${operationId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao validar operação');
  }

  return response.json();
}

export async function getOperation(operationId: string): Promise<Operation> {
  const response = await fetch(`${API_URL}/api/operations/${operationId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar operação');
  }

  return response.json();
}

export interface OperationsResponse {
  operations: Operation[];
  total: number;
  limit: number;
  offset: number;
}

export interface OperationsStats {
  totalOperations: number;
  operationsWithErrors: number;
  operationsValidated: number;
  totalCostsAvoided: number;
  totalTimeSavedMin: number;
  averageTimeSavedMin: number;
}

export async function listOperations(limit = 10, offset = 0): Promise<OperationsResponse> {
  const response = await fetch(`${API_URL}/api/operations?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao listar operações');
  }

  return response.json();
}

export async function getOperationsStats(): Promise<OperationsStats> {
  const response = await fetch(`${API_URL}/api/operations/stats/summary`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao buscar estatísticas');
  }

  return response.json();
}

export async function deleteOperation(operationId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/api/operations/${operationId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao excluir operação');
  }

  return response.json();
}

export async function getNcm(ncm: string): Promise<{
  ncm: string;
  descricao: string;
  aliquotaIi: string;
  aliquotaIpi: string;
  anuentes: string[];
  requerLpco: boolean;
  setor: string;
  anuentesDetalhes: any[];
}> {
  const response = await fetch(`${API_URL}/api/ncm/${ncm}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'NCM não encontrado');
  }

  return response.json();
}

export async function searchNcm(query: string): Promise<Array<{
  ncm: string;
  descricao: string;
  setor: string;
}>> {
  const response = await fetch(`${API_URL}/api/ncm/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getAnuentes(): Promise<Array<{
  sigla: string;
  nomeCompleto: string;
  descricao: string;
  multaMinima: string;
  multaMaxima: string;
  tempoLiberacaoDias: number;
}>> {
  const response = await fetch(`${API_URL}/api/validate/anuentes`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

export async function getTiposErro(): Promise<Array<{
  codigo: string;
  nome: string;
  descricao: string;
  categoria: string;
  custoBase: string;
  custoPercentual: string;
  custoMaximo: string;
  diasAtrasoMedio: number;
  severidade: string;
}>> {
  const response = await fetch(`${API_URL}/api/validate/tipos-erro`);

  if (!response.ok) {
    return [];
  }

  return response.json();
}

// Demo endpoint (for examples without file upload)
export async function processDemoInvoice(invoiceKey: string): Promise<{
  operationId: string;
  extractedData: ExtractedData;
}> {
  const response = await fetch(`${API_URL}/api/process/demo/${invoiceKey}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao processar demo');
  }

  return response.json();
}

// Full flow helper - uploads, processes, and validates
export async function processFullFlow(file: File, onProgress?: (step: string, progress: number) => void): Promise<{
  operation: Operation;
  extractedData: ExtractedData;
  validation: ValidationResult;
}> {
  onProgress?.('upload', 10);
  const { operationId } = await uploadFile(file);

  onProgress?.('processing', 40);
  const { extractedData } = await processDocument(operationId);

  onProgress?.('validating', 70);
  const validation = await validateOperation(operationId);

  onProgress?.('complete', 100);
  const operation = await getOperation(operationId);

  return { operation, extractedData, validation };
}

// Export preview - returns export data as JSON for validation
export interface ExportPreview {
  exportData: {
    numeroReferencia: string;
    dataEmbarque: string;
    incoterm: string;
    moeda: string;
    codigoURF: string;
    viaTransporte: string;
    tipoDeclaracao: string;
    importador: { cnpj: string; nome: string; uf?: string };
    exportador: { nome: string; pais: string };
    itens: Array<{
      sequencial: number;
      adicao?: number;
      destaque?: number;
      ncm: string;
      descricao: string;
      quantidade: number;
      unidade: string;
      valorUnitario: number;
      valorTotal: number;
      pesoLiquido: number;
      pesoBruto: number;
      paisOrigem: string;
      fabricante?: string;
      condicaoMercadoria?: string;
      fundamentoLegal?: string;
      licencaImportacao?: string;
      anuentes?: string[];
      marca?: string;
      modelo?: string;
      numeroSerie?: string;
      aplicacao?: string;
    }>;
    totais: { valorMercadoria: number; frete: number; seguro: number; valorAduaneiro: number };
  };
  validationErrors: string[];
  isValid: boolean;
}

export interface ExportOverrides {
  numeroReferencia?: string;
  dataEmbarque?: string;
  incoterm?: string;
  moeda?: string;
  codigo_urf?: string;
  via_transporte?: string;
  tipo_declaracao?: string;
  importador?: { cnpj?: string; nome?: string; uf?: string };
  buyer?: { cnpj?: string; name?: string; estado?: string };
  items?: Array<{
    sequencial?: number;
    ncm?: string;
    description?: string;
    quantidade?: number;
    quantity?: number;
    unit?: string;
    unit_price?: number;
    total_price?: number;
    valor_unitario?: number;
    valor_total?: number;
    peso_bruto?: number;
    peso_kg?: number;
    peso_liquido?: number;
    origem?: string;
    paisOrigem?: string;
    fabricante?: string;
    condicaoMercadoria?: string;
    fundamentoLegal?: string;
    licencaImportacao?: string;
    anuentes?: string[];
    anuentes_necessarios?: string[];
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    aplicacao?: string;
  }>;
  freight?: number;
  frete?: number;
  insurance?: number;
  seguro?: number;
  total_value?: number;
}

export async function getExportPreview(operationId: string, overrides?: ExportOverrides): Promise<ExportPreview> {
  const headers = {
    ...getAuthHeaders(),
    ...(overrides ? { 'Content-Type': 'application/json' } : {}),
  };

  const url = `${API_URL}/api/export/${operationId}/preview`;

  const response = await fetch(url, {
    method: overrides ? 'POST' : 'GET',
    headers,
    body: overrides ? JSON.stringify({ overrides }) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao gerar preview de exportação');
  }

  return response.json();
}

// Export XML - downloads the Siscomex XML file
export async function exportSiscomexXml(operationId: string, overrides?: ExportOverrides, persist = true): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Você precisa estar logado para exportar');
  }

  const headers: Record<string, string> = { 'Authorization': `Bearer ${token}` };
  let body: string | undefined;
  let method: 'GET' | 'POST' = 'GET';

  if (overrides) {
    method = 'POST';
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({ overrides, persist });
  }

  const response = await fetch(`${API_URL}/api/export/${operationId}/xml`, {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const error = await response.json();
    const message = error.validationErrors
      ? `${error.message}\n${error.validationErrors.join('\n')}`
      : error.error || 'Erro ao exportar XML';
    throw new Error(message);
  }

  // Get filename from Content-Disposition header or generate one
  const contentDisposition = response.headers.get('Content-Disposition');
  let filename = `duimp_${operationId}.xml`;
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) filename = match[1];
  }

  // Download the file
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Editar NCM de um item da operação
export async function updateItemNcm(
  operationId: string,
  itemIndex: number,
  ncm: string
): Promise<{
  success: boolean;
  message: string;
  item: {
    index: number;
    ncm_editado: string;
    ncm_descricao: string;
    ncm_editado_em: string;
  };
}> {
  const token = getStoredToken();
  if (!token) {
    throw new Error('Você precisa estar logado para editar');
  }

  const response = await fetch(`${API_URL}/api/operations/${operationId}/items/${itemIndex}/ncm`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ncm }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao atualizar NCM');
  }

  return response.json();
}
