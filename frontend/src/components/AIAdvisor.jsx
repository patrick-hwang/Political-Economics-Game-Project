import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, GraduationCap } from 'lucide-react';

export default function AIAdvisor({ node, questionContent }) {
  const [isOpen, setIsOpen] = useState(true);

  // Dynamic theoretical takeaway based on stage / node
  const getTheoreticalNote = (nodeId) => {
    if (nodeId <= 15) {
      return {
        concept: "Tích tụ & Tập trung tư bản trong Chiến tranh (1914 - 1918)",
        theory: "Theo V.I. Lênin, chiến tranh đế quốc là đòn bẩy thúc đẩy quá trình tập trung tư bản với tốc độ chóng mặt. Các hợp đồng quân sự béo bở của nhà nước tạo ra lợi nhuận siêu ngạch độc quyền, cho phép các xưởng cơ khí nhỏ nhanh chóng phình to thành các tổ hợp công nghiệp - quân sự."
      };
    }
    if (nodeId <= 60) {
      return {
        concept: "Chuyển đổi Hậu chiến & Khủng hoảng thừa (1920s - 1930s)",
        theory: "Sau chiến tranh, nhu cầu vũ khí sụt giảm đột ngột dẫn đến khủng hoảng thừa công suất. Các doanh nghiệp độc quyền phải chuyển dịch sang thị trường dân dụng hoặc hình thành các liên minh giá (Cartel/Syndicate) để phân chia thị trường tiêu thụ."
      };
    }
    return {
      concept: "Cạnh tranh giữa các tập đoàn xuyên quốc gia & Độc quyền nhà nước",
      theory: "Độc quyền không thủ tiêu cạnh tranh, mà làm cho cạnh tranh trở nên gay gắt hơn. Sự đối đầu giữa các siêu tập đoàn tư bản trên thị trường toàn cầu phản ánh quy luật phát triển không đều của chủ nghĩa tư bản."
    };
  };

  const note = getTheoreticalNote(node);

  return (
    <div className="bg-slate-900/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Góc nhìn Kinh tế Chính trị Mác - Lênin</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <span>{isOpen ? 'Thu gọn' : 'Xem phân tích'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 pt-1 border-t border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed"
          >
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>{note.concept}</span>
            </div>
            <p className="text-slate-300/90 font-sans">
              {note.theory}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
