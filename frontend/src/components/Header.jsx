import React from 'react';
import { DollarSign, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ budget, isBackend, onRestart, historyLength }) {
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-amber-900/30 sticky top-0 z-40 px-4 py-3 sm:px-8">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Theme */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40">
            <span className="font-serif font-black text-slate-950 text-xl tracking-tighter">A</span>
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg sm:text-xl text-amber-100 tracking-wide flex items-center gap-2">
              ASTERIA: ĐỘC QUYỀN TƯ BẢN
            </h1>
            <p className="text-xs text-amber-400/70 uppercase tracking-widest font-mono">
              Kinh tế chính trị Mác - Lênin • Tập đoàn Hàng không
            </p>
          </div>
        </div>

        {/* Right side stats & controls */}
        <div className="flex items-center gap-3 sm:gap-6">
          
          {/* Mode Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Cpu className={`w-3.5 h-3.5 ${isBackend ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{isBackend ? 'FastAPI Connected' : 'Client Graph Mode'}</span>
          </div>

          {/* Budget Display */}
          <motion.div 
            key={budget}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shadow-inner"
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-sm sm:text-base tracking-tight">
              {formattedBudget}
            </span>
          </motion.div>

          {/* Restart Button */}
          <button
            onClick={onRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-medium cursor-pointer"
            title="Bắt đầu lại"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Khởi động lại</span>
          </button>
        </div>

      </div>
    </header>
  );
}
