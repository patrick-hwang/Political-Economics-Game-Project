import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, TrendingUp, X, FileText } from 'lucide-react';

export default function ConfirmationModal({ choice, isOpen, onClose, onConfirm }) {
  if (!isOpen || !choice) return null;

  const revMil = choice.revenue_million;
  const revFormatted = choice.revenue || (revMil ? (revMil > 0 ? `+$${revMil}M` : `-$${Math.abs(revMil)}M`) : 'Không đổi');
  const isPositive = revMil > 0 || (choice.revenue && choice.revenue.includes('+'));
  const isNegative = revMil < 0 || (choice.revenue && choice.revenue.includes('-'));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none font-sans">
        
        {/* Retro Web Game Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="bg-[#1c222d] border-2 border-[#374151] rounded-lg max-w-lg w-full p-5 sm:p-6 shadow-[8px_8px_0px_0px_#000000] relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#374151]">
            <h3 className="font-serif font-black text-lg text-amber-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              SẮC LỆNH ĐIỀU HÀNH CHIẾN LƯỢC
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#252d3d] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Choice Content */}
          <div className="my-4">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1.5">
              Phương án xem xét:
            </div>
            <p className="font-serif font-bold text-white text-sm sm:text-base leading-snug bg-[#141820] p-3.5 rounded border border-[#2d3748]">
              "{choice.content}"
            </p>
          </div>

          {/* Strategic Analysis Breakdown */}
          <div className="space-y-2.5 my-4">
            {choice.benefits && (
              <div className="flex items-start gap-2.5 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded">
                <TrendingUp className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-400">Lợi ích kỳ vọng: </span>
                  {choice.benefits}
                </div>
              </div>
            )}

            {choice.potential_drawback && (
              <div className="flex items-start gap-2.5 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-rose-400">Rủi ro tiềm ẩn: </span>
                  {choice.potential_drawback}
                </div>
              </div>
            )}

            {/* Financial effect */}
            <div className="flex items-center justify-between px-3 py-2 rounded bg-[#141820] border border-[#2d3748] text-xs font-mono">
              <span className="text-slate-400">Biến động ngân sách:</span>
              <span className={`font-bold ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-300'}`}>
                {revFormatted}
              </span>
            </div>
          </div>

          {/* Action buttons with Tactile Retro Shadows */}
          <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t-2 border-[#374151]">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded bg-[#252d3d] hover:bg-[#2d3748] text-slate-300 font-mono font-bold text-xs border border-[#374151] transition-all cursor-pointer"
            >
              CÂN NHẮC LẠI
            </button>
            <button
              type="button"
              onClick={() => onConfirm(choice.node)}
              className="py-2.5 px-5 rounded bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
            >
              <span>KÝ BAN HÀNH SẮC LỆNH</span>
            </button>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
