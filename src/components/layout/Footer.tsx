import React from 'react';
import { Anchor, FileText, Calculator, FileSearch, Download } from 'lucide-react';

export function Footer() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Anchor className="h-6 w-6 text-accent-500" />
              <span className="font-bold text-lg text-white">TrueNorth</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Extraia dados de invoices, classifique NCM e calcule impostos automaticamente com IA.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Navegação</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  onClick={() => scrollToSection('produto')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Produto
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('como-funciona')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Como Funciona
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('para-quem')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Para Quem
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('perfil')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Perfil
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contato')}
                  className="hover:text-accent-400 transition-colors"
                >
                  Contato
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Funcionalidades</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> Upload PDF/XML de Invoice
              </li>
              <li className="flex items-center gap-2">
                <Calculator className="w-4 h-4" /> Classificação NCM com IA
              </li>
              <li className="flex items-center gap-2">
                <FileSearch className="w-4 h-4" /> Estimativa de Impostos
              </li>
              <li className="flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportação XML Siscomex
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} TrueNorth. Todos os direitos reservados.
          </p>
          <p className="text-slate-600 text-xs">Motor proprietário de IA</p>
        </div>
      </div>
    </footer>
  );
}
