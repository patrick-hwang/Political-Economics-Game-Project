import React, { useEffect } from 'react';
import { Trophy, Skull, RotateCcw, Award, BookCheck, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OutcomeView({ outcome, finalBudget, onRestart }) {
  const isWin = outcome.type === "win";

  useEffect(() => {
    if (isWin) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isWin]);

  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(finalBudget);

  return (
    <div className={`rounded-lg p-6 sm:p-8 border-2 shadow-[8px_8px_0px_0px_#000000] text-center select-none font-sans bg-[#1c222d] ${
      isWin ? 'border-emerald-500/60' : 'border-rose-500/60'
    }`}>
      {/* Icon Badge */}
      <div className="inline-flex p-3 rounded-lg mb-3 bg-[#141820] border border-[#374151] shadow-[3px_3px_0px_0px_#000000]">
        {isWin ? (
          <Trophy className="w-10 h-10 text-amber-400" />
        ) : (
          <Skull className="w-10 h-10 text-rose-500" />
        )}
      </div>

      {/* Outcome Title */}
      <h2 className={`font-serif font-black text-2xl sm:text-3xl tracking-tight mb-2 ${
        isWin ? 'text-emerald-400' : 'text-rose-400'
      }`}>
        {isWin ? "KẾT CỤC: THỐNG LĨNH VỊ THẾ ĐỘC QUYỀN" : "KẾT CỤC: PHÁ SẢN HOẶC THẤT BẠI CHIẾN LƯỢC"}
      </h2>

      {/* Final Financial Result */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded bg-[#141820] border border-[#2d3748] font-mono text-xs sm:text-sm mb-5">
        <span className="text-slate-400">Ngân sách tích lũy:</span>
        <span className="font-bold text-amber-300">{formattedBudget}</span>
      </div>

      {/* Story Ending Content */}
      <div className="max-w-2xl mx-auto bg-[#141820] p-4 sm:p-5 rounded border border-[#2d3748] mb-6 text-left shadow-inner">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2 uppercase tracking-wider">
          <BookCheck className="w-4 h-4" />
          <span>Biên niên sử Asteria • Node #{outcome.node}</span>
        </div>
        <p className="text-slate-200 font-sans text-sm sm:text-base leading-relaxed">
          {outcome.content}
        </p>

        {outcome.impact && (
          <div className="mt-3 pt-3 border-t border-[#2d3748] text-xs text-amber-300/90 font-mono italic">
            "{outcome.impact}"
          </div>
        )}
      </div>

      {/* Political Economy Academic Note */}
      <div className="max-w-2xl mx-auto bg-[#161d27] p-3 rounded border border-[#273243] mb-6 text-left text-xs font-sans text-slate-300">
        <div className="font-mono font-bold text-amber-400 mb-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          <span>BÀI HỌC KINH TẾ CHÍNH TRỊ MÁC - LÊNIN:</span>
        </div>
        <p className="leading-relaxed text-slate-400">
          Tiến trình phát triển của Asteria Aviation minh chứng cho các quy luật cốt lõi của chủ nghĩa tư bản độc quyền: Tích tụ và tập trung sản xuất dẫn đến độc quyền; sự can thiệp của nhà nước tư sản bảo vệ tư bản độc quyền; và mâu thuẫn giữa quy luật giá trị thặng dư với tính vô chính phủ của thị trường tự do.
        </p>
      </div>

      {/* Restart Button */}
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-2 px-6 py-3 rounded bg-amber-400 hover:bg-amber-300 text-black font-serif font-black text-sm sm:text-base border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
        <span>KHỞI NGHIỆP LẠI (NĂM 1914)</span>
      </button>

    </div>
  );
}
