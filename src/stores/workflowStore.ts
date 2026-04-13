import { create } from 'zustand';

export type WorkflowStep = 'upload' | 'form' | 'results';

interface WorkflowState {
  step: WorkflowStep;
  selectedFile: File | null;
  uploadedPath: string | null;
  extractedData: any | null;
  operationId: string | null;
  isProcessing: boolean;
  processingProgress: number;
  error: string | null;

  setStep: (step: WorkflowStep) => void;
  setSelectedFile: (file: File | null) => void;
  setUploadedPath: (path: string | null) => void;
  setExtractedData: (data: any) => void;
  setOperationId: (id: string | null) => void;
  setProcessing: (isProcessing: boolean, progress?: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: 'upload' as WorkflowStep,
  selectedFile: null,
  uploadedPath: null,
  extractedData: null,
  operationId: null,
  isProcessing: false,
  processingProgress: 0,
  error: null,
};

export const useWorkflowStore = create<WorkflowState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setUploadedPath: (uploadedPath) => set({ uploadedPath }),
  setExtractedData: (extractedData) => set({ extractedData }),
  setOperationId: (operationId) => set({ operationId }),
  setProcessing: (isProcessing, processingProgress = 0) =>
    set({ isProcessing, processingProgress }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
