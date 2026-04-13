/**
 * Tipos compartilhados para o TrueNorth Frontend
 */

// Re-export types from api
export type { User, Operation, OperationsStats, ClassifiedResult } from '../api';

// Auth types
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
  setMode: (mode: 'login' | 'register') => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, confirmPassword: string, name?: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// NCM Badge types
export interface NcmBadgeProps {
  item: any;
  idx: number;
  operationId: string | null;
  onNcmUpdate: (newNcm: string) => void;
}

// Workflow types
export type WorkflowStep = 'upload' | 'form' | 'results';

export interface WorkflowState {
  step: WorkflowStep;
  selectedFile: File | null;
  uploadedPath: string | null;
  extractedData: any | null;
  isProcessing: boolean;
  processingProgress: number;
}

// Item types
export interface ItemData {
  id: number;
  descricao: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  valorTotal: number;
  ncm: string;
  ncmDescricao?: string;
  ncmConfianca?: 'ALTA' | 'MEDIA' | 'BAIXA';
  ncmFonte?: 'documento' | 'recomendado';
  ncmEditado?: string;
  peso_kg?: number;
  origem?: string;
  anuentes?: string[];
  confidence_alert?: {
    level: 'warning' | 'error';
    message: string;
    reason: string;
  };
}

// Operation form data
export interface OperationFormData {
  tipo: 'importacao' | 'exportacao';
  urfDespacho: string;
  paisOrigem: string;
  modalidade: string;
  setor: string;
  moeda: string;
  valorTotal: number;
  frete: number;
  seguro: number;
  incoterm: string;
}

// DUIMP fields
export interface DuimpFields {
  cpfCnpjDeclarante: string;
  nomeDeclarante: string;
  enderecoDeclarante: string;
  ufDeclarante: string;
  tipoImportador: string;
  fundamentoLegal: string;
  regimeTributacao: string;
  modalidadePagamento: string;
  formaImportacao: string;
  condicaoVenda: string;
  moedaNegociada: string;
  valorFobMoeda: string;
}

// Cost breakdown
export interface CostBreakdown {
  ii: number;
  ipi: number;
  pisCofins: number;
  icms: number;
  total: number;
  baseCalculo: number;
}

// Colors config
export const COLORS = {
  bg: 'slate-950',
  primary: 'primary-600',
  accent: 'accent-500',
  warning: 'orange-500',
  textMain: 'white',
  textMuted: 'slate-400'
} as const;
