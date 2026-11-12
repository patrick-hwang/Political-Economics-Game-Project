import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Compass, Shield, Feather } from 'lucide-react';
import { playPageTurnSound } from '../services/soundEffects';

export default function StartMenu({ onStartGame }) {
  const [selectedGender, setSelectedGender] = useState('male'); // 'male' | 'female'

  const portraitSrc = selectedGender === 'male' 
    ? '/assets/portraits/ceo_male.jpg' 
    : '/assets/portraits/ceo_female.jpg';

  const ceoName = selectedGender === 'male' ? 'ALEXANDER VANCE' : 'VICTORIA VANCE';
  const ceoRole = selectedGender === 'male' ? 'Chủ tịch Sáng lập' : 'Tổng Giám đốc Điều hành';

  const handleStart = () => {
    playPageTurnSound();
    onStartGame({ gender: selectedGender });
  };

  return (
    <div className="min-h-screen w-screen bg-[#0c0e12] flex items-center justify-center p-3 sm:p-6 select-none font-serif">
      
      {/* Dark Oak Desk Background */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d1612]/70 via-[#0c0e12] to-[#050608] pointer-events-none" />

      {/* The Leather Tome Cover (Sir Brante Style Book Cover) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-4xl bg-[#1f1712] rounded-xl border-4 border-[#3d2a1c] p-6 sm:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.95)] grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
      >
        {/* Subtle Gilded Inlay Border */}
        <div className="absolute inset-2 sm:inset-3 border border-[#69482f]/60 rounded-lg pointer-events-none" />

        {/* Left Column: Cameo Portrait in Gilded Ink Frame */}
        <div className="md:col-span-5 flex flex-col items-center">
          <div className="relative w-48 sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#b59268] shadow-[4px_4px_0px_#0a0806] bg-[#0c0f14]">
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedGender}
                src={portraitSrc}
                alt={ceoName}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover object-top filter contrast-[1.05]"
              />
            </AnimatePresence>
          </div>

          <div className="mt-3 text-center">
            <h3 className="font-serif font-black text-sm sm:text-base text-[#e8d8be] tracking-wide">
              {ceoName}
            </h3>
            <p className="font-mono text-[11px] text-[#a48a73]">
              {ceoRole} • 1914
            </p>
          </div>
        </div>

        {/* Right Column: Title, Chronicle Lore & Action Button */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-5 text-[#f4ecd8]">
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#382618] text-[#d4af37] border border-[#5c3e27] text-[10px] font-mono tracking-widest uppercase mb-2">
              <Compass className="w-3 h-3" />
              <span>SỔ CÁI KINH TẾ CHÍNH TRỊ (1914 – 2008)</span>
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-4xl text-[#f7f2e7] tracking-tight">
              ASTERIA AVIATION
            </h1>
            <p className="font-mono text-xs sm:text-sm text-[#b59268] tracking-widest uppercase mt-1">
              Biên niên sử Độc quyền & Tiến trình Lịch sử
            </p>
          </div>

          {/* Lore description */}
          <p className="text-xs sm:text-sm text-[#c9b79e] leading-relaxed font-sans bg-[#17110d] p-3.5 rounded border border-[#382618]">
            Thế chiến I bùng nổ năm 1914. Cuốn sổ cái này lưu giữ từng quyết định chiến lược, từng biến động ngân sách và những bước ngoặt sống còn của tập đoàn Asteria qua 28 mốc lịch sử trọng đại.
          </p>

          {/* Selection & Start */}
          <div className="space-y-3 pt-2">
            <div>
              <div className="text-[10px] font-mono text-[#a48a73] uppercase tracking-wider mb-1.5">
                Người ghi chép lịch sử:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGender('male')}
                  className={`py-2 px-3 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                    selectedGender === 'male'
                      ? 'bg-[#d4af37] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#291e17] text-[#c9b79e] border-[#473426] hover:bg-[#33251c]'
                  }`}
                >
                  ♂ Alexander Vance
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedGender('female')}
                  className={`py-2 px-3 text-xs font-mono font-bold rounded border transition-all cursor-pointer ${
                    selectedGender === 'female'
                      ? 'bg-[#d4af37] text-black border-black shadow-[2px_2px_0px_#000]'
                      : 'bg-[#291e17] text-[#c9b79e] border-[#473426] hover:bg-[#33251c]'
                  }`}
                >
                  ♀ Victoria Vance
                </button>
              </div>
            </div>

            {/* Open Book Button */}
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 sm:py-4 px-6 bg-[#d4af37] hover:bg-[#c49f2b] text-black font-serif font-black text-base sm:text-lg rounded border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>MỞ SỔ BIÊN NIÊN SỬ</span>
            </button>
          </div>

          {/* Academic Footer */}
          <div className="pt-2 border-t border-[#382618] flex items-center justify-between text-[10px] font-mono text-[#7a6452]">
            <span>28 NODES NHÁNH 1 • APCS HCMUS</span>
            <span>KHOA NGUYỄN ANH</span>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
