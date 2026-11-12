import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ArrowRight, FileText, ChevronRight, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export default function BottomDialogue({ 
  currentContext = null,
  contextIndex = 0,
  totalContexts = 0,
  onNextContext,
  question = null, 
  choices = [], 
  onSelect,
  isEnding = false
}) {
  // If we are currently reading through narrative contexts
  if (currentContext) {
    const revRaw = currentContext.revenue;
    const hasRevenue = Boolean(revRaw && revRaw.trim() !== "");
    const isNegative = hasRevenue && revRaw.includes("-");
    const isPositive = hasRevenue && revRaw.includes("+");

    const isLastContext = contextIndex >= totalContexts - 1;
    const buttonLabel = isLastContext 
      ? (isEnding ? "XEM KẾT CỤC TOÀN CẢNH" : "BƯỚC VÀO QUYẾT ĐỊNH CHIẾN LƯỢC") 
      : "ĐỌC BẢN TIN TIẾP THEO";

    return (
      <div className="w-full shrink-0 min-h-[260px] sm:min-h-[280px] bg-[#141820] border-t-2 border-[#374151] px-4 py-4 sm:px-8 sm:py-5 flex flex-col justify-between z-20 shadow-2xl relative select-none font-sans">
        
        {/* Narrative Dispatch Card */}
        <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`ctx-${currentContext.node}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between border-b border-[#2d3748] pb-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-mono font-bold text-xs uppercase tracking-wider">
                    ĐIỆN BÁO LỊCH SỬ • NODE #{currentContext.node}
                  </span>
                  {totalContexts > 1 && (
                    <span className="text-[11px] font-mono text-slate-400">
                      (Bản tin {contextIndex + 1}/{totalContexts})
                    </span>
                  )}
                </div>

                {/* Financial impact tag if present */}
                {hasRevenue && (
                  <div className={`px-2.5 py-0.5 rounded font-mono font-bold text-xs flex items-center gap-1 border ${
                    isNegative 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                    <span>Biến động ngân sách: {revRaw}</span>
                  </div>
                )}
              </div>

              {/* Full Context Story Text */}
              <p className="font-serif text-sm sm:text-base md:text-lg text-slate-100 leading-relaxed bg-[#1c222d] p-4 rounded border border-[#2d3748] shadow-inner">
                {currentContext.content}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Button to Proceed to Next Context or Question */}
        <div className="max-w-4xl mx-auto w-full pt-3 flex justify-end">
          <button
            type="button"
            onClick={onNextContext}
            className="py-3 px-6 sm:px-8 bg-amber-400 hover:bg-amber-300 text-black font-mono font-black text-xs sm:text-sm rounded border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
          >
            <span>{buttonLabel}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    );
  }

  // If in Question & Choices phase
  return (
    <div className="w-full shrink-0 min-h-[260px] sm:min-h-[280px] bg-[#141820] border-t-2 border-[#374151] px-4 py-3 sm:px-8 sm:py-4 flex flex-col justify-between z-20 shadow-2xl relative select-none font-sans">
      
      {/* Upper area: Question Title */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col justify-center max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {question && (
            <motion.div
              key={`q-${question.node}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="space-y-1.5"
            >
              <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>QUYẾT ĐỊNH CHIẾN LƯỢC • NODE #{question.node}</span>
              </div>

              <h2 className="font-serif font-black text-base sm:text-lg md:text-xl text-white leading-snug">
                {question.content}
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Option Buttons (Tactile Retro Buttons with offset pixel shadow) */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 pt-2">
        {choices.map((choice, index) => {
          const isFirst = index === 0;
          const revMil = choice.revenue_million;
          const revBadge = choice.revenue || (revMil ? (revMil > 0 ? `+$${revMil}M` : `-$${Math.abs(revMil)}M`) : null);
          const isPositive = revMil > 0 || (choice.revenue && choice.revenue.includes('+'));

          return (
            <button
              key={`choice-${choice.node}`}
              type="button"
              onClick={() => onSelect(choice)}
              className={`flex items-center justify-between p-3 sm:p-3.5 rounded border-2 transition-all text-left cursor-pointer group shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                isFirst
                  ? 'bg-[#182a20] hover:bg-[#1f382a] border-[#22c55e]/60 hover:border-[#22c55e]'
                  : 'bg-[#2a1a1e] hover:bg-[#382228] border-[#f43f5e]/60 hover:border-[#f43f5e]'
              }`}
            >
              {/* Left icon: [✓] or [✕] in classic retro box */}
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded flex items-center justify-center shrink-0 border-2 font-mono font-black text-xs ${
                  isFirst 
                    ? 'bg-[#22c55e]/20 text-[#4ade80] border-[#22c55e]/60 group-hover:bg-[#22c55e] group-hover:text-black' 
                    : 'bg-[#f43f5e]/20 text-[#fb7185] border-[#f43f5e]/60 group-hover:bg-[#f43f5e] group-hover:text-black'
                } transition-colors`}>
                  {isFirst ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-4 h-4 stroke-[3]" />}
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white line-clamp-2 leading-tight">
                  {choice.content}
                </div>
              </div>

              {/* Financial Revenue Tag */}
              {revBadge && (
                <div className={`shrink-0 text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${
                  isPositive
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {revBadge}
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
}
