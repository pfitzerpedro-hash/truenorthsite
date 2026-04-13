import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Anchor } from 'lucide-react';

export function ShipAnimation() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });

  return (
    <div
      ref={ref}
      className="relative w-full h-80 overflow-hidden mt-10 md:mt-0 flex items-end justify-center bg-gradient-to-t from-blue-900/10 to-transparent rounded-xl border-b border-blue-900/30"
    >
      <div className="absolute inset-0 flex items-end justify-between px-4 lg:px-10 opacity-10 text-slate-500 pointer-events-none">
        <div className="w-12 h-64 border-t-8 border-r-4 border-current rounded-tr-xl transform -skew-x-12 origin-bottom"></div>
        <div className="w-20 h-48 border-t-8 border-l-4 border-current rounded-tl-xl transform skew-x-6 origin-bottom ml-auto"></div>
        <div className="absolute bottom-10 left-1/3 w-8 h-32 border-l-2 border-current"></div>
      </div>
      <div className="absolute bottom-0 w-full h-4 bg-gradient-to-r from-transparent via-blue-900/50 to-transparent"></div>
      <motion.div
        className="relative z-10 mb-2"
        initial={{ x: 300, opacity: 0 }}
        animate={isInView ? { x: 0, opacity: 1 } : { x: 300, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 30, damping: 25, duration: 2 }}
      >
        <div className="relative">
          <div className="flex gap-0.5 absolute bottom-full mb-0 left-8">
            <div className="w-10 h-8 bg-blue-700 border border-blue-900 rounded-sm shadow-sm"></div>
            <div className="w-10 h-8 bg-orange-600 border border-orange-800 rounded-sm shadow-sm"></div>
            <div className="w-10 h-8 bg-cyan-700 border border-cyan-900 rounded-sm shadow-sm"></div>
          </div>
          <div className="flex gap-0.5 absolute bottom-full mb-8 left-12">
            <div className="w-10 h-8 bg-slate-600 border border-slate-800 rounded-sm shadow-sm"></div>
            <div className="w-10 h-8 bg-blue-600 border border-blue-800 rounded-sm shadow-sm"></div>
          </div>
          <div className="absolute bottom-full right-6 w-16 h-20 bg-slate-100 border-2 border-slate-300 rounded-t-md flex flex-col items-center justify-start pt-2 shadow-lg">
            <div className="w-12 h-4 bg-slate-800 rounded-sm mb-1 border border-slate-600"></div>
            <div className="w-12 h-4 bg-slate-800 rounded-sm border border-slate-600"></div>
            <div className="mt-auto mb-2 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          </div>
          <div className="w-96 h-20 bg-slate-800 rounded-bl-[3rem] rounded-br-xl relative overflow-hidden shadow-2xl border-t-4 border-red-700">
            <div className="absolute top-3 right-6 flex items-center gap-2">
              <Anchor className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500 opacity-60 uppercase">
                TrueNorth Spirit
              </span>
            </div>
            <div className="absolute bottom-0 w-full h-2 bg-black/30"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
