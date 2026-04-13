import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Anchor, Menu, X, User } from 'lucide-react';
import * as api from '../../api';

export interface NavbarProps {
  onSimulateClick: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  currentUser: api.User | null;
  onNavigateHome?: () => void;
}

export function Navbar({
  onSimulateClick,
  onOpenAuth,
  onOpenProfile,
  currentUser,
  onNavigateHome,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            onClick={onNavigateHome ? onNavigateHome : () => window.scrollTo(0, 0)}
          >
            <Anchor className="h-7 w-7 text-accent-500" />
            <span className="font-bold text-xl tracking-tight text-white">TrueNorth</span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <button
                onClick={() => scrollToSection('produto')}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Produto
              </button>
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('para-quem')}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Para Quem
              </button>
              <button
                onClick={onSimulateClick}
                className="text-accent-400 hover:text-accent-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Simulação
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contato
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            {currentUser ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-3 bg-slate-800/50 border border-slate-700 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer"
                title="Abrir perfil"
              >
                <User className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-slate-200">
                  {currentUser.name || currentUser.email}
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40"
              >
                Entrar / Cadastrar
              </button>
            )}
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-400 hover:text-white p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-900 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => scrollToSection('produto')}
                className="text-slate-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Produto
              </button>
              <button
                onClick={() => scrollToSection('como-funciona')}
                className="text-slate-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Como Funciona
              </button>
              <button
                onClick={() => scrollToSection('para-quem')}
                className="text-slate-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Para Quem
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSimulateClick();
                }}
                className="text-accent-400 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Simulação
              </button>
              <button
                onClick={() => scrollToSection('contato')}
                className="text-slate-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Contato
              </button>
              {currentUser ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full text-left bg-slate-800/60 text-white px-3 py-2 rounded-md text-base font-medium mt-4 border border-slate-700 hover:bg-slate-700/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-400" />
                    <span className="text-sm">{currentUser.name || currentUser.email}</span>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium mt-4 shadow-md"
                >
                  Entrar / Cadastrar
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
