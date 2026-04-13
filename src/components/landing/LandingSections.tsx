import React from 'react';
import {
  Upload,
  ArrowRight,
  ArrowDown,
  Sparkles,
  Download,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Ship,
  Globe2,
  FileCheck,
} from 'lucide-react';
import { ShipAnimation } from './ShipAnimation';

export function HighLevelFlow() {
  return (
    <section className="py-20 bg-slate-900 border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-12">Em 3 passos simples</h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full md:w-64">
            <Upload className="w-10 h-10 text-primary-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Upload</h3>
            <p className="text-slate-400 text-sm">Envie PDF, XML ou imagem da invoice comercial.</p>
          </div>
          <ArrowRight className="hidden md:block w-8 h-8 text-slate-600" />
          <ArrowDown className="md:hidden w-8 h-8 text-slate-600" />
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full md:w-64">
            <Sparkles className="w-10 h-10 text-accent-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Análise IA</h3>
            <p className="text-slate-400 text-sm">
              Extração automática + classificação NCM inteligente.
            </p>
          </div>
          <ArrowRight className="hidden md:block w-8 h-8 text-slate-600" />
          <ArrowDown className="md:hidden w-8 h-8 text-slate-600" />
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 w-full md:w-64">
            <Download className="w-10 h-10 text-green-500 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Exportação</h3>
            <p className="text-slate-400 text-sm">XML pronto para Siscomex + estimativa de impostos.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Como a TrueNorth funciona
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Processo simples e automático. Sua invoice vira dados estruturados em segundos.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Upload',
              desc: 'Arraste seu PDF, XML ou foto da invoice comercial. Aceitamos qualquer formato legível.',
              icon: <FileText className="w-6 h-6" />,
            },
            {
              title: 'Extração IA',
              desc: 'Nossa IA proprietária extrai fornecedor, itens, valores e sugere NCM com nível de confiança.',
              icon: <Sparkles className="w-6 h-6" />,
            },
            {
              title: 'Resultado',
              desc: 'Veja impostos estimados (II, IPI, PIS/COFINS), anuentes necessários e exporte XML para Siscomex.',
              icon: <CheckCircle2 className="w-6 h-6" />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-primary-400 mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              O que você ganha com TrueNorth
            </h2>
            <div className="space-y-6">
              {[
                'Classificação NCM automática com nível de confiança (Alta, Média, Baixa).',
                'Estimativa instantânea de II, IPI e PIS/COFINS.',
                'Identificação automática de anuentes (ANVISA, MAPA, ANATEL...).',
                'Exportação XML compatível com Siscomex.',
                'Alerta de possível subfaturamento na operação.',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary-600/20 blur-3xl rounded-full"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-sm text-slate-500 uppercase font-semibold mb-2">
                  Tempo de processamento
                </div>
                <div className="text-5xl font-bold text-white">~30s</div>
                <div className="text-slate-400 text-sm mt-2">por invoice</div>
              </div>
              <div className="space-y-4 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary-400" />
                  <span className="text-slate-300">PDF, XML, Imagem</span>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-accent-400" />
                  <span className="text-slate-300">Motor proprietário de IA</span>
                </div>
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">XML Siscomex pronto</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span className="text-slate-300">Base NCM atualizada</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutSectionWithShip() {
  return (
    <section id="sobre" className="py-24 bg-slate-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <ShipAnimation />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Navegue com segurança no novo processo de importação
            </h2>
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              A chegada da DUIMP muda completamente a forma como o Brasil importa. A TrueNorth é a
              bússola que guia sua empresa através dessas mudanças, transformando conformidade em
              vantagem competitiva.
            </p>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Não deixe sua carga parada por erros de preenchimento ou falta de licenciamento. Nossa
              tecnologia antecipa problemas antes que eles cheguem ao porto.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ForWhomSection() {
  return (
    <section id="para-quem" className="py-24 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Para quem é a TrueNorth?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-primary-500/50 transition-all group">
            <Ship className="w-10 h-10 text-primary-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">Importadores</h3>
            <p className="text-slate-400">
              Que buscam agilidade no desembaraço e redução de custos operacionais.
            </p>
          </div>
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-accent-500/50 transition-all group">
            <Globe2 className="w-10 h-10 text-accent-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">Trading Companies</h3>
            <p className="text-slate-400">
              Que gerenciam múltiplas operações e precisam de controle centralizado.
            </p>
          </div>
          <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 hover:border-orange-500/50 transition-all group">
            <FileCheck className="w-10 h-10 text-orange-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold text-white mb-3">Despachantes</h3>
            <p className="text-slate-400">
              Que desejam oferecer um serviço premium e à prova de erros para seus clientes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export interface CTASectionProps {
  onSimulateClick: () => void;
}

export function CTASection({ onSimulateClick }: CTASectionProps) {
  return (
    <section id="contato" className="py-24 bg-primary-600 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
          Teste agora com sua invoice
        </h2>
        <p className="text-primary-100 text-xl mb-10 max-w-2xl mx-auto">
          Faça upload da sua invoice e veja a mágica acontecer. NCM, impostos e anuentes em
          segundos.
        </p>
        <button
          onClick={onSimulateClick}
          className="bg-white text-primary-600 hover:bg-slate-100 px-10 py-4 rounded-lg text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2 mx-auto"
        >
          <Upload className="w-5 h-5" /> Fazer Upload Agora
        </button>
      </div>
    </section>
  );
}
