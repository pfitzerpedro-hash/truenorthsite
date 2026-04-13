import React from 'react';
import { ArrowRight } from 'lucide-react';

export function DashboardMockup() {
  return (
    <div className="relative group perspective-1000 mt-10 lg:mt-0">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-accent-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
      <div className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden transform rotate-y-2 transition-transform duration-700 hover:rotate-0">
        <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
          </div>
          <div className="ml-4 flex-1 text-center lg:text-left">
            <div className="text-[10px] text-slate-400 font-mono bg-slate-950/50 px-2 py-0.5 rounded inline-block">
              truenorth.app/dashboard/duimp
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-800/40 p-3 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">DUIMPs Ativas</div>
              <div className="text-xl font-bold text-white mt-1">42</div>
              <div className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Em dia
              </div>
            </div>
            <div className="bg-slate-800/40 p-3 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Risco Elevado</div>
              <div className="text-xl font-bold text-orange-500 mt-1">3</div>
              <div className="text-[10px] text-orange-400 mt-1">Ação imediata</div>
            </div>
            <div className="bg-slate-800/40 p-3 rounded border border-slate-700/50">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Demurrage Evitado</div>
              <div className="text-xl font-bold text-accent-400 mt-1">R$ 84k</div>
              <div className="text-[10px] text-slate-400 mt-1">Últimos 30 dias</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <h4 className="text-xs font-semibold text-slate-300">Tendência de Custos Extras</h4>
              <span className="text-[10px] text-green-400 font-mono">-32% este mês</span>
            </div>
            <div className="h-20 flex items-end justify-between gap-1 pt-2 border-b border-slate-800 pb-2">
              {[65, 50, 70, 40, 35, 55, 30, 20, 25, 15].map((h, i) => (
                <div
                  key={i}
                  className={`w-full rounded-t hover:opacity-80 transition-opacity ${
                    i > 6 ? 'bg-green-500/40' : 'bg-slate-700'
                  }`}
                  style={{ height: `${h}%` }}
                ></div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Alertas Prioritários
            </div>
            {[
              { msg: 'DUIMP 23/45678 — Risco baixo', sub: 'Aguardando canal', type: 'green' },
              {
                msg: 'DUIMP 23/98765 — Divergência Valor Aduaneiro',
                sub: 'Risco de multa 1%',
                type: 'red',
              },
              {
                msg: 'DUIMP 24/12345 — LPCO pendente (MAPA)',
                sub: 'Licença não vinculada',
                type: 'yellow',
              },
            ].map((alert, i) => (
              <div
                key={i}
                className="flex items-start justify-between p-2.5 bg-slate-950/30 border border-slate-800 rounded hover:bg-slate-800/50 transition-colors cursor-pointer group/item"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                      alert.type === 'red'
                        ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : alert.type === 'yellow'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                  ></div>
                  <div>
                    <div className="text-xs text-slate-200 font-medium">{alert.msg}</div>
                    <div className="text-[10px] text-slate-500 group-hover/item:text-slate-400">
                      {alert.sub}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-600 opacity-0 group-hover/item:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
