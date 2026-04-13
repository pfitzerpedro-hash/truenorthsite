import React, { useState } from 'react';

export function ProfileSection() {
  const [prefs, setPrefs] = useState({
    language: 'pt-BR',
    currency: 'USD',
    notifyEmail: true,
    notifyWebhook: false,
    corsOrigins: 'https://www.truenorth.app.br',
  });

  const [tokens] = useState([
    { id: 'tok_live_xa21', label: 'Produção', lastUsed: 'há 2h' },
    { id: 'tok_sandbox_qp88', label: 'Sandbox', lastUsed: 'ontem' },
  ]);

  const [activity] = useState([
    { id: 1, action: 'Exportou XML DUIMP', time: 'há 12m' },
    { id: 2, action: 'Validou operação com risco alto', time: 'há 3h' },
    { id: 3, action: 'Criou operação demo (cosméticos)', time: 'ontem' },
  ]);

  const togglePref = (key: 'notifyEmail' | 'notifyWebhook') => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <section id="perfil" className="py-24 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Perfil e preferências
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Configure conta, notificações, domínios e tokens de acesso sem sair do painel.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-slate-500">Dados da conta</p>
                <h3 className="text-lg font-semibold text-white">Usuário TrueNorth</h3>
                <p className="text-slate-400 text-sm">usuario@truenorth.app.br</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-600/20 text-primary-300 border border-primary-700/50">
                Plano Pro
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Idioma</p>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2"
                  value={prefs.language}
                  onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English</option>
                  <option value="es-ES">Español</option>
                </select>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Moeda padrão</p>
                <select
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2"
                  value={prefs.currency}
                  onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                >
                  <option>USD</option>
                  <option>BRL</option>
                  <option>EUR</option>
                  <option>CNY</option>
                </select>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 md:col-span-2">
                <p className="text-xs text-slate-500 mb-2">Domínios permitidos (CORS)</p>
                <input
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg p-2"
                  value={prefs.corsOrigins}
                  onChange={(e) => setPrefs({ ...prefs, corsOrigins: e.target.value })}
                  placeholder="https://www.truenorth.app.br"
                />
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Alertas por e-mail</p>
                    <p className="text-slate-300 text-sm">Erros críticos e expiração de tokens</p>
                  </div>
                  <button
                    onClick={() => togglePref('notifyEmail')}
                    className={`w-11 h-6 rounded-full border ${
                      prefs.notifyEmail
                        ? 'bg-primary-600 border-primary-500'
                        : 'bg-slate-800 border-slate-600'
                    } flex items-center`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        prefs.notifyEmail ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500">Webhooks</p>
                    <p className="text-slate-300 text-sm">Notifique seu sistema quando validar</p>
                  </div>
                  <button
                    onClick={() => togglePref('notifyWebhook')}
                    className={`w-11 h-6 rounded-full border ${
                      prefs.notifyWebhook
                        ? 'bg-primary-600 border-primary-500'
                        : 'bg-slate-800 border-slate-600'
                    } flex items-center`}
                  >
                    <span
                      className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        prefs.notifyWebhook ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    ></span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">Segurança</p>
                  <h4 className="text-white font-semibold">Tokens de API</h4>
                </div>
                <button className="text-xs px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200">
                  Gerar token
                </button>
              </div>
              <div className="space-y-2">
                {tokens.map((tok) => (
                  <div
                    key={tok.id}
                    className="flex items-center justify-between bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2"
                  >
                    <div>
                      <div className="text-white text-sm font-semibold">{tok.label}</div>
                      <div className="text-[11px] text-slate-500">{tok.id}</div>
                    </div>
                    <span className="text-xs text-slate-400">{tok.lastUsed}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-2">
                Dica: revogue tokens antigos e use domínios restritos.
              </p>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">Atividade</p>
                  <h4 className="text-white font-semibold">Últimas ações</h4>
                </div>
                <span className="text-xs text-slate-500">Atualizado agora</span>
              </div>
              <div className="space-y-2">
                {activity.map((log) => (
                  <div
                    key={log.id}
                    className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between"
                  >
                    <span className="text-sm text-slate-200">{log.action}</span>
                    <span className="text-[11px] text-slate-500">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
