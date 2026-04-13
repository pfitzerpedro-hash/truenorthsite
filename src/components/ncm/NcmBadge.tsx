import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, Pen, Check, X } from 'lucide-react';
import * as api from '../../api';

export interface NcmBadgeProps {
  item: any;
  idx: number;
  operationId: string | null;
  onNcmUpdate: (newNcm: string) => void;
}

export function NcmBadge({ item, idx, operationId, onNcmUpdate }: NcmBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editValue, setEditValue] = useState(item.ncm || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRecommended = item.ncmFonte === 'recomendado' && !item.ncmEditado;
  const isEdited = !!item.ncmEditado;
  const isFromDocument = item.ncmFonte === 'documento';
  const ncmDisplay = item.ncm || 'N/A';

  // Confidence alert from backend
  const confidenceAlert = item.confidence_alert;
  const hasAlert = !!confidenceAlert;
  const isErrorAlert = confidenceAlert?.level === 'error';
  const isLowConfidence = item.ncmConfianca === 'BAIXA' || isErrorAlert;

  const handleSave = async () => {
    if (editValue.length !== 8) {
      setError('NCM deve ter 8 dígitos');
      return;
    }
    if (!operationId) {
      setError('Operação não identificada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await api.updateItemNcm(operationId, idx, editValue);
      onNcmUpdate(editValue);
      setEditMode(false);
      setShowTooltip(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar NCM');
    } finally {
      setIsLoading(false);
    }
  };

  // Badge color based on source and confidence
  const badgeClass = isErrorAlert
    ? 'bg-red-600/20 text-red-400 border border-red-500/50 animate-pulse'
    : isLowConfidence
    ? 'bg-orange-600/20 text-orange-400 border border-orange-500/50'
    : isEdited
    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
    : isFromDocument
    ? 'bg-green-600/20 text-green-400 border border-green-500/30'
    : 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30';

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Badge NCM com label de fonte */}
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${badgeClass}`}>
        {/* Label de fonte */}
        {isErrorAlert && (
          <span className="px-1 py-0.5 bg-red-500/40 text-red-200 rounded text-[10px] font-bold animate-pulse">
            ERRO
          </span>
        )}
        {isLowConfidence && !isErrorAlert && (
          <span className="px-1 py-0.5 bg-orange-500/40 text-orange-200 rounded text-[10px] font-bold">
            REVISAR
          </span>
        )}
        {isRecommended && !isLowConfidence && !isErrorAlert && (
          <span className="px-1 py-0.5 bg-yellow-500/30 text-yellow-300 rounded text-[10px] font-bold">
            IA
          </span>
        )}
        {isFromDocument && !isEdited && !isLowConfidence && (
          <span className="px-1 py-0.5 bg-green-500/30 text-green-300 rounded text-[10px] font-bold">
            DOC
          </span>
        )}
        {isEdited && (
          <span className="px-1 py-0.5 bg-blue-500/30 text-blue-300 rounded text-[10px] font-bold">
            EDIT
          </span>
        )}
        <span>{ncmDisplay}</span>
      </div>

      {/* Info icon for alerts and recommended NCM - Clicável para ver detalhes */}
      {(isRecommended || hasAlert) && (
        <button
          onClick={() => setShowTooltip(!showTooltip)}
          className={`p-0.5 hover:bg-slate-700 rounded-full transition-colors ${hasAlert ? 'animate-pulse' : ''}`}
          title={confidenceAlert?.message || "NCM recomendado pela IA - Clique para revisar"}
        >
          <AlertCircle className={`w-4 h-4 ${isErrorAlert ? 'text-red-400' : isLowConfidence ? 'text-orange-400' : 'text-yellow-400'}`} />
        </button>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className={`absolute z-50 top-full right-0 mt-1 p-3 bg-slate-800 border rounded-lg shadow-xl w-80 ${
          isErrorAlert ? 'border-red-500/50' : isLowConfidence ? 'border-orange-500/50' : 'border-yellow-500/50'
        }`}>
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isErrorAlert ? 'text-red-400' : isLowConfidence ? 'text-orange-400' : 'text-yellow-400'
            }`} />
            <div>
              <p className={`text-sm font-bold ${
                isErrorAlert ? 'text-red-400' : isLowConfidence ? 'text-orange-400' : 'text-yellow-400'
              }`}>
                {isErrorAlert ? 'ERRO: NCM Não Classificado' :
                 isLowConfidence ? 'ALERTA: Baixa Confiança' :
                 'ATENÇÃO: NCM Sugerido pela IA'}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                {confidenceAlert?.message ||
                 'Este NCM foi recomendado automaticamente pela inteligência artificial com base na descrição do produto.'}
              </p>
              {confidenceAlert?.reason === 'generic_ncm' && (
                <p className="text-xs text-orange-400 mt-2 font-medium">
                  Dica: NCMs que terminam em 00 ou 0000 são genéricos. Considere uma classificação mais específica.
                </p>
              )}
              {confidenceAlert?.reason === 'not_found' && (
                <p className="text-xs text-red-400 mt-2 font-medium">
                  Este item não foi classificado. É obrigatório inserir o NCM correto manualmente!
                </p>
              )}
              {!confidenceAlert && (
                <p className="text-xs text-red-400 mt-2 font-medium">
                  Recomendamos verificar se o NCM está correto antes de prosseguir!
                </p>
              )}
            </div>
          </div>

          {item.ncmConfianca && (
            <div className="flex items-center gap-2 mb-2 text-xs">
              <span className="text-slate-500">Confiança:</span>
              <span className={`font-medium ${
                item.ncmConfianca === 'ALTA' ? 'text-green-400' :
                item.ncmConfianca === 'MEDIA' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {item.ncmConfianca}
              </span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-400 mb-2">{error}</div>
          )}

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs rounded-lg flex items-center justify-center gap-1 transition-colors"
            >
              <Pen className="w-3 h-3" />
              Entendi, quero editar
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="Digite o NCM correto (8 dígitos)"
                className="w-full bg-slate-900 border border-slate-600 text-white text-xs rounded px-2 py-1.5 focus:border-primary-500 focus:outline-none"
                maxLength={8}
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="flex-1 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={editValue.length !== 8 || isLoading}
                  className="flex-1 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isLoading ? (
                    <span className="animate-spin">...</span>
                  ) : (
                    <>
                      <Check className="w-3 h-3" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => {
              setShowTooltip(false);
              setEditMode(false);
              setError(null);
            }}
            className="absolute top-2 right-2 text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default NcmBadge;
