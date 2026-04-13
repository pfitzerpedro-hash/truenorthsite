import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp, RefreshCw, Download } from 'lucide-react';
import * as api from '../../api';

const URF_OPTIONS = [
  { value: '0817600', label: 'Santos (0817600)' },
  { value: '0717800', label: 'Guarulhos (0717800)' },
  { value: '0917500', label: 'Paranaguá (0917500)' },
  { value: '1017100', label: 'Rio de Janeiro (1017100)' },
  { value: '1117300', label: 'Vitória (1117300)' },
  { value: '0517100', label: 'Itajaí (0517100)' },
  { value: '0417500', label: 'Rio Grande (0417500)' },
  { value: '0317600', label: 'Manaus (0317600)' },
  { value: '0617800', label: 'Viracopos (0617800)' },
  { value: '0217900', label: 'Salvador (0217900)' },
];

const VIA_TRANSPORTE_OPTIONS = [
  { value: '1', label: 'Marítima' },
  { value: '4', label: 'Aérea' },
  { value: '5', label: 'Postal' },
  { value: '6', label: 'Ferroviária' },
  { value: '7', label: 'Rodoviária' },
  { value: '9', label: 'Fluvial' },
];

const TIPO_DECLARACAO_OPTIONS = [
  { value: 'CONSUMO', label: 'Consumo' },
  { value: 'ADMISSAO_TEMPORARIA', label: 'Admissão Temporária' },
  { value: 'ENTREPOSTO', label: 'Entreposto Aduaneiro' },
];

export interface DuimpExportSectionProps {
  operationId: string;
  dadosExtraidos: any;
}

export function DuimpExportSection({ operationId, dadosExtraidos }: DuimpExportSectionProps) {
  const [preview, setPreview] = useState<api.ExportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const [overrides, setOverrides] = useState<api.ExportOverrides>({
    importador: {
      cnpj: dadosExtraidos?.buyer?.cnpj || '',
      nome: dadosExtraidos?.buyer?.name || '',
      uf: '',
    },
    codigo_urf: '',
    via_transporte: '',
    tipo_declaracao: 'CONSUMO',
  });

  useEffect(() => {
    if (expanded && !preview) {
      loadPreview();
    }
  }, [expanded, operationId]);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExportPreview(operationId);
      setPreview(data);
      if (data.exportData) {
        setOverrides((prev) => ({
          ...prev,
          importador: {
            cnpj: data.exportData.importador?.cnpj || prev.importador?.cnpj || '',
            nome: data.exportData.importador?.nome || prev.importador?.nome || '',
            uf: data.exportData.importador?.uf || prev.importador?.uf || '',
          },
          codigo_urf:
            data.exportData.codigoURF !== 'NAO_INFORMADO' ? data.exportData.codigoURF : '',
          via_transporte:
            data.exportData.viaTransporte !== 'NAO_INFORMADO' ? data.exportData.viaTransporte : '',
          tipo_declaracao:
            data.exportData.tipoDeclaracao !== 'NAO_INFORMADA'
              ? data.exportData.tipoDeclaracao
              : 'CONSUMO',
        }));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePreviewUpdate() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getExportPreview(operationId, overrides);
      setPreview(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    setDownloading(true);
    setError(null);
    try {
      await api.exportSiscomexXml(operationId, overrides, true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setDownloading(false);
    }
  }

  const missingFields = preview?.validationErrors || [];
  const isReady = preview?.isValid;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary-400" />
          <span className="text-white font-semibold">Gerar DUIMP</span>
          {preview &&
            (isReady ? (
              <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                Pronto para exportar
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                {missingFields.length} campos faltando
              </span>
            ))}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-4">
              {loading && !preview && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-primary-400 animate-spin" />
                  <span className="ml-2 text-slate-400">Carregando dados...</span>
                </div>
              )}

              {missingFields.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <h4 className="text-amber-400 text-sm font-semibold mb-2">
                    Campos obrigatórios faltando:
                  </h4>
                  <ul className="text-xs text-amber-300 space-y-1">
                    {missingFields.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {preview && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CNPJ Importador *</label>
                    <input
                      type="text"
                      value={overrides.importador?.cnpj || ''}
                      onChange={(e) =>
                        setOverrides((prev) => ({
                          ...prev,
                          importador: { ...prev.importador, cnpj: e.target.value },
                        }))
                      }
                      placeholder="00.000.000/0000-00"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nome Importador *</label>
                    <input
                      type="text"
                      value={overrides.importador?.nome || ''}
                      onChange={(e) =>
                        setOverrides((prev) => ({
                          ...prev,
                          importador: { ...prev.importador, nome: e.target.value },
                        }))
                      }
                      placeholder="Razão Social"
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Código URF (Alfândega) *
                    </label>
                    <select
                      value={overrides.codigo_urf || ''}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, codigo_urf: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione...</option>
                      {URF_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Via de Transporte *
                    </label>
                    <select
                      value={overrides.via_transporte || ''}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, via_transporte: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Selecione...</option>
                      {VIA_TRANSPORTE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Tipo de Declaração *
                    </label>
                    <select
                      value={overrides.tipo_declaracao || 'CONSUMO'}
                      onChange={(e) =>
                        setOverrides((prev) => ({ ...prev, tipo_declaracao: e.target.value }))
                      }
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    >
                      {TIPO_DECLARACAO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">UF Importador</label>
                    <input
                      type="text"
                      value={overrides.importador?.uf || ''}
                      onChange={(e) =>
                        setOverrides((prev) => ({
                          ...prev,
                          importador: {
                            ...prev.importador,
                            uf: e.target.value.toUpperCase(),
                          },
                        }))
                      }
                      placeholder="SP"
                      maxLength={2}
                      className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              )}

              {preview && preview.exportData?.itens && preview.exportData.itens.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                  <h5 className="text-xs font-semibold text-slate-400 mb-2">
                    Itens da Declaração ({preview.exportData.itens.length})
                  </h5>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {preview.exportData.itens.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 truncate max-w-[60%]">
                          {idx + 1}. {item.descricao}
                        </span>
                        <span className="text-slate-500">NCM: {item.ncm || 'N/D'}</span>
                      </div>
                    ))}
                    {preview.exportData.itens.length > 5 && (
                      <div className="text-xs text-slate-600 mt-1">
                        + {preview.exportData.itens.length - 5} mais itens...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    onClick={handlePreviewUpdate}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar Preview
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={downloading || !isReady}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isReady
                        ? 'bg-primary-500 hover:bg-primary-600 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Download className={`w-4 h-4 ${downloading ? 'animate-bounce' : ''}`} />
                    {downloading ? 'Baixando...' : 'Download DUIMP XML'}
                  </button>
                </div>
              )}

              <div className="bg-slate-950 rounded-lg p-3 text-xs text-slate-500">
                <p>
                  <strong className="text-slate-400">Próximos passos: </strong>
                  Após baixar o XML, importe-o no seu software de transmissão Siscomex (ex:
                  Customs.io, Descomplicado, ou sistema próprio) para assinar digitalmente e
                  transmitir ao Portal Único.
                </p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
