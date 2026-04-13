import React from 'react';
import { FileText } from 'lucide-react';
import * as api from '../../api';

// --- StatsTab ---

export interface StatsTabProps {
  stats: api.OperationsStats | null;
}

export function StatsTab({ stats }: StatsTabProps) {
  if (!stats) {
    return <div className="text-slate-400">Carregando estatísticas...</div>;
  }

  const successRate =
    stats.totalOperations > 0
      ? Math.round((stats.operationsValidated / stats.totalOperations) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="text-slate-400 text-sm mb-1">Total de Operações</div>
        <div className="text-2xl font-bold text-white">{stats.totalOperations}</div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="text-slate-400 text-sm mb-1">Custos Evitados</div>
        <div className="text-2xl font-bold text-green-400">
          R$ {stats.totalCostsAvoided.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="text-slate-400 text-sm mb-1">Tempo Economizado</div>
        <div className="text-2xl font-bold text-blue-400">{stats.totalTimeSavedMin} minutos</div>
      </div>
      <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
        <div className="text-slate-400 text-sm mb-1">Taxa de Sucesso</div>
        <div className="text-2xl font-bold text-primary-400">{successRate}%</div>
      </div>
    </div>
  );
}

// --- HistoryTab ---

export interface HistoryTabProps {
  operations: api.Operation[];
  onLoadMore: () => void;
}

export function HistoryTab({ operations, onLoadMore }: HistoryTabProps) {
  if (operations.length === 0) {
    return (
      <div className="text-center text-slate-400 py-8">Nenhuma operação encontrada</div>
    );
  }

  return (
    <div className="space-y-3">
      {operations.map((op) => (
        <div
          key={op.id}
          className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-400 mt-1" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{op.arquivoNome}</span>
                  {op.status === 'VALIDADO' ? (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded">
                      ✓ VALIDADO
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded">
                      ⚠ COM_ERROS
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  {new Date(op.createdAt).toLocaleString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' | '}
                  {op.arquivoTipo.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="text-right">
              {op.custoTotalErros && op.custoTotalErros > 0 ? (
                <div className="text-red-400 font-semibold">
                  R$ {op.custoTotalErros.toFixed(2)}
                </div>
              ) : (
                <div className="text-green-400 font-semibold">OK</div>
              )}
              {op.tempoEconomizadoMin && (
                <div className="text-xs text-slate-400 mt-1">
                  {op.tempoEconomizadoMin} min economizados
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        onClick={onLoadMore}
        className="w-full py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors"
      >
        Ver Mais
      </button>
    </div>
  );
}

// --- SettingsTab ---

export function SettingsTab() {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm text-slate-400 mb-2">Idioma Preferido</label>
        <select className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg">
          <option>Português</option>
          <option>English</option>
          <option>Español</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-2">Moeda</label>
        <select className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg">
          <option>BRL (R$)</option>
          <option>USD ($)</option>
          <option>EUR (€)</option>
        </select>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-slate-300">Notificações por Email</span>
        <input type="checkbox" defaultChecked className="w-5 h-5" />
      </div>
    </div>
  );
}
