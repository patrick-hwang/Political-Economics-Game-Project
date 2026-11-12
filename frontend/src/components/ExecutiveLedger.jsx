import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  DollarSign, 
  BookOpen, 
  RotateCcw, 
  Award, 
  FileCheck2
} from 'lucide-react';
import { 
  playPageTurnSound, 
  playStampSound, 
  playGavelSound, 
  playGoldChimeSound 
} from '../services/soundEffects';
import AtmosphericVFX from './AtmosphericVFX';

const TIMELINE_ERAS = [
  { id: 1, roman: 'I', year: '1914', label: 'WWI' },
  { id: 2, roman: 'II', year: '1918', label: 'Hậu chiến' },
  { id: 3, roman: 'III', year: '1929', label: 'Đại suy thoái' },
  { id: 4, roman: 'IV', year: '1939', label: 'WWII' },
  { id: 5, roman: 'V', year: '1945', label: 'Phản lực' },
  { id: 6, roman: 'VI', year: '1973', label: 'Cú sốc dầu' },
  { id: 7, roman: 'VII', year: '2000', label: 'Airbus' },
  { id: 8, roman: 'VIII', year: '2008', label: 'Độc quyền' },
];

// Universal 8 Epochs across all 90 branches of the Asteria economic saga
const ERA_METADATA = [
  {
    eraIndex: 0,
    era: "KỶ NGUYÊN I (1914 – 1918)",
    title: "KHAI CHIẾN & CƠ HỘI LỊCH SỬ",
    tag: "KHỞI ĐẦU ASTERIA",
    artSrc: "/assets/events/event_1914.jpg",
    videoSrc: "/assets/videos/event_1914.mp4",
    vfx: "dust",
  },
  {
    eraIndex: 1,
    era: "KỶ NGUYÊN II (1919 – 1928)",
    title: "HẬU CHIẾN & TÁI CẤU TRÚC",
    tag: "TÁI CẤU TRÚC DOANH NGHIỆP",
    artSrc: "/assets/events/event_1914.jpg",
    videoSrc: "/assets/videos/event_1914.mp4",
    vfx: "dust",
  },
  {
    eraIndex: 2,
    era: "KỶ NGUYÊN III (1929 – 1935)",
    title: "CUỘC ĐẠI SUY THOÁI TOÀN CẦU",
    tag: "SUY THOÁI KINH TẾ",
    artSrc: "/assets/events/event_1929.jpg",
    videoSrc: "/assets/videos/event_1929.mp4",
    vfx: "rain",
  },
  {
    eraIndex: 3,
    era: "KỶ NGUYÊN IV (1936 – 1945)",
    title: "THẾ CHIẾN II & HUY ĐỘNG TỔNG LỰC",
    tag: "KINH TẾ CHIẾN TRANH",
    artSrc: "/assets/events/event_1945.jpg",
    videoSrc: "/assets/videos/event_1945.mp4",
    vfx: "sparks",
  },
  {
    eraIndex: 4,
    era: "KỶ NGUYÊN V (1946 – 1969)",
    title: "KỶ NGUYÊN ĐỘNG CƠ PHẢN LỰC",
    tag: "BƯỚC NGOẶT CÔNG NGHỆ",
    artSrc: "/assets/events/event_1945.jpg",
    videoSrc: "/assets/videos/event_1945.mp4",
    vfx: "sparks",
  },
  {
    eraIndex: 5,
    era: "KỶ NGUYÊN VI (1970 – 1981)",
    title: "CÚ SỐC DẦU MỎ & CHI PHÍ",
    tag: "CÚ SỐC CHI PHÍ",
    artSrc: "/assets/events/event_1929.jpg",
    videoSrc: "/assets/videos/event_1929.mp4",
    vfx: "rain",
  },
  {
    eraIndex: 6,
    era: "KỶ NGUYÊN VII (1997 – 2008)",
    title: "SỨC ÉP TOÀN CẦU TỪ AIRBUS",
    tag: "SỨC ÉP TOÀN CẦU",
    artSrc: "/assets/events/event_1945.jpg",
    videoSrc: "/assets/videos/event_1945.mp4",
    vfx: "sparks",
  },
  {
    eraIndex: 7,
    era: "KỶ NGUYÊN VIII (2008 – 2011)",
    title: "BÃO TÀI CHÍNH TOÀN CẦU 2008",
    tag: "BÃO TÀI CHÍNH",
    artSrc: "/assets/events/event_1929.jpg",
    videoSrc: "/assets/videos/event_1929.mp4",
    vfx: "rain",
  },
];

export default function ExecutiveLedger({
  currentNodeId = 1,
  currentContext = null,
  contextIndex = 0,
  totalContexts = 0,
  onNextContext,
  question = null,
  choices = [],
  onSelectChoice,
  outcome = null,
  budget = 1000000,
  gender = 'male',
  historyLength = 0,
  onRestart
}) {
  // Method 1: Dynamically resolve historical era from decision history length
  // 0 choices -> Era 0 (1914); 1 choice -> Era 1 (1918); ... 7+ choices -> Era 7 (2008-2011)
  const eraIndex = Math.min(7, Math.max(0, historyLength));
  const chapter = ERA_METADATA[eraIndex];

  const activeNodeId = Number(currentContext ? currentContext.node : (question ? question.node : currentNodeId));
  const isArrestNode = Boolean(currentContext && Number(currentContext.node) === 381);

  // Trigger dramatic sound effects on climax nodes
  useEffect(() => {
    if (isArrestNode) {
      playGavelSound();
    }
  }, [isArrestNode]);

  useEffect(() => {
    if (outcome && outcome.type === 'win') {
      playGoldChimeSound();
    }
  }, [outcome]);

  // Determine atmospheric VFX particle type based on scene
  const getAtmosphereType = () => {
    if (outcome) {
      return outcome.type === 'win' ? 'gold' : 'dust';
    }
    if (currentContext) {
      return chapter.vfx;
    }
    return 'dust'; // Executive office ambience
  };

  // Determine artwork to show on Left Page
  const getLeftPageArt = () => {
    // If viewing outcome
    if (outcome) {
      return {
        src: gender === 'female' ? '/assets/portraits/ceo_female.jpg' : '/assets/portraits/ceo_male.jpg',
        videoSrc: outcome.type === 'win' ? '/assets/videos/victory_382.mp4' : null,
        title: "KẾT CỤC TOÀN CẢNH DI SẢN ASTERIA",
        caption: `BẢN ĐÚC KẾT LỊCH SỬ • 1914 – ${chapter.era.match(/\d{4}/g)?.[1] || '2011'}`,
        tag: outcome.type === 'win' ? 'ĐẾ CHẾ ĐỘC QUYỀN' : 'KẾT THÚC HÀNH TRÌNH'
      };
    }

    // If viewing a context node
    if (currentContext) {
      const cNode = Number(currentContext.node);
      if (cNode === 381) {
        return {
          src: gender === 'female' ? '/assets/portraits/ceo_female.jpg' : '/assets/portraits/ceo_male.jpg',
          videoSrc: gender === 'female' ? '/assets/videos/arrest_female_381.mp4' : '/assets/videos/arrest_male_381.mp4',
          title: "SẮC LỆNH BẮT GIỮ CHỐNG ĐỘC QUYỀN",
          caption: "BẢN GHI SỐ 381 • CHÍNH PHỦ ASTERIA",
          tag: "KHỦNG HOẢNG PHÁP LÝ",
          isStampAlert: true
        };
      }
      return {
        src: chapter.artSrc,
        videoSrc: chapter.videoSrc,
        title: chapter.title,
        caption: `BẢN KHẮC LỊCH SỬ • ${chapter.era.split('(')[1]?.replace(')', '') || 'ASTERIA'}`,
        tag: chapter.tag
      };
    }

    // Default when at Question Node: Show CEO Character Portrait
    return {
      src: gender === 'female' ? '/assets/portraits/ceo_female.jpg' : '/assets/portraits/ceo_male.jpg',
      videoSrc: null,
      title: gender === 'female' ? "TỔNG GIÁM ĐỐC VICTORIA VANCE" : "CHỦ TỊCH ALEXANDER VANCE",
      caption: `ASTERIA AVIATION CORP • BẢN GHI #${question?.node || currentNodeId}`,
      tag: "QUYẾT ĐỊNH ĐIỀU HÀNH"
    };
  };

  const leftArt = getLeftPageArt();

  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

  // Drop cap extraction for narrative text with strict Unicode NFC normalization
  const formatStoryWithDropCap = (text = '') => {
    if (!text || text.length === 0) return null;
    const normalized = String(text).normalize('NFC').trim();
    const firstLetter = normalized.charAt(0);
    const rest = normalized.slice(1);
    return (
      <p className="font-serif text-[#2a241e] text-[17px] sm:text-[18px] leading-[1.8] text-justify tracking-normal">
        <span className="float-left text-5xl sm:text-6xl font-serif font-black text-[#5c3818] mr-2.5 -mt-1 leading-none select-none">
          {firstLetter}
        </span>
        {rest}
      </p>
    );
  };

  const handleNext = () => {
    playPageTurnSound();
    onNextContext();
  };

  const handleChoice = (c) => {
    playStampSound();
    onSelectChoice(c);
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#0a0c10] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none font-serif">
      
      {/* Dark Oak Desk Surface with Atmospheric Vignette */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1f1712]/70 via-[#0c0e12] to-[#050608] pointer-events-none" />

      {/* ========================================================================= */}
      {/* THE OPEN BOOK (Cuốn Sổ Cái Biên Niên Sử Asteria - 70% Sir Brante Style)   */}
      {/* ========================================================================= */}
      <motion.div 
        animate={isArrestNode ? { x: [-10, 10, -7, 7, -4, 4, 0], y: [-3, 3, -2, 2, 0] } : { x: 0, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="relative z-10 w-full max-w-6xl h-full max-h-[900px] aspect-[16/10] bg-[#1a1512] rounded-xl p-3 sm:p-5 shadow-[0_30px_80px_rgba(0,0,0,0.98)] border-4 border-[#3d2a1c] flex flex-col justify-between"
      >
        
        {/* Leather Ledger Exterior Frame Header with Timeline */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-1.5 text-[11px] font-mono text-[#a88d74] border-b border-[#3d2a1c] mb-2 gap-2">
          
          {/* Title & Tome Name */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="tracking-widest uppercase font-bold text-[#c4aa92]">SỔ CÁI TẬP ĐOÀN ASTERIA</span>
          </div>

          {/* Eras Timeline Ribbon (Bold Roman Numerals) */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full py-0.5">
            {TIMELINE_ERAS.map((era, idx) => {
              const isActive = idx === eraIndex;
              const isPast = idx < eraIndex;
              return (
                <div
                  key={era.id}
                  title={`Kỷ nguyên ${era.roman} • Năm ${era.year} (${era.label})`}
                  className={`px-2 sm:px-2.5 py-0.5 rounded font-serif font-black text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center min-w-[26px] sm:min-w-[30px] cursor-help ${
                    isActive
                      ? 'bg-[#d4af37] text-black shadow-[2px_2px_0px_#000] scale-105 border border-black'
                      : isPast
                      ? 'bg-[#291e17] text-[#c4aa92] border border-[#4a3424]'
                      : 'text-[#695443] border border-transparent'
                  }`}
                >
                  <span>{era.roman}</span>
                </div>
              );
            })}
          </div>

          {/* Budget & Close Button */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-[#d4af37] font-bold">
              <DollarSign className="w-3.5 h-3.5" />
              <span>{formattedBudget}</span>
            </div>
            <button
              onClick={onRestart}
              className="text-[#8c745f] hover:text-[#d4af37] flex items-center gap-1 cursor-pointer transition-colors"
              title="Quay lại trang bìa"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Gấp sổ lại</span>
            </button>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* THE TWO OPEN PARCHMENT PAGES                                              */}
        {/* ========================================================================= */}
        <div className="relative flex-1 rounded bg-[#f7f2e7] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-[#d6c7b2]">
          
          {/* Subtle Page Center Crease / Spine Shadow */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/15 via-black/25 to-black/15 pointer-events-none z-30 hidden md:block" />

          {/* ===================================================================== */}
          {/* LEFT PAGE: ENGRAVING / GRAPHIC NOVEL ARTWORK                          */}
          {/* ===================================================================== */}
          <div className="relative bg-[#f4ecd8] p-4 sm:p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#d4c3ab]">
            
            {/* Top Ornamental Header on Left Page */}
            <div className="flex items-center justify-between text-[11px] font-mono text-[#7a6452] border-b border-[#d8c9b6] pb-2">
              <span className="tracking-widest uppercase font-bold">{leftArt.tag}</span>
              <span className="text-[#a48a73]">HÌNH ẢNH BIÊN NIÊN SỬ</span>
            </div>

            {/* Illustration Frame (Engraved Plate with Subtle Bevel) */}
            <div className="relative my-auto w-full aspect-[4/3] max-h-[360px] rounded bg-[#e8ded0] p-2 border-2 border-[#b8a690] shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={(leftArt.videoSrc || leftArt.src) + activeNodeId + (outcome ? '_outcome' : '')}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="relative w-full h-full rounded overflow-hidden bg-black"
                >
                  {/* Video or Subtle Cinematic Ken Burns Pan & Zoom */}
                  {leftArt.videoSrc ? (
                    <video
                      key={leftArt.videoSrc}
                      src={leftArt.videoSrc}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover object-center filter contrast-[1.03]"
                    />
                  ) : (
                    <motion.img
                      src={leftArt.src}
                      alt={leftArt.title}
                      initial={{ scale: 1, x: 0, y: 0 }}
                      animate={{ 
                        scale: [1, 1.05, 1.02],
                        x: [0, -6, 2],
                        y: [0, 3, -2]
                      }}
                      transition={{ 
                        duration: 18, 
                        repeat: Infinity, 
                        repeatType: "reverse", 
                        ease: "easeInOut" 
                      }}
                      className="w-full h-full object-cover object-center filter contrast-[1.03]"
                    />
                  )}

                  {/* Dynamic Atmospheric Canvas VFX (Rain / Sparks / Gold / Dust) */}
                  {!leftArt.videoSrc && <AtmosphericVFX type={getAtmosphereType()} />}

                  {/* Dramatic Arrest Stamp Overlay on Node 381 */}
                  {leftArt.isStampAlert && (
                    <motion.div 
                      initial={{ scale: 3.8, opacity: 0, rotate: -25, y: -50 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12, y: 0 }}
                      transition={{ type: "spring", damping: 11, stiffness: 240, delay: 0.08 }}
                      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                      <div className="px-6 py-3 border-4 border-rose-700 bg-rose-950/90 text-rose-200 font-mono font-black text-xl sm:text-2xl tracking-widest shadow-[0_0_35px_rgba(225,29,72,0.7)] backdrop-blur-sm border-dashed">
                        CHÍNH PHỦ BẮT GIỮ
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Caption & Engraved Plate */}
            <div className="text-center pt-2 border-t border-[#d8c9b6]">
              <h4 className="font-serif font-black text-sm sm:text-base text-[#3d2f24] tracking-wide">
                {leftArt.title}
              </h4>
              <p className="font-mono text-[11px] text-[#7a6452] mt-0.5 tracking-wider">
                {leftArt.caption}
              </p>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT PAGE: CHRONICLE, SẮC LỆNH & DECISIONS                           */}
          {/* ===================================================================== */}
          <div className="relative bg-[#f9f5ed] p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            
            {/* Top Chapter & Node Header */}
            <div className="border-b-2 border-[#3d2f24] pb-2 sm:pb-3">
              <div className="flex items-center justify-between text-[11px] font-mono text-[#826b58] uppercase tracking-wider mb-1">
                <span>{chapter.era}</span>
                <span className="font-bold text-[#3d2f24]">BẢN GHI #{activeNodeId}</span>
              </div>
              <h2 className="font-serif font-black text-xl sm:text-2xl text-[#2b2118] tracking-tight">
                {chapter.title}
              </h2>
            </div>

            {/* Animated Parchment Flip Container for Right Page Contents */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeNodeId + (currentContext ? `_ctx_${contextIndex}` : '_q')}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col justify-between"
              >

                {/* 1. NARRATIVE DISPATCH BEAT (WHEN AT A CONTEXT NODE) */}
                {currentContext && (
                  <div className="my-auto py-3 space-y-4">
                    {/* Full Story with Drop Cap */}
                    {formatStoryWithDropCap(currentContext.content)}

                    {/* Financial Crisis / Opportunity Stamp if Revenue exists */}
                    {currentContext.revenue && currentContext.revenue.trim() !== "" && (
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 bg-[#ebe2cf] border-2 border-[#b59e83] rounded flex items-center justify-between font-mono text-xs shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-[#4a392b] font-bold">
                          <FileCheck2 className="w-4 h-4 text-[#8a5d3b]" />
                          <span>GHI NHẬN BIẾN ĐỘNG SỔ CÁI:</span>
                        </div>
                        <div className={`font-black text-sm px-2.5 py-0.5 rounded ${
                          currentContext.revenue.includes('-')
                            ? 'bg-rose-900/15 text-rose-950 border border-rose-800/40'
                            : 'bg-emerald-900/15 text-emerald-950 border border-emerald-800/40'
                        }`}>
                          {currentContext.revenue}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* 2. STRATEGIC QUESTION & CHOICES (WHEN AT A QUESTION NODE) */}
                {!currentContext && question && !outcome && (
                  <div className="my-auto py-2 space-y-3 sm:space-y-4">
                    {/* Question */}
                    <div className="bg-[#ede4d3] border-l-4 border-[#5c3818] p-3 rounded-r shadow-inner">
                      <span className="text-[10px] font-mono font-bold text-[#7a5534] uppercase tracking-wider block mb-1">
                        CÂU HỎI CHIẾN LƯỢC:
                      </span>
                      <h3 className="font-serif font-bold text-base sm:text-lg text-[#261d15] leading-snug">
                        {question.content}
                      </h3>
                    </div>

                    {/* Choices (Stamped Decision Seals) */}
                    <div className="space-y-2.5">
                      {choices.map((choice, idx) => {
                        const isFirst = idx === 0;
                        const rev = choice.revenue || (choice.revenue_million ? `+$${choice.revenue_million}M` : null);

                        return (
                          <motion.button
                            key={choice.node}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={() => handleChoice(choice)}
                            className={`w-full text-left p-3 sm:p-3.5 rounded border-2 transition-all cursor-pointer shadow-[3px_3px_0px_#2b2118] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
                              isFirst
                                ? 'bg-[#e7dfce] hover:bg-[#ded4c0] border-[#3d2f24]'
                                : 'bg-[#ebdcd5] hover:bg-[#e2cdc4] border-[#4a2e2b]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span className={`w-5 h-5 rounded flex items-center justify-center font-mono font-black text-xs shrink-0 mt-0.5 border ${
                                  isFirst
                                    ? 'bg-emerald-800 text-white border-black'
                                    : 'bg-rose-900 text-white border-black'
                                }`}>
                                  {isFirst ? 'A' : 'B'}
                                </span>
                                <div className="font-serif font-bold text-sm text-[#1f1710] leading-snug">
                                  {choice.content}
                                </div>
                              </div>

                              {rev && (
                                <span className="shrink-0 font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#3d2f24] text-[#f7f2e7]">
                                  {rev}
                                </span>
                              )}
                            </div>

                            {/* Subtext Preview of Benefit / Drawback */}
                            {choice.benefits && (
                              <div className="mt-1.5 text-xs font-sans text-[#4a3b2f] pl-7 line-clamp-2">
                                • <em>Lợi ích:</em> {choice.benefits}
                              </div>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 3. TERMINAL OUTCOME BEAT (WHEN GAME CONCLUDES) */}
                {!currentContext && outcome && (
                  <div className="my-auto py-3 space-y-4 text-center">
                    <div className="inline-flex p-3.5 rounded-full bg-[#3d2f24] text-[#d4af37] shadow-xl mb-1 gold-border-shimmer">
                      <Award className="w-9 h-9 text-[#d4af37]" />
                    </div>

                    <h3 className="font-serif font-black text-xl sm:text-2xl text-[#2b2118] tracking-tight">
                      <span className="gold-shimmer">
                        {outcome.type === 'win' ? "CHIẾN LƯỢC TOÀN THẮNG: ĐỘC QUYỀN ASTERIA" : "BẢN ÁN SUY THOÁI & THẤT BẠI"}
                      </span>
                    </h3>

                    <div className="bg-[#ede4d3] p-4 rounded border border-[#bfae97] text-left text-sm text-[#261d15] leading-relaxed shadow-inner">
                      {outcome.content}
                    </div>

                    <div className="bg-[#241a12] text-[#f7f2e7] p-3.5 rounded border border-[#d4af37]/40 text-xs font-mono flex items-center justify-between shadow-md">
                      <span className="text-[#c4aa92]">NGÂN SÁCH TÍCH LŨY CUỐI CÙNG:</span>
                      <span className="font-black text-base sm:text-lg gold-shimmer">{formattedBudget}</span>
                    </div>

                    <button
                      type="button"
                      onClick={onRestart}
                      className="py-3 px-6 rounded bg-[#5c3818] hover:bg-[#472a12] text-[#f7f2e7] font-serif font-bold text-sm shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>MỞ LẠI SỔ CÁI TỪ NĂM 1914</span>
                    </button>
                  </div>
                )}

                {/* Bottom Page Navigation Button (For Context Nodes) */}
                {currentContext && (
                  <div className="pt-2 sm:pt-3 border-t border-[#d8c9b6] flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#7a6452]">
                      Trang biên niên {contextIndex + 1}/{totalContexts || 1}
                    </span>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleNext}
                      className="py-2.5 px-6 bg-[#3d2f24] hover:bg-[#2b2118] text-[#f7f2e7] font-mono font-bold text-xs sm:text-sm rounded border border-black shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>
                        {contextIndex >= totalContexts - 1 
                          ? (outcome ? "XEM KẾT CỤC TOÀN CẢNH" : "LẬT SANG TRANG QUYẾT ĐỊNH") 
                          : "LẬT SANG TRANG TIẾP THEO"}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

          </div>

        </div>

      </motion.div>

    </div>
  );
}
