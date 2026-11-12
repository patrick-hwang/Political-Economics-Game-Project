import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Compass } from 'lucide-react';

export default function EventVignette({ 
  isOpen, 
  onClose, 
  era = "GIAI ĐOẠN 01 • 1914 – 1918",
  title = "KHỞI ĐẦU ASTERIA & ĐƠN HÀNG THỜI CHIẾN",
  description = "Thế chiến I bùng nổ năm 1914. Nhu cầu trinh sát và vận tải thúc đẩy các đơn đặt hàng quân sự. Xưởng cơ khí Asteria đứng trước bước ngoặt lịch sử: nhận đơn hàng chế tạo linh kiện máy bay hay tiếp tục sản xuất cơ khí truyền thống?",
  imageSrc = "/assets/events/event_1914.jpg",
  buttonText = "TIẾP NHẬN QUYẾT ĐỊNH"
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 select-none font-sans">
        
        {/* Retro Web Game Modal Box */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-[#1c222d] border-2 border-[#374151] rounded-lg shadow-[8px_8px_0px_0px_#000000] overflow-hidden flex flex-col"
        >
          {/* Header Bar */}
          <div className="bg-[#141820] border-b-2 border-[#374151] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>{era}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 uppercase">
              BẢN TIN LỊCH SỬ ASTERIA
            </div>
          </div>

          {/* Graphic Novel Illustration Panel */}
          <div className="relative w-full aspect-video max-h-[360px] bg-black overflow-hidden border-b-2 border-[#374151]">
            <img 
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Content & Action */}
          <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#1c222d]">
            <div className="max-w-xl">
              <h2 className="text-xl sm:text-2xl font-black font-serif text-white tracking-tight">
                {title}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="shrink-0 w-full sm:w-auto py-3 px-6 bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs sm:text-sm rounded border-2 border-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
