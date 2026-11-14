import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [scale, setScale] = useState(1);
  const [progress, setProgress] = useState(25);
  const [statusText, setStatusText] = useState('Đang khởi động đường băng & nhà máy sản xuất quân sự...');

  // Scale viewport to maintain exact 1280x720 16:9 canvas
  useEffect(() => {
    const updateScale = () => {
      const scaleX = window.innerWidth / 1280;
      const scaleY = window.innerHeight / 720;
      setScale(Math.min(scaleX, scaleY));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Animated progressive status messages
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(55);
      setStatusText('Thiết lập hạn mức ngân quỹ ban đầu: $1,000,000...');
    }, 450);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setStatusText('Nạp hồ sơ tư liệu Thế chiến thứ nhất & Quyết sách 1914...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(98);
      setStatusText('Hội đồng Quản trị đã sẵn sàng xuất kích...');
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#0a0806] text-[#faebcd] flex items-center justify-center p-0 m-0 antialiased select-none relative">
      {/* 1. Background với sân bay 1914 mờ sâu và hiệu ứng vignette điện ảnh */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <img 
          src="/assets/menu_background_concept3_airfield.jpg" 
          alt="Sân bay 1914" 
          className="w-full h-full object-cover filter blur-[4px] brightness-40 scale-105 opacity-35"
        />
        {/* Radial Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(18,12,8,0.72)_0%,_rgba(8,6,4,0.98)_100%)]" />
      </div>

      {/* 2. Khung Canvas Cố định 1280x720 */}
      <div 
        className="relative z-10 w-[1280px] h-[720px] flex flex-col items-center justify-center p-8 select-none"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Tấm bảng điều hành trung tâm (Central Command Plaque) */}
        <div className="relative w-[780px] bg-gradient-to-b from-[#21160d]/95 via-[#160f09]/95 to-[#0d0905]/98 border-2 border-[#8c6721] rounded-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_1px_2px_rgba(255,225,130,0.3)] flex flex-col items-center text-center">
          
          {/* Corner Rivets (Ốc vít đồng 4 góc) */}
          <div className="absolute top-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
          <div className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
          <div className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />

          {/* Logo Game Asteria: Wings of Capital với hào quang hoàng kim */}
          <div className="relative w-[480px] h-[130px] flex items-center justify-center mb-5 logo-container">
            <div className="absolute inset-0 -m-4 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,225,120,0.45)_0%,_rgba(212,175,55,0.2)_40%,_rgba(0,0,0,0)_75%)] filter blur-xl pointer-events-none animate-pulse" />
            <img 
              src="/assets/logo_wings_of_capital.png" 
              alt="Asteria: Wings of Capital" 
              className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_12px_25px_rgba(0,0,0,0.98)] drop-shadow-[0_0_18px_rgba(235,190,65,0.45)] select-none pointer-events-none"
            />
            <div className="logo-shine z-20" />
          </div>

          {/* Cánh quạt động cơ máy bay quay êm dịu (1914 Propeller Spinner) */}
          <div className="relative w-12 h-12 mb-4 propeller-spin">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="loadPropGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffe066" />
                  <stop offset="40%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#553a10" />
                </linearGradient>
              </defs>
              <g>
                <path d="M47 50 C44 32 40 18 45 8 C48 2 52 2 55 8 C60 18 56 32 53 50 Z" fill="url(#loadPropGrad)" stroke="#2b1a06" strokeWidth="1.5" />
                <path d="M47 50 C44 68 40 82 45 92 C48 98 52 98 55 92 C60 82 56 68 53 50 Z" fill="url(#loadPropGrad)" stroke="#2b1a06" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="12" fill="url(#loadPropGrad)" stroke="#221504" strokeWidth="2" />
                <circle cx="50" cy="50" r="5" fill="#2d1c07" stroke="#d4af37" strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Tiêu đề chính theo Phương án 1 */}
          <h2 className="font-display font-black text-xl sm:text-[23px] text-[#faebcd] tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            ĐANG THIẾT LẬP HỘI ĐỒNG QUẢN TRỊ ASTERIA (1914)...
          </h2>

          {/* Phụ đề phương án 1 */}
          <p className="font-serif text-[#d4af37] text-sm sm:text-[15px] font-semibold tracking-wide mt-2 drop-shadow-sm max-w-lg">
            Chuẩn bị bước vào 8 kỷ nguyên kiến tạo Chủ nghĩa Tư bản Độc quyền Nhà nước
          </p>

          {/* Thước đo tiến trình mạ đồng thau cổ điển 1914 */}
          <div className="w-[420px] mt-6 flex flex-col items-center gap-2">
            <div className="w-full h-3 bg-[#100a06] rounded-full p-[2px] border border-[#78531d] shadow-[inset_0_1px_4px_rgba(0,0,0,0.9),0_2px_6px_rgba(0,0,0,0.8)] relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6b4718] via-[#d4af37] to-[#fff3a8] rounded-full shadow-[0_0_10px_rgba(212,175,55,0.7)] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Trạng thái nạp dữ liệu động */}
            <span className="font-mono text-xs text-[#c4aa92] tracking-wider select-none transition-all duration-300">
              {statusText}
            </span>
          </div>

          {/* Footer Subtext */}
          <div className="mt-6 pt-3 border-t border-[#4a3424]/60 w-full flex items-center justify-between px-4 text-[10px] font-mono text-[#8c6721]/80 uppercase tracking-widest">
            <span>ASTERIA AVIATION CORP • 1914 – 2008</span>
            <span>ĐỒ ÁN KINH TẾ CHÍNH TRỊ MÁC – LÊNIN</span>
          </div>

        </div>
      </div>
    </div>
  );
}
