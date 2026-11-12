import React from 'react';
import { motion } from 'framer-motion';

const MILESTONES = [
  { id: 1, label: '1914', desc: 'Thế chiến I' },
  { id: 2, label: '1919', desc: 'Hậu chiến' },
  { id: 3, label: '1929', desc: 'Suy thoái' },
  { id: 4, label: '1939', desc: 'Thế chiến II' },
  { id: 5, label: '1945', desc: 'Phản lực' },
  { id: 6, label: '1973', desc: 'Dầu mỏ' },
  { id: 7, label: '2000s', desc: 'Độc quyền' },
];

export default function Timeline({ currentNode = 1 }) {
  // Determine active milestone based on node thresholds in Branch 1
  let activeIndex = 0;
  if (currentNode >= 259 || currentNode === 379 || currentNode === 381 || currentNode === 382) activeIndex = 6;
  else if (currentNode >= 139 || currentNode === 169) activeIndex = 6;
  else if (currentNode >= 90 || currentNode === 94) activeIndex = 5;
  else if (currentNode >= 47 || currentNode === 36) activeIndex = 4;
  else if (currentNode >= 44 || currentNode === 50) activeIndex = 3;
  else if (currentNode >= 43 || currentNode === 6) activeIndex = 2;
  else if (currentNode >= 42 || currentNode === 29) activeIndex = 1;
  else activeIndex = 0;

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-1 font-mono">
      {MILESTONES.map((step, idx) => {
        const isPast = idx < activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <React.Fragment key={step.id}>
            {/* Connecting line */}
            {idx > 0 && (
              <div 
                className={`h-0.5 w-2.5 sm:w-5 transition-colors duration-200 ${
                  isPast || isCurrent ? 'bg-amber-400' : 'bg-[#374151]'
                }`} 
              />
            )}

            {/* Node circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center border-2 transition-all duration-200 ${
                  isCurrent
                    ? 'border-black bg-amber-400 text-black font-black shadow-[2px_2px_0px_0px_#000]'
                    : isPast
                    ? 'border-[#22c55e]/60 bg-[#14261d] text-[#4ade80] font-bold'
                    : 'border-[#374151] bg-[#141820] text-slate-500'
                }`}
              >
                <span className="text-[10px] sm:text-xs">
                  {step.id}
                </span>
              </div>

              <span className={`text-[9px] sm:text-[10px] mt-0.5 tracking-tighter ${
                isCurrent ? 'text-amber-300 font-bold' : isPast ? 'text-slate-300' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
