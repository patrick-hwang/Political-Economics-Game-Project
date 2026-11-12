import React from 'react';
import { motion } from 'framer-motion';

export default function MiddleCharacter({ currentNode = 1, gender = 'male' }) {
  // Historical Era background color
  const getEraColor = (node) => {
    if (node <= 42) return "bg-[#161a22]"; // 1914-1918 WWI
    if (node <= 70) return "bg-[#18241e]"; // 1919-1928 Interwar
    if (node <= 120) return "bg-[#25181e]"; // 1929-1935 Great Depression
    if (node <= 250) return "bg-[#151c27]"; // 1936-1945 WWII
    if (node <= 380) return "bg-[#1a2228]"; // 1950s-1970s Jet Age
    return "bg-[#13161c]"; // Modern
  };

  const getEraLabel = (node) => {
    if (node <= 42) return "1914–1918 • KHAI CHIẾN & CƠ HỘI";
    if (node <= 70) return "1919–1928 • THƯƠNG MẠI HÓA HẬU CHIẾN";
    if (node <= 120) return "1929–1935 • ĐẠI SUY THOÁI";
    if (node <= 250) return "1936–1945 • THẾ CHIẾN II & SẢN XUẤT HÀNG LOẠT";
    if (node <= 380) return "1950s–1970s • KỶ NGUYÊN PHẢN LỰC";
    return "1980s–2008 • TOÀN CẦU HÓA & ĐỘC QUYỀN";
  };

  const portraitSrc = gender === 'female' 
    ? '/assets/portraits/ceo_female.jpg' 
    : '/assets/portraits/ceo_male.jpg';

  const ceoName = gender === 'female' ? 'CEO Victoria Vance' : 'CEO Alexander Vance';

  return (
    <div className={`flex-1 w-full relative flex items-center justify-center overflow-hidden transition-colors duration-500 ${getEraColor(currentNode)} select-none p-4`}>
      
      {/* Clean Retro Comic Character Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        {/* Comic Frame Card with Retro Solid Border & Offset Shadow */}
        <div className="relative rounded bg-[#10141b] border-2 border-[#374151] shadow-[6px_6px_0px_0px_#000000] overflow-hidden max-h-[340px] sm:max-h-[380px] md:max-h-[420px] aspect-[3/4]">
          <img 
            src={portraitSrc}
            alt={ceoName}
            className="w-full h-full object-cover object-top"
          />
          
          {/* Bottom Clean Label */}
          <div className="absolute bottom-0 inset-x-0 py-1.5 px-3 bg-[#111620]/95 border-t border-[#374151] text-center">
            <span className="text-xs font-mono font-bold text-amber-400">
              {ceoName}
            </span>
          </div>
        </div>

        {/* Small Era Pill under card */}
        <div className="mt-2 text-[10px] sm:text-xs font-mono text-slate-400 tracking-wider">
          {getEraLabel(currentNode)}
        </div>
      </motion.div>

    </div>
  );
}
