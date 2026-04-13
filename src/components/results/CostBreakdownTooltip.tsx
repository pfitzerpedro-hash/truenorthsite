import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface CostDetail {
  codigo?: string;
  nome?: string;
  custoBase?: number;
  custoPercentual?: number;
  custoFinal?: number;
  demurrage?: number;
  diasAtraso?: number;
  multiplicadorSetor?: number;
  setorAplicado?: string;
  explicacao?: string;
}

export interface CostBreakdownTooltipProps {
  custo: {
    custoTotal?: number;
    custoMultas?: number;
    custoDemurrage?: number;
    diasAtrasoEstimado?: number;
    detalhamento?: CostDetail[];
  };
}

export function CostBreakdownTooltip({ custo }: CostBreakdownTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!custo || !custo.custoTotal) {
    return null;
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="ml-2 text-slate-400 hover:text-primary-400 transition-colors"
        title="Ver detalhamento"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-96 p-4 bg-slate-800 border border-slate-700 rounded-lg shadow-xl -left-4 top-8">
          <h4 className="text-sm font-semibold text-white mb-3">
            Como calculamos esta economia?
          </h4>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Multas evitadas:</span>
              <span className="text-white font-medium">
                R$ {(custo.custoMultas || 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Demurrage evitado:</span>
              <span className="text-white font-medium">
                R$ {(custo.custoDemurrage || 0).toLocaleString('pt-BR')}
              </span>
            </div>
            {(custo.diasAtrasoEstimado || 0) > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>{custo.diasAtrasoEstimado} dias × R$ 1.500/dia</span>
              </div>
            )}
            <div className="border-t border-slate-700 pt-2 flex justify-between font-bold">
              <span className="text-white">Total:</span>
              <span className="text-green-400">
                R$ {(custo.custoTotal || 0).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

          {custo.detalhamento && custo.detalhamento.length > 0 && (
            <div className="border-t border-slate-700 pt-3">
              <h5 className="text-xs font-semibold text-slate-400 mb-2">Breakdown por erro:</h5>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {custo.detalhamento.map((detalhe, idx) => (
                  <div key={idx} className="bg-slate-900 p-2 rounded text-xs">
                    <div className="font-medium text-white mb-1">{detalhe.nome}</div>
                    <div className="text-slate-400 space-y-0.5">
                      <div>Base: R$ {(detalhe.custoBase || 0).toFixed(2)}</div>
                      {(detalhe.custoPercentual || 0) > 0 && (
                        <div>+ Percentual: R$ {(detalhe.custoPercentual || 0).toFixed(2)}</div>
                      )}
                      {(detalhe.multiplicadorSetor || 1.0) !== 1.0 && (
                        <div>
                          × Setor {detalhe.setorAplicado}: {detalhe.multiplicadorSetor}x
                        </div>
                      )}
                      <div className="text-primary-400 font-medium">
                        = R$ {(detalhe.custoFinal || 0).toFixed(2)}
                      </div>
                      {(detalhe.demurrage || 0) > 0 && (
                        <div className="text-orange-400">
                          + Demurrage: R$ {(detalhe.demurrage || 0).toFixed(2)} ({detalhe.diasAtraso}{' '}
                          dias)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-700 pt-3 mt-3 text-xs text-slate-500">
            <p className="mb-1">
              <strong className="text-slate-400">Demurrage:</strong> Taxa diária cobrada por
              sobrestadia do container no porto
            </p>
            <p>
              <strong className="text-slate-400">Multiplicador de Setor:</strong> Fator de ajuste
              por complexidade regulatória
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
