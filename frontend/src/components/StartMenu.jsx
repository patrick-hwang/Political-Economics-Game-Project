import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Maximize, Check, Music } from 'lucide-react';
import { playPageTurnSound } from '../services/soundEffects';
import { playTrack, MUSIC_TRACKS, getMusicVolume, setMusicVolume } from '../services/musicManager';

export default function StartMenu({ onStartGame }) {
  const [selectedGender, setSelectedGender] = useState('male'); // 'male' | 'female'
  const [companyName, setCompanyName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [volume, setVolume] = useState(80);
  const [bgmVolume, setBgmVolume] = useState(getMusicVolume());
  const [scale, setScale] = useState(1);

  // Auto-play / stream Home background music on Start Menu
  useEffect(() => {
    playTrack(MUSIC_TRACKS.HOME);
  }, []);

  // Uniform scale calculation to fit exact 1280x720 16:9 canvas into any viewport
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

  const portraitSrc = selectedGender === 'male' 
    ? '/assets/portraits/ceo_male.jpg' 
    : '/assets/portraits/ceo_female.jpg';

  const ceoName = selectedGender === 'male' ? 'ALEXANDER VANCE' : 'VICTORIA VANCE';
  const ceoRole = selectedGender === 'male' ? 'CHỦ TỊCH SÁNG LẬP • 1914' : 'TỔNG GIÁM ĐỐC ĐIỀU HÀNH • 1914';

  const handleStart = () => {
    playPageTurnSound();
    onStartGame({ gender: selectedGender, companyName });
  };

  const toggleGender = () => {
    setSelectedGender(prev => prev === 'male' ? 'female' : 'male');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // 1914 Royal Seal Diamond Bullet SVG
  const renderSealBullet = () => (
    <svg className="w-3.5 h-3.5 shrink-0 mt-1 filter drop-shadow-[0_1px_1.5px_rgba(46,27,7,0.35)]" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0.75L15.25 8L8 15.25L0.75 8Z" fill="#2b1805" stroke="#1c0f02" strokeWidth="0.5"/>
      <path d="M8 1.6L14.4 8L8 8Z" fill="#e2af32"/>
      <path d="M8 1.6L1.6 8L8 8Z" fill="#f5c74e"/>
      <path d="M8 14.4L1.6 8L8 8Z" fill="#b07d12"/>
      <path d="M8 14.4L14.4 8L8 8Z" fill="#885b08"/>
      <path d="M8 3.5L9.4 6.6L12.5 8L9.4 9.4L8 12.5L6.6 9.4L3.5 8L6.6 6.6Z" fill="#fff1b0" stroke="#5a3b04" strokeWidth="0.5"/>
      <circle cx="8" cy="8" r="1.1" fill="#663e05"/>
      <circle cx="7.7" cy="7.7" r="0.4" fill="#ffffff"/>
    </svg>
  );

  return (
    <div className="w-screen h-screen overflow-hidden desk-bg text-[#2a241e] font-serif flex items-center justify-center p-0 m-0 antialiased select-none">
      
      {/* 16:9 Fixed Game Canvas (1280x720 with uniform GPU scaling) */}
      <main 
        className="game-canvas-1280-720 select-none"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative z-10 w-[1280px] h-[720px] bg-[#120d09] flex flex-row overflow-hidden select-none">
          
          {/* 1914 Panoramic Illustrated Background: Concept 3 Airfield */}
          <div className="absolute inset-0 z-0 select-none pointer-events-none">
            <img 
              src="/assets/menu_background_concept3_airfield.jpg" 
              alt="Đường Băng Thử Nghiệm & Đô Thị Khói Lửa Asteria 1914" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* ======================================================================= */}
          {/* PHÍA BÊN TRÁI (40% = 512px): KHUNG AVATAR NHÂN VẬT CĂN GIỮA             */}
          {/* ======================================================================= */}
          <div className="w-[512px] h-[720px] flex flex-col items-center justify-center p-6 relative z-20">
            
            {/* Mechanical Aviation Frame (Khung Tranh Bánh Răng & Cánh Quạt Quay Tròn) */}
            <div className="relative p-3.5 bg-gradient-to-b from-[#2a1d13] via-[#1a120b] to-[#120c07] rounded-xl border-2 border-[#8c6721] shadow-[0_15px_35px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,225,130,0.3)] select-none">
              
              {/* Corner Rivets */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_1px_1px_#fff]" />

              {/* Top Propeller Engine Mount (Cánh Quạt Quay Tròn 1914) */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
                <div className="w-16 h-3.5 bg-gradient-to-r from-[#422c0d] via-[#d4af37] to-[#422c0d] rounded-t border border-[#2b1a06] shadow-md flex items-center justify-center">
                  <span className="text-[7px] font-mono font-black tracking-widest text-[#241505]">AERO-1914</span>
                </div>
                <div className="w-14 h-14 -mt-2.5 propeller-spin">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_3px_6px_rgba(0,0,0,0.95)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="propBladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#d4af37" />
                        <stop offset="35%" stopColor="#9a7122" />
                        <stop offset="70%" stopColor="#4e320d" />
                        <stop offset="100%" stopColor="#8a5a1a" />
                      </linearGradient>
                      <linearGradient id="propHubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff0aa" />
                        <stop offset="50%" stopColor="#d4af37" />
                        <stop offset="100%" stopColor="#553a10" />
                      </linearGradient>
                    </defs>
                    <g>
                      <path d="M47 50 C44 32 40 18 45 8 C48 2 52 2 55 8 C60 18 56 32 53 50 Z" fill="url(#propBladeGrad)" stroke="#2b1a06" strokeWidth="1.5" />
                      <path d="M49 10 C50 6 51 6 52 10 C53 20 52 35 50 48" stroke="#ffe599" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
                      <path d="M47 50 C44 68 40 82 45 92 C48 98 52 98 55 92 C60 82 56 68 53 50 Z" fill="url(#propBladeGrad)" stroke="#2b1a06" strokeWidth="1.5" />
                      <path d="M51 90 C50 94 49 94 48 90 C47 80 48 65 50 52" stroke="#ffe599" strokeWidth="1" opacity="0.6" strokeLinecap="round" />
                      <circle cx="50" cy="50" r="11" fill="url(#propHubGrad)" stroke="#221504" strokeWidth="2" />
                      <circle cx="50" cy="50" r="4.5" fill="#2d1c07" stroke="#aa7c28" strokeWidth="1" />
                      <circle cx="48.5" cy="48.5" r="1.5" fill="#fff" opacity="0.7" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Top-Right Interlocking Dual Gears (Cặp Bánh Răng Khớp Răng) */}
              <div className="absolute -top-4 -right-4 z-20 pointer-events-none w-14 h-14">
                <div className="w-12 h-12 gear-slow">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(0.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(30.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(60.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(90.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(120.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(150.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(180.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(210.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(240.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(270.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(300.0 50 50)" />
                      <rect x="45.1" y="8.0" width="9.8" height="9" rx="1.5" fill="#b88a28" stroke="#4a3308" strokeWidth="1.2" transform="rotate(330.0 50 50)" />
                      <circle cx="50" cy="50" r="35" fill="#b88a28" stroke="#4a3308" strokeWidth="1.8" />
                      <circle cx="50" cy="50" r="31" fill="#1e1610" stroke="#4a3308" strokeWidth="1.2" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#b88a28" strokeWidth="3.5" strokeLinecap="round" transform="rotate(0.0 50 50)" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#b88a28" strokeWidth="3.5" strokeLinecap="round" transform="rotate(90.0 50 50)" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#b88a28" strokeWidth="3.5" strokeLinecap="round" transform="rotate(180.0 50 50)" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#b88a28" strokeWidth="3.5" strokeLinecap="round" transform="rotate(270.0 50 50)" />
                      <circle cx="50" cy="50" r="11" fill="#b88a28" stroke="#4a3308" strokeWidth="1.8" />
                      <circle cx="50" cy="50" r="5" fill="#dfb542" stroke="#1a1209" strokeWidth="1.2" />
                      <circle cx="48.5" cy="48.5" r="1" fill="#fff" opacity="0.6" />
                    </g>
                  </svg>
                </div>
                <div className="absolute top-7 left-7 w-7 h-7 gear-fast">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(0.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(45.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(90.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(135.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(180.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(225.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(270.0 50 50)" />
                      <rect x="42.6" y="8.0" width="14.7" height="9" rx="1.5" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.2" transform="rotate(315.0 50 50)" />
                      <circle cx="50" cy="50" r="35" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.8" />
                      <circle cx="50" cy="50" r="31" fill="#1a120c" stroke="#3d2d0c" strokeWidth="1.2" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#dfb853" strokeWidth="3.5" strokeLinecap="round" transform="rotate(0.0 50 50)" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#dfb853" strokeWidth="3.5" strokeLinecap="round" transform="rotate(120.0 50 50)" />
                      <line x1="50" y1="20" x2="50" y2="80" stroke="#dfb853" strokeWidth="3.5" strokeLinecap="round" transform="rotate(240.0 50 50)" />
                      <circle cx="50" cy="50" r="11" fill="#dfb853" stroke="#3d2d0c" strokeWidth="1.8" />
                      <circle cx="50" cy="50" r="5" fill="#fff0aa" stroke="#1a1209" strokeWidth="1.2" />
                      <circle cx="48.5" cy="48.5" r="1" fill="#fff" opacity="0.6" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Bottom-Left Industrial Cogwheel */}
              <div className="absolute -bottom-3 -left-3 z-20 pointer-events-none w-9 h-9 gear-medium">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(0.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(36.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(72.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(108.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(144.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(180.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(216.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(252.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(288.0 50 50)" />
                    <rect x="44.1" y="8.0" width="11.8" height="9" rx="1.5" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.2" transform="rotate(324.0 50 50)" />
                    <circle cx="50" cy="50" r="35" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.8" />
                    <circle cx="50" cy="50" r="31" fill="#17100b" stroke="#3a2707" strokeWidth="1.2" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#9e6f21" strokeWidth="3.5" strokeLinecap="round" transform="rotate(0.0 50 50)" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#9e6f21" strokeWidth="3.5" strokeLinecap="round" transform="rotate(72.0 50 50)" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#9e6f21" strokeWidth="3.5" strokeLinecap="round" transform="rotate(144.0 50 50)" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#9e6f21" strokeWidth="3.5" strokeLinecap="round" transform="rotate(216.0 50 50)" />
                    <line x1="50" y1="20" x2="50" y2="80" stroke="#9e6f21" strokeWidth="3.5" strokeLinecap="round" transform="rotate(288.0 50 50)" />
                    <circle cx="50" cy="50" r="11" fill="#9e6f21" stroke="#3a2707" strokeWidth="1.8" />
                    <circle cx="50" cy="50" r="5" fill="#dfb542" stroke="#1a1209" strokeWidth="1.2" />
                    <circle cx="48.5" cy="48.5" r="1" fill="#fff" opacity="0.6" />
                  </g>
                </svg>
              </div>

              {/* Inner Portrait Window */}
              <div className="relative w-[220px] h-[290px] rounded-lg overflow-hidden border border-[#5a3e1b] shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] bg-[#0a0705]">
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
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.85)] border border-[#d4af37]/25 rounded-lg" />
              </div>
            </div>

            {/* Tên & Chức Vụ CEO (Bảng Đồng Khắc Tên Cố Định) */}
            <div className="mt-3 text-center px-4 py-1.5 rounded-lg bg-[#140e09]/85 border border-[#8c6721]/60 shadow-[0_4px_12px_rgba(0,0,0,0.9)] backdrop-blur-[2px]">
              <h3 className="font-display font-black text-lg text-[#faebcd] tracking-wider drop-shadow-md">
                {ceoName}
              </h3>
              <p className="font-display uppercase text-[11px] font-bold text-[#d4af37] tracking-wider mt-0.5">
                {ceoRole}
              </p>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* PHÍA BÊN PHẢI (60% = 768px): LOGO + KHUNG TÊN + 5 NÚT DỌC                 */}
          {/* ======================================================================= */}
          <div className="w-[768px] h-[720px] flex flex-col justify-center items-center p-8 relative z-20">
            
            {/* 1. Logo Game (Phóng To • Ánh Sáng Hào Quang Hoàng Kim & Vệt Quét Kim Loại • Giãn Cách Rộng Rãi) */}
            <div className="relative w-[570px] h-[155px] flex items-center justify-center -mt-3 mb-4 logo-container">
              
              {/* Golden Radial Halo Glow behind the logo */}
              <div className="absolute inset-0 -m-6 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,225,120,0.5)_0%,_rgba(212,175,55,0.25)_40%,_rgba(0,0,0,0)_75%)] filter blur-xl pointer-events-none animate-pulse" />

              {/* Official Logo Image with Multi-tier Specular Drop-shadow */}
              <img 
                src="/assets/logo_wings_of_capital.png" 
                alt="Asteria 1914: Wings of Capital" 
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_14px_30px_rgba(0,0,0,0.98)] drop-shadow-[0_0_22px_rgba(235,190,65,0.45)] drop-shadow-[0_0_6px_rgba(255,245,180,0.7)] select-none pointer-events-none"
              />

              {/* Metallic Light Sweep Flare (Chùm vệt sáng vàng kim quét ngang mặt kim loại) */}
              <div className="logo-shine z-20" />
            </div>

            {/* 2. Khung ghi tên doanh nghiệp */}
            <div className="w-[420px] flex flex-col items-center mb-3">
              <div className="mb-1.5 px-3.5 py-0.5 rounded-full bg-[#160f0a]/90 border border-[#9a7628]/70 shadow-[0_4px_10px_rgba(0,0,0,0.95)] flex items-center justify-center">
                <span className="font-display font-extrabold text-[11px] text-[#faebcd] tracking-[0.25em] uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                  TÊN CHO DOANH NGHIỆP CỦA BẠN
                </span>
              </div>
              
              <div className="relative w-[420px] h-[58px] flex items-center justify-center">
                <img 
                  src="/assets/asset_nameplate_clean.png" 
                  alt="Khung ghi tên doanh nghiệp" 
                  className="absolute inset-0 w-full h-full object-fill filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" 
                />
                <input 
                  type="text" 
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Điền tên doanh nghiệp..."
                  className="relative z-10 w-[300px] text-center bg-transparent text-[#261709] font-serif font-black text-lg focus:outline-none tracking-wider placeholder-[#7a6452] selection:bg-[#261709] selection:text-[#f4ecd8]"
                />
              </div>
            </div>

            {/* 3. 5 Nút xếp theo cột dọc */}
            <div className="w-[420px] flex flex-col space-y-2">
              
              {/* Nút 1: BẮT ĐẦU SỰ NGHIỆP */}
              <button 
                type="button" 
                onClick={handleStart}
                className="relative w-[420px] h-[48px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] hover:brightness-115 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
              >
                <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-90 group-hover:brightness-105 transition-all" />
                <span className="relative z-10 font-serif font-black text-sm text-[#faebcd] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  BẮT ĐẦU SỰ NGHIỆP
                </span>
              </button>

              {/* Nút 2: ĐỔI NHÂN VẬT */}
              <button 
                type="button" 
                onClick={toggleGender}
                className="relative w-[420px] h-[48px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] hover:brightness-115 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
              >
                <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-80 group-hover:brightness-95 transition-all" />
                <span className="relative z-10 font-serif font-black text-sm text-[#faebcd] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  ĐỔI NHÂN VẬT
                </span>
              </button>

              {/* Nút 3: CÀI ĐẶT */}
              <button 
                type="button" 
                onClick={() => setShowSettings(true)}
                className="relative w-[420px] h-[48px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] hover:brightness-115 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
              >
                <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-80 group-hover:brightness-95 transition-all" />
                <span className="relative z-10 font-serif font-black text-sm text-[#faebcd] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  CÀI ĐẶT
                </span>
              </button>

              {/* Nút 4: CREDITS */}
              <button 
                type="button" 
                onClick={() => setShowCredits(true)}
                className="relative w-[420px] h-[48px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] hover:brightness-115 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
              >
                <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-80 group-hover:brightness-95 transition-all" />
                <span className="relative z-10 font-serif font-black text-sm text-[#faebcd] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  CREDITS
                </span>
              </button>

              {/* Nút 5: DISCLAIMER */}
              <button 
                type="button" 
                onClick={() => setShowDisclaimer(true)}
                className="relative w-[420px] h-[48px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)] hover:brightness-115 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
              >
                <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-80 group-hover:brightness-95 transition-all" />
                <span className="relative z-10 font-serif font-black text-sm text-[#faebcd] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                  DISCLAIMER
                </span>
              </button>

            </div>

          </div>

        </div>

        {/* ======================================================================= */}
        {/* MODAL: CÀI ĐẶT (SETTINGS)                                               */}
        {/* ======================================================================= */}
        <AnimatePresence>
          {showSettings && (
            <div 
              className="absolute inset-0 modal-backdrop z-50 flex items-center justify-center p-3 sm:p-5"
              onClick={() => setShowSettings(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl max-w-md w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-5 text-[#2b2118]"
              >
                <div className="text-center pb-2 border-b-2 border-[#b8a690]">
                  <h3 className="font-display font-black text-xl text-[#3d2a1c] tracking-tight uppercase">
                    CÀI ĐẶT HỆ THỐNG
                  </h3>
                </div>

                <div className="space-y-4 text-xs font-display">
                  <div className="flex items-center justify-between p-3 bg-[#ede3d1] rounded-lg border border-[#cbb79f]">
                    <span className="flex items-center gap-2 font-bold text-[#3d2a1c]">
                      <Music className="w-4 h-4 text-[#8c6721]" /> ÂM LƯỢNG NHẠC NỀN
                    </span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={bgmVolume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setBgmVolume(val);
                          setMusicVolume(val);
                        }}
                        className="accent-[#8c6721] w-24 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-[11px] text-[#5c3818] w-7 text-right">
                        {bgmVolume}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#ede3d1] rounded-lg border border-[#cbb79f]">
                    <span className="flex items-center gap-2 font-bold text-[#3d2a1c]">
                      <Volume2 className="w-4 h-4 text-[#8c6721]" /> ÂM LƯỢNG HIỆU ỨNG
                    </span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="accent-[#8c6721] w-24 cursor-pointer"
                      />
                      <span className="font-mono font-bold text-[11px] text-[#5c3818] w-7 text-right">
                        {volume}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#ede3d1] rounded-lg border border-[#cbb79f]">
                    <span className="flex items-center gap-2 font-bold text-[#3d2a1c]">
                      <Maximize className="w-4 h-4 text-[#8c6721]" /> CHẾ ĐỘ TOÀN MÀN HÌNH
                    </span>
                    <button 
                      type="button"
                      onClick={toggleFullscreen}
                      className="px-3 py-1 rounded bg-[#3d2f24] text-[#faebcd] font-bold text-[11px] tracking-wider uppercase hover:bg-[#2b2118] transition-all cursor-pointer"
                    >
                      BẬT / TẮT
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-center">
                  <button 
                    type="button" 
                    onClick={() => setShowSettings(false)}
                    className="relative w-[180px] h-[44px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
                  >
                    <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-90 group-hover:brightness-100 transition-all" />
                    <span className="relative z-10 font-display font-black text-xs text-[#faebcd] tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                      XÁC NHẬN & ĐÓNG
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================================= */}
        {/* MODAL: CREDITS (TRI ÂN ĐỘI NGŨ SẢN XUẤT & BẢN QUYỀN NGHỆ THUẬT)          */}
        {/* ======================================================================= */}
        <AnimatePresence>
          {showCredits && (
            <div 
              className="absolute inset-0 modal-backdrop z-50 flex items-center justify-center p-3 sm:p-5"
              onClick={() => setShowCredits(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl max-w-lg w-full max-h-[630px] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-3 text-[#2b2118] font-serif"
              >
                <div className="text-center pb-2.5 border-b-2 border-[#b8a690] shrink-0">
                  <h3 className="font-display font-black text-xl text-[#3d2a1c] tracking-tight uppercase">
                    ASTERIA 1914: WINGS OF CAPITAL
                  </h3>
                  <p className="font-serif italic font-normal text-sm text-[#7d5828] tracking-wider mt-1">
                    ASTERIA 1914: ĐẾ CHẾ CÁNH BAY
                  </p>
                </div>

                <div className="overflow-y-auto pr-1 space-y-3 text-xs sm:text-sm text-[#4a3b2f] leading-relaxed custom-scrollbar">
                  <p className="font-bold text-[#2a1a08] font-serif text-base text-center">Đồ án Kinh tế Chính trị Mác – Lênin</p>                  
                  
                  {/* Mục 1: Đội ngũ sản xuất đồ án */}
                  <div className="p-3.5 bg-[#f0e7d5] border-2 border-[#c8b49c] rounded-xl text-left shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
                    <p className="font-display font-bold text-sm text-[#3a200e] tracking-[0.12em] uppercase border-b border-[#c8b49c] pb-2 mb-2.5 flex items-center gap-2">
                      {renderSealBullet()}
                      Đội Ngũ Sản Xuất (Nhóm 6, APCS K24, HCMUS):
                    </p>
                    <ul className="space-y-2 text-[#24170d]">
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14.5px] leading-snug">
                          <span className="font-display font-bold text-xs tracking-wider text-[#754316] uppercase mr-1">Context:</span>
                          <span className="font-semibold text-[#24170d]">Lê Văn Vĩ (24125050), Phạm Vân Trang (24125046)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14.5px] leading-snug">
                          <span className="font-display font-bold text-xs tracking-wider text-[#754316] uppercase mr-1">Compilation & Presentation:</span>
                          <span className="font-semibold text-[#24170d]">Nguyễn Minh Tâm (24125042), Nguyễn Văn Lê Bảo (24125053), Trần Trung Hậu (24125055)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14.5px] leading-snug">
                          <span className="font-display font-bold text-xs tracking-wider text-[#754316] uppercase mr-1">Frontend:</span>
                          <span className="font-semibold text-[#24170d]">Hoàng Đức Hưng Phát (24125016)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14.5px] leading-snug">
                          <span className="font-display font-bold text-xs tracking-wider text-[#754316] uppercase mr-1">Backend:</span>
                          <span className="font-semibold text-[#24170d]">Nguyễn Anh Khôi (24125060)</span>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14.5px] leading-snug">
                          <span className="font-display font-bold text-xs tracking-wider text-[#754316] uppercase mr-1">Deploy:</span>
                          <span className="font-semibold text-[#24170d]">Nguyễn Chánh Chương (24125005)</span>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Mục 2: Bản quyền âm nhạc (Music Credits) */}
                  <div className="p-3.5 bg-[#f0e7d5] border-2 border-[#c8b49c] rounded-xl text-left shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
                    <p className="font-display font-bold text-xs sm:text-sm text-[#3a200e] tracking-[0.12em] uppercase border-b border-[#c8b49c] pb-1.5 mb-2 flex items-center gap-2">
                      {renderSealBullet()}
                      Bản Quyền Âm Nhạc (Soundtracks)
                    </p>
                    <ul className="space-y-1.5 text-[#24170d]">
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14px] leading-snug">
                          <span className="font-semibold text-[#24170d]">Wandering</span>
                          <span className="mx-1.5 text-[#8c6721]">—</span>
                          <a 
                            href="http://www.youtube.com/@natkeefe" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8c531b] hover:text-[#b87326] underline font-medium transition-colors"
                          >
                            Net Keefe
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14px] leading-snug">
                          <span className="font-semibold text-[#24170d]">Taking Chances</span>
                          <span className="mx-1.5 text-[#8c6721]">—</span>
                          <a 
                            href="https://thesoundlings.com" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8c531b] hover:text-[#b87326] underline font-medium transition-colors"
                          >
                            The Soundings
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14px] leading-snug">
                          <span className="font-semibold text-[#24170d]">Standoff</span>
                          <span className="mx-1.5 text-[#8c6721]">—</span>
                          <a 
                            href="http://www.youtube.com/@GoldenPalmRecorders" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8c531b] hover:text-[#b87326] underline font-medium transition-colors"
                          >
                            Density & Time
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14px] leading-snug">
                          <span className="font-semibold text-[#24170d]">Floating Lanterns</span>
                          <span className="mx-1.5 text-[#8c6721]">—</span>
                          <a 
                            href="http://www.youtube.com/@theminivandals1840" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8c531b] hover:text-[#b87326] underline font-medium transition-colors"
                          >
                            The Mini Vandals
                          </a>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        {renderSealBullet()}
                        <div className="font-serif text-[14px] leading-snug">
                          <span className="font-semibold text-[#24170d]">Sands of time</span>
                          <span className="mx-1.5 text-[#8c6721]">—</span>
                          <a 
                            href="http://www.youtube.com/@Patrick-Patrikios" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#8c531b] hover:text-[#b87326] underline font-medium transition-colors"
                          >
                            Patrick Patrikios
                          </a>
                        </div>
                      </li>
                    </ul>
                  </div>

                  {/* Mục 3: Tài nguyên đồ họa & Mỹ thuật AI (Visual Assets) */}
                  <div className="p-3.5 bg-[#f0e7d5] border-2 border-[#c8b49c] rounded-xl text-left shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]">
                    <p className="font-display font-bold text-xs sm:text-sm text-[#3a200e] tracking-[0.12em] uppercase border-b border-[#c8b49c] pb-1.5 mb-2 flex items-center gap-2">
                      {renderSealBullet()}
                      Tài Nguyên Mỹ Thuật & Trí Tuệ Nhân Tạo
                    </p>
                    <p className="font-serif text-[13.5px] leading-relaxed text-[#24170d] text-justify">
                      Toàn bộ các tài nguyên đồ họa và hình ảnh mỹ thuật trong trò chơi được tạo bởi mô hình trí tuệ nhân tạo <strong>Imagen 3</strong> thông qua môi trường <strong>Antigravity</strong>, với các câu lệnh định hướng mỹ thuật (prompts) được tinh chỉnh bởi thành viên <strong>Hoàng Đức Hưng Phát</strong>.
                    </p>
                  </div>

                  <p className="italic text-[12px] font-serif text-[#7a6452] text-center pt-0.5">
                    Cảm ơn bạn đã tham gia trải nghiệm và dẫn dắt doanh nghiệp qua các biến động lịch sử!
                  </p>
                </div>

                <div className="pt-2 flex justify-center shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setShowCredits(false)}
                    className="relative w-[180px] h-[44px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
                  >
                    <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-90 group-hover:brightness-100 transition-all" />
                    <span className="relative z-10 font-display font-black text-xs text-[#faebcd] tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                      ĐÓNG
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================================= */}
        {/* MODAL: DISCLAIMER (TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM)                       */}
        {/* ======================================================================= */}
        <AnimatePresence>
          {showDisclaimer && (
            <div 
              className="absolute inset-0 modal-backdrop z-50 flex items-center justify-center p-3 sm:p-5"
              onClick={() => setShowDisclaimer(false)}
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl max-w-lg w-full p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col gap-4 text-[#2b2118] font-serif"
              >
                <div className="text-center pb-2.5 border-b-2 border-[#b8a690] shrink-0">
                  <h3 className="font-display font-black text-xl text-[#3d2a1c] tracking-tight uppercase">
                    TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM
                  </h3>
                  <p className="font-serif italic font-normal text-sm text-[#7d5828] tracking-wider mt-0.5">
                    DISCLAIMER
                  </p>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-[#4a3b2f] leading-relaxed">
                  {/* Khung Tuyên bố miễn trừ trách nhiệm chuẩn phong cách văn bản chính luận */}
                  <div className="p-4 bg-[#f0e7d5] border-2 border-[#c8b49c] rounded-xl text-left shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)] space-y-2.5">
                    <p className="font-display font-bold text-xs sm:text-sm text-[#3a200e] tracking-[0.12em] uppercase border-b border-[#c8b49c] pb-2 mb-2 flex items-center gap-2">
                      {renderSealBullet()}
                      Tính Hư Cấu & Mục Đích Học Thuật
                    </p>
                    
                    <p className="font-serif text-[14px] leading-relaxed text-[#24170d] text-justify">
                      Toàn bộ dữ liệu, tình tiết lịch sử, bối cảnh kinh tế, tổ chức, số liệu tài chính và nhân vật xuất hiện trong trò chơi đều là <strong>sản phẩm hư cấu</strong>, xuất phát từ trí tưởng tượng và sự sáng tạo của đội ngũ biên soạn bối cảnh và nội dung (Context & Content).
                    </p>

                    <p className="font-serif text-[14px] leading-relaxed text-[#24170d] text-justify">
                      Nội dung trò chơi được xây dựng hoàn toàn vì <strong>mục đích nghiên cứu và giáo dục</strong> trong khuôn khổ đồ án môn học Kinh tế Chính trị Mác – Lênin. Mọi sự trùng hợp với nhân vật, cơ quan, doanh nghiệp hoặc sự kiện có thật ngoài đời thực (nếu có) hoàn toàn chỉ mang tính ngẫu nhiên hoặc được dùng làm phương tiện giả định để minh họa cho các quy luật kinh tế chính trị.
                    </p>

                    <p className="font-serif text-[13px] italic text-[#5c4433] pt-1">
                      * Trò chơi được phát hành phi thương mại phục vụ học tập.
                    </p>
                  </div>

                  <p className="italic text-[12px] font-serif text-[#7a6452] text-center pt-1">
                    Ban Biên soạn Đồ án • Asteria 1914
                  </p>
                </div>

                <div className="pt-2 flex justify-center shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setShowDisclaimer(false)}
                    className="relative w-[180px] h-[44px] filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center group"
                  >
                    <img src="/assets/asset_menu_button_clean.png" alt="Button Background" className="absolute inset-0 w-full h-full object-fill filter brightness-90 group-hover:brightness-100 transition-all" />
                    <span className="relative z-10 font-display font-black text-xs text-[#faebcd] tracking-widest uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]">
                      ĐÓNG
                    </span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>

      {/* Letterbox Watermark */}
      <aside className="fixed bottom-1.5 right-2 font-mono text-[9px] text-[#8c6721]/50 tracking-wider pointer-events-none select-none z-50">
        ASTERIA 1914 • TỈ LỆ CỐ ĐỊNH 16:9 (LETTERBOXED)
      </aside>

    </div>
  );
}
