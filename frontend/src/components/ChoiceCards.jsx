import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, DollarSign } from 'lucide-react';

export default function ChoiceCards({ choices = [], onSelect }) {
  if (!choices || choices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
      {choices.map((choice, index) => {
        const optionLetter = index === 0 ? "A" : "B";
        const revMil = choice.revenue_million;
        const revBadge = choice.revenue || (revMil ? (revMil > 0 ? `+$${revMil}M` : `-$${Math.abs(revMil)}M`) : null);

        return (
          <motion.div
            key={`choice-${choice.node}`}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(choice)}
            className="group relative bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              {/* Option badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="w-7 h-7 rounded-lg bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 font-mono font-bold text-sm flex items-center justify-center border border-amber-500/30 transition-all">
                  {optionLetter}
                </span>

                {revBadge && (
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    revMil > 0 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : revMil < 0 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <DollarSign className="w-3 h-3" />
                    {revBadge}
                  </span>
                )}
              </div>

              {/* Option text */}
              <p className="text-slate-100 font-serif font-medium text-base leading-snug group-hover:text-amber-100 transition-colors">
                {choice.content}
              </p>
            </div>

            {/* Hint / Click indicator */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="group-hover:text-slate-300">Nhấp để xem phân tích</span>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
