import React from 'react';
import { Send, DollarSign, RotateCcw } from 'lucide-react';
import Timeline from './Timeline';

export default function TopBar({ budget, currentNode, onRestart }) {
  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

  return (
    <div className="w-full h-16 shrink-0 bg-[#141820] border-b-2 border-[#374151] px-4 sm:px-6 flex items-center justify-between z-20 select-none font-sans">
      
      {/* Top-Left: Paper Plane icon + Brand */}
      <div className="flex items-center gap-2.5 w-1/4">
        <div className="p-1.5 rounded bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
          <Send className="w-4 h-4 -rotate-45 stroke-[2.5]" />
        </div>
        <div>
          <div className="text-xs font-serif font-black text-white tracking-wider">ASTERIA</div>
          <div className="text-[10px] font-mono text-amber-400/90 font-bold">1914 - 2008</div>
        </div>
      </div>

      {/* Top-Center: Timeline O---O---O---O */}
      <div className="flex-1 flex justify-center">
        <Timeline currentNode={currentNode} />
      </div>

      {/* Top-Right: Budget & Restart Button */}
      <div className="flex items-center justify-end gap-2 sm:gap-3 w-1/4">
        {/* Budget Badge with Tactile Retro Border */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1c222d] border border-[#374151] shadow-[2px_2px_0px_0px_#000] text-amber-300 font-mono text-xs sm:text-sm font-bold">
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>{formattedBudget}</span>
        </div>

        {/* Restart Button */}
        <button
          type="button"
          onClick={onRestart}
          className="py-1 px-2.5 rounded bg-[#252d3d] hover:bg-[#2d3748] text-slate-300 hover:text-white border border-[#374151] shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
          title="Chơi lại từ đầu"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">Chơi lại</span>
        </button>
      </div>

    </div>
  );
}
