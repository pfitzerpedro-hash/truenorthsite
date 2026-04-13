import React, { useState } from 'react';
import { X, User } from 'lucide-react';
import * as api from '../../api';
import { StatsTab, HistoryTab, SettingsTab } from '../history/HistoryTabs';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: api.User | null;
  operations: api.Operation[];
  stats: api.OperationsStats | null;
  onLoadMore: () => void;
  onLogout: () => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  currentUser,
  operations,
  stats,
  onLoadMore,
  onLogout,
}: UserProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'history' | 'settings'>('stats');

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {currentUser.name || 'Usuário'}
                </h2>
                <p className="text-slate-400 text-sm">{currentUser.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded">
                  Plano Pro
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex gap-2 mt-6">
            {(
              [
                { id: 'stats', label: '📊 Estatísticas' },
                { id: 'history', label: '📄 Histórico' },
                { id: 'settings', label: '⚙️ Configurações' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'stats' && <StatsTab stats={stats} />}
          {activeTab === 'history' && (
            <HistoryTab operations={operations} onLoadMore={onLoadMore} />
          )}
          {activeTab === 'settings' && <SettingsTab />}
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"
          >
            Sair
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
