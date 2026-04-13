import React from 'react';
import { ArrowRight, Container, Globe2, Ship } from 'lucide-react';
import { DashboardMockup } from './DashboardMockup';

export interface HeroProps {
  onSimulateClick: () => void;
}

export function Hero({ onSimulateClick }: HeroProps) {
  return (
    <section
      id="produto"
      className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary-600/15 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-accent-500/10 rounded-full blur-[100px] -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/50 text-accent-400 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></span>
              Plataforma DUIMP Ready
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Sua invoice analisada em{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                segundos
              </span>
              .<br />
              NCM, impostos e anuentes automáticos.
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-xl">
              Faça upload da invoice, nossa IA extrai os dados, classifica NCM e calcula impostos.
              Exporte direto para o Siscomex.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onSimulateClick}
                className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-lg text-base font-semibold transition-all shadow-xl shadow-primary-600/20 hover:shadow-primary-600/30 flex items-center justify-center gap-2 group"
              >
                Testar com minha Invoice{' '}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={onSimulateClick}
                className="bg-slate-900/50 hover:bg-slate-800 border border-slate-700 text-slate-200 px-8 py-4 rounded-lg text-base font-medium transition-all flex items-center justify-center hover:border-slate-500"
              >
                Ver como funciona
              </button>
            </div>
            <div className="pt-8 border-t border-slate-800/50">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-4">
                Solução ideal para
              </p>
              <div className="flex flex-wrap gap-4 text-slate-400 text-sm font-medium">
                <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800">
                  <Container className="w-4 h-4" /> Importadores
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800">
                  <Globe2 className="w-4 h-4" /> Trading Companies
                </span>
                <span className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800">
                  <Ship className="w-4 h-4" /> Logística
                </span>
              </div>
            </div>
          </div>
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
