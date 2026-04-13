import React from 'react';
import { AlertCircle, FileText } from 'lucide-react';
import { calcularRiscoNCM } from '../../utils/businessLogic';

export interface FichaProdutoSimuladaProps {
  operation: any;
  items: any[];
  inadimplencia: number;
}

export function FichaProdutoSimulada({ operation, items, inadimplencia }: FichaProdutoSimuladaProps) {
  if (!operation || !items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Dados insuficientes para exibir ficha de produto</p>
      </div>
    );
  }

  const itemPrincipal = items[0];
  const riscoNcmPrincipal = itemPrincipal ? calcularRiscoNCM(itemPrincipal.ncm, inadimplencia) : 0;

  interface FieldProps {
    label: string;
    value: string | number;
    highlightRisk?: boolean;
    riskLabel?: string;
    grow?: boolean;
  }

  const Field = ({ label, value, highlightRisk, riskLabel, grow }: FieldProps) => (
    <div className={`${grow ? 'md:col-span-2' : ''} flex flex-col`}>
      <label className="text-[10px] font-semibold text-slate-500 mb-1">{label}</label>
      <div
        className={`flex items-center px-3 py-2 rounded text-xs border ${
          highlightRisk
            ? 'bg-amber-50 border-amber-300 text-amber-800'
            : 'bg-slate-100 border-slate-300 text-slate-700'
        }`}
      >
        {value}
      </div>
      {highlightRisk && riskLabel && (
        <span className="text-[9px] text-amber-600 mt-0.5 font-medium">{riskLabel}</span>
      )}
    </div>
  );

  const codigoProduto = itemPrincipal?.desc
    ? `PRD-${String(Math.floor(Math.random() * 9000) + 1000)}`
    : 'PRD-0000';
  const descricaoComplementar = `Operação de importação de ${(
    operation.sector || 'diversos'
  ).toLowerCase()} procedente de ${
    operation.country || 'origem não informada'
  }, modalidade ${(operation.modality || 'não especificada').toLowerCase()}. Contém ${
    items.length
  } item(ns) com NCM principal ${itemPrincipal?.ncm || 'não informada'}.`;

  return (
    <div className="mt-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-white font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent-500" /> Ficha de Produto (Simulação)
        </h3>
        <span className="text-xs text-slate-500 bg-slate-900 border border-slate-800 px-2 py-1 rounded">
          Visualização estilo Portal Único
        </span>
      </div>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200 font-sans">
        <div className="bg-slate-100 border-b border-slate-300 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-slate-700">Inclusão de Produto</h2>
            <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <span>Produto</span> <span className="text-slate-400">/</span>{' '}
              <span>Inclusão de Produto</span>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
              RASCUNHO
            </span>
          </div>
        </div>

        <div className="bg-slate-50 px-6 pt-4 border-b border-slate-300 flex gap-1 overflow-x-auto">
          <button className="px-6 py-2 bg-white text-slate-800 text-sm font-semibold rounded-t-lg border-t border-x border-slate-300 -mb-px relative z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]">
            Dados Básicos
          </button>
          <button className="px-6 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-t-lg border-t border-x border-transparent hover:text-slate-600 cursor-not-allowed">
            Atributos
          </button>
          <button className="px-6 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-t-lg border-t border-x border-transparent hover:text-slate-600 cursor-not-allowed">
            Anexos
          </button>
          <button className="px-6 py-2 bg-slate-100 text-slate-400 text-sm font-medium rounded-t-lg border-t border-x border-transparent hover:text-slate-600 cursor-not-allowed">
            Histórico
          </button>
        </div>

        <div className="p-6 md:p-8 bg-white min-h-[400px]">
          <div className="mb-6 flex items-center gap-2 text-slate-800 font-bold text-sm border-b border-slate-200 pb-2">
            <div className="w-1 h-4 bg-amber-500 rounded-sm"></div> Resumo
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Field label="Código do produto" value={codigoProduto} />
            <Field label="Versão" value="1.0 (simulação)" />
            <Field label="Situação" value="Rascunho" />
            <Field label="* Modalidade de operação" value={operation.modality} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Field
              label="* CNPJ raiz da empresa responsável"
              value={operation.cnpj || '12.345.678/0001-90'}
              grow
            />
            <Field label="NALADi" value="—" />
            <Field label="UNSPSC" value="—" />
            <Field label="GPC" value="—" />
            <Field label="GPC - Brick" value="—" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr_1fr] gap-4 mb-6">
            <Field
              label="* NCM"
              value={itemPrincipal?.ncm || ''}
              highlightRisk={riscoNcmPrincipal >= 85}
              riskLabel={riscoNcmPrincipal >= 85 ? 'NCM INVÁLIDO/RISCO' : undefined}
            />
            <Field
              label="Descrição NCM"
              value={itemPrincipal?.desc || 'Descrição do produto simulado'}
            />
            <Field label="Unidade de medida estatística" value="UN" />
          </div>

          <div className="mb-8">
            <label className="text-[10px] font-semibold text-slate-500 mb-1 block">
              Descrição complementar
            </label>
            <div className="w-full h-24 bg-slate-100 border border-slate-300 rounded p-3 text-xs text-slate-700 resize-none">
              {descricaoComplementar}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 text-right">3700 restantes</div>
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">NCM</th>
                  <th className="px-4 py-3">Peso (kg)</th>
                  <th className="px-4 py-3">Valor ($)</th>
                  <th className="px-4 py-3 text-center">Risco Calculado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const riscoNcm = calcularRiscoNCM(item.ncm, inadimplencia);
                  const isHighRisk = riscoNcm >= 85;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{item.desc || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded ${
                            isHighRisk
                              ? 'bg-amber-100 text-amber-700 font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {item.ncm || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.weight}</td>
                      <td className="px-4 py-3 text-slate-600">{item.value}</td>
                      <td className="px-4 py-3 text-center">
                        {isHighRisk ? (
                          <span className="text-red-600 font-bold">{riscoNcm}%</span>
                        ) : (
                          <span className="text-green-600 font-medium">Baixo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-[10px] text-slate-400 text-center italic">
            * Campos simulados. O layout acima é uma representação visual inspirada no Portal Único
            para fins de demonstração.
          </div>
        </div>
      </div>
    </div>
  );
}
