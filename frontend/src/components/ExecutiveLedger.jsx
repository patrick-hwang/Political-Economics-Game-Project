import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  DollarSign, 
  BookOpen, 
  RotateCcw, 
  Award, 
  FileCheck2,
  Loader2
} from 'lucide-react';
import { 
  playPageTurnSound, 
  playStampSound, 
  playGavelSound, 
  playGoldChimeSound 
} from '../services/soundEffects';
import AtmosphericVFX from './AtmosphericVFX';
import { getLocalGraph, sendChatMessage, getChatHistory, explainDecision } from '../services/api';

function SealBullet() {
  return (
    <svg className="seal-bullet" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
}

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
  session = null,
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
  const [graph, setGraph] = useState(null);
  const [showSecretaryModal, setShowSecretaryModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Chào tổng tài, hôm nay bạn muốn thảo luận với tôi về chủ đề gì?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatStreamRef = useRef(null);

  // Nạp toàn bộ dữ liệu đồ thị câu hỏi để duyệt biên bản
  useEffect(() => {
    getLocalGraph().then(g => setGraph(g)).catch(err => console.error("Error loading graph:", err));
  }, []);

  useEffect(() => {
    if (showSecretaryModal && !graph) {
      getLocalGraph().then(g => setGraph(g)).catch(err => console.error("Error loading graph:", err));
    }
  }, [showSecretaryModal, graph]);

  // Tải lịch sử chat khi mở Modal Cố vấn
  useEffect(() => {
    if (showAdvisorModal) {
      const activeSession = session || { session_id: 'local_session', isBackend: false };
      getChatHistory(activeSession).then(res => {
        if (res && res.messages && res.messages.length > 0) {
          setChatMessages(res.messages);
        }
      }).catch(err => console.error("Failed to load chat history:", err));
    }
  }, [showAdvisorModal, session]);

  // Đóng modal khi ấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSecretaryModal(false);
        setShowAdvisorModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Tự động cuộn xuống đáy khi có tin nhắn mới
  useEffect(() => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTop = chatStreamRef.current.scrollHeight;
    }
  }, [chatMessages, isChatLoading]);

  // Gửi tin nhắn đàm thoại tới Cố vấn Friedrich
  const handleSendChat = async (promptOverride) => {
    const text = (promptOverride || chatInput).trim();
    if (!text || isChatLoading) return;

    setChatInput('');
    const newMsgs = [...chatMessages, { role: 'user', content: text }];
    setChatMessages(newMsgs);
    setIsChatLoading(true);

    try {
      const activeSession = session || { session_id: 'local_session', isBackend: false };
      const res = await sendChatMessage(activeSession, text);
      if (res && res.messages) {
        setChatMessages(res.messages);
      }
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Giải thích kết cục / quyết định bằng AI (kết nối endpoint explain)
  const handleExplainOutcome = async () => {
    setShowAdvisorModal(true);
    setIsChatLoading(true);
    try {
      const activeSession = session || { session_id: 'local_session', isBackend: false };
      const res = await explainDecision(activeSession);
      if (res && res.messages) {
        setChatMessages(res.messages);
      }
    } catch (err) {
      console.error("Explain outcome error:", err);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Hàm kiểm tra trường dữ liệu hợp lệ (ẩn nếu rỗng hoặc 'Không')
  const isValidValue = (val) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    const lower = s.toLowerCase();
    if (!s || s === "" || lower === "không" || lower === "khong" || lower === "không có" || lower === "khong co" || lower === "none" || lower === "n/a") {
      return false;
    }
    return true;
  };

  // Duyệt qua lịch sử các node đã trải qua từ session.history và context nodes
  const getChronologicalEvents = () => {
    if (!graph || graph.size === 0) return [];

    const history = session?.history || [];
    const events = [];
    let currId = 1;
    const visited = new Set();
    let historyChoiceIdx = 0;

    while (currId && !visited.has(currId)) {
      visited.add(currId);
      const node = graph.get(currId);
      if (!node) break;

      if (node.type === "context") {
        if (node.content && node.content.trim().toLowerCase() !== "start") {
          events.push(node);
        }
        if (currentContext && Number(node.node) === Number(currentContext.node)) {
          break;
        }
        const nextList = node["next node"] || [];
        if (nextList.length === 0) break;
        currId = Number(nextList[0]);
        continue;
      }

      if (node.type === "question") {
        const choices = (node["next node"] || []).map(Number);
        let chosenId = null;
        if (historyChoiceIdx < history.length) {
          const nextHist = Number(history[historyChoiceIdx]);
          if (choices.includes(nextHist)) {
            chosenId = nextHist;
            historyChoiceIdx++;
          }
        }

        if (chosenId) {
          events.push(node);
          const choiceNode = graph.get(chosenId);
          if (choiceNode) {
            events.push(choiceNode);
            const choiceNext = choiceNode["next node"] || [];
            if (choiceNext.length > 0) {
              currId = Number(choiceNext[0]);
              continue;
            }
          }
          break;
        } else {
          if (!currentContext && question && Number(question.node) === Number(node.node)) {
            events.push(node);
          }
          break;
        }
      }

      if (node.type === "win" || node.type === "lose") {
        events.push(node);
        break;
      }

      break;
    }

    return events;
  };

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

            {/* 2 Nút: Biên Bản & Cố Vấn Friedrich */}
            <div className="my-2.5 flex items-center gap-2.5">
              <button 
                type="button"
                onClick={() => setShowSecretaryModal(true)}
                className="flex-1 py-2 px-3 rounded bg-[#e8ded0] hover:bg-[#ded1be] text-[#3d2f24] border-2 border-[#5c4636] font-serif transition-all shadow-[2px_2px_0px_#3d2f24] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                title="Xem lại toàn bộ các sự kiện và quyết định đã trải qua"
              >
                <img 
                  src="/assets/icons/vintage_ledger_icon.jpg" 
                  alt="Icon Sổ Cái" 
                  className="w-5 h-5 rounded border border-[#5c4636] object-cover shrink-0 shadow-sm" 
                />
                <span className="font-serif font-black tracking-wide text-sm text-[#2b1f17]">Biên bản</span>
              </button>

              <button 
                type="button"
                onClick={() => setShowAdvisorModal(true)}
                className="flex-1 py-2 px-3 rounded bg-[#3d2f24] hover:bg-[#2c2118] text-[#f4ecd8] border-2 border-[#1f1712] font-serif transition-all shadow-[2px_2px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center justify-center gap-2"
                title="Mở Cố Vấn Friedrich để đàm đạo chiến lược và lý luận KTCT"
              >
                <img 
                  src="/assets/icons/friedrich_avatar.jpg" 
                  alt="Cố Vấn Friedrich" 
                  className="w-5 h-5 rounded-full border border-[#d4af37] object-cover shrink-0 shadow-sm" 
                />
                <span className="font-serif font-black tracking-wide text-sm text-[#f4ecd8]">Cố vấn Friedrich</span>
              </button>
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

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleExplainOutcome}
                        className="py-3 px-5 rounded bg-[#3d2f24] hover:bg-[#2b2118] text-[#f4ecd8] border-2 border-[#8b6b47] font-serif font-bold text-sm shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                        title="Nhờ Cố vấn Friedrich giải thích chi tiết nguyên nhân dẫn tới kết cục theo lý luận kinh tế chính trị"
                      >
                        <img 
                          src="/assets/icons/friedrich_avatar.jpg" 
                          alt="Cố Vấn Friedrich" 
                          className="w-5 h-5 rounded-full border border-[#d4af37] object-cover shrink-0" 
                        />
                        <span>Cố vấn giải thích kết cục</span>
                      </button>

                      <button
                        type="button"
                        onClick={onRestart}
                        className="py-3 px-5 rounded bg-[#5c3818] hover:bg-[#472a12] text-[#f7f2e7] font-serif font-bold text-sm shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>MỞ LẠI SỔ CÁI TỪ NĂM 1914</span>
                      </button>
                    </div>
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

      {/* ========================================================================= */}
      {/* MODAL 1: BẢN GHI THƯ KÝ — BIÊN BẢN DOANH NGHIỆP                           */}
      {/* ========================================================================= */}
      {showSecretaryModal && (
        <div 
          onClick={() => setShowSecretaryModal(false)}
          className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-3 sm:p-5"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl max-w-3xl w-full max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-[#2a241e]"
          >
            {/* Header Biên Bản Doanh Nghiệp (Không có dấu 'X', có icon sổ cái) */}
            <div className="bg-[#ebdcc0] px-5 py-3 border-b-2 border-[#b8a690] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/icons/vintage_ledger_icon.jpg" 
                  alt="Icon Sổ Cái" 
                  className="w-8 h-8 rounded border border-[#8b6b47] shadow object-cover shrink-0" 
                />
                <h3 className="font-title font-black text-[21px] text-[#261d15] tracking-wide">
                  BIÊN BẢN DOANH NGHIỆP
                </h3>
              </div>
            </div>

            {/* Danh Sách Các Sự Kiện */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {(() => {
                const chronologicalEvents = getChronologicalEvents();
                if (chronologicalEvents.length === 0) {
                  return (
                    <div className="text-center py-8 text-[#7a6452] font-serif italic text-sm">
                      Chưa có sự kiện nào được ghi nhận trong sổ cái Asteria.
                    </div>
                  );
                }

                return chronologicalEvents.map((evt, idx) => {
                  const rev = evt.revenue || (evt.revenue_million ? `+$${evt.revenue_million} million` : null);
                  const isRevValid = isValidValue(rev);
                  const isNegative = isRevValid && String(rev).includes('-');

                  return (
                    <div key={`${evt.node}_${idx}`} className="flex gap-4 border-b border-[#dfd2be] pb-4">
                      <div className="event-title font-title font-black text-[21px] text-[#3e220f] w-28 sm:w-32 shrink-0 tracking-wide pt-0.5 select-none whitespace-nowrap">
                        Sự kiện {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2.5 text-[18px] text-[#2a241e] font-serif leading-relaxed">
                        {isValidValue(evt.content) && (
                          <div className="flex items-start gap-2.5">
                            <SealBullet />
                            <div className="flex-1">
                              <span className="font-bold text-[#5c3818]">Nội dung:</span> {evt.content}
                            </div>
                          </div>
                        )}

                        {isValidValue(evt.benefits) && (
                          <div className="flex items-start gap-2.5">
                            <SealBullet />
                            <div className="flex-1">
                              <span className="font-bold text-[#5c3818]">Lợi ích:</span> {evt.benefits}
                            </div>
                          </div>
                        )}

                        {isValidValue(evt['potential drawback']) && (
                          <div className="flex items-start gap-2.5">
                            <SealBullet />
                            <div className="flex-1">
                              <span className="font-bold text-[#5c3818]">Tác hại:</span> {evt['potential drawback']}
                            </div>
                          </div>
                        )}

                        {isValidValue(evt.impact) && (
                          <div className="flex items-start gap-2.5">
                            <SealBullet />
                            <div className="flex-1">
                              <span className="font-bold text-[#5c3818]">Tác động:</span> {evt.impact}
                            </div>
                          </div>
                        )}

                        {isRevValid && (
                          <div className="flex items-start gap-2.5">
                            <SealBullet />
                            <div className="flex-1">
                              <span className="font-bold text-[#5c3818]">Thu nhập:</span>{" "}
                              <span className={`font-serif font-bold text-[19px] ${isNegative ? 'text-rose-900' : 'text-emerald-800'}`}>
                                {rev}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer Biên Bản (Nút Đóng sổ bằng da) */}
            <div className="bg-[#ede4d3] px-5 py-3 border-t border-[#d4c3ab] flex items-center justify-end">
              <button 
                type="button"
                onClick={() => setShowSecretaryModal(false)} 
                className="relative px-7 py-2.5 rounded-lg text-[#faebcd] font-serif font-black text-sm tracking-wider uppercase shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#8b6b47] hover:brightness-110 active:scale-95 transition-all cursor-pointer overflow-hidden flex items-center justify-center"
                style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-sm tracking-wide">
                  Đóng sổ
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CỐ VẤN FRIEDRICH (GIAO DIỆN THUẦN CHAT TỐI GIẢN)                 */}
      {/* ========================================================================= */}
      {showAdvisorModal && (
        <div 
          onClick={() => setShowAdvisorModal(false)}
          className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-3 sm:p-5"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl max-w-3xl w-full max-h-[85vh] shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#2a241e]"
          >
            {/* Header Cố Vấn (Tối giản: Avatar Friedrich & Tiêu đề CỐ VẤN FRIEDRICH, Không có dấu X) */}
            <div className="bg-[#ebdcc0] px-5 py-3 border-b-2 border-[#b8a690] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/icons/friedrich_avatar.jpg" 
                  alt="Cố Vấn Friedrich" 
                  className="w-8 h-8 rounded-full border border-[#8b6b47] shadow object-cover shrink-0" 
                />
                <h3 className="font-title font-black text-[21px] text-[#261d15] tracking-wide">
                  CỐ VẤN FRIEDRICH
                </h3>
              </div>
            </div>

            {/* Vùng Nội Dung Thuần Chat */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#f9f5ed]">
              <div ref={chatStreamRef} className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={i} className="flex items-start justify-end gap-2.5">
                        <div className="bg-[#3d2f24] text-[#f7f2e7] p-3.5 rounded-lg rounded-tr-none text-[18px] font-serif max-w-[85%] leading-relaxed shadow-sm whitespace-pre-wrap break-words">
                          {msg.content}
                        </div>
                        <img 
                          src={gender === 'female' ? '/assets/portraits/ceo_female.jpg' : '/assets/portraits/ceo_male.jpg'}
                          alt={gender === 'female' ? 'CEO Victoria Vance' : 'CEO Alexander Vance'}
                          className="w-8 h-8 rounded-full border border-[#8b6b47] object-cover shrink-0 shadow-sm mt-0.5" 
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex items-start gap-2.5">
                      <img 
                        src="/assets/icons/friedrich_avatar.jpg" 
                        alt="Friedrich" 
                        className="w-8 h-8 rounded-full border border-[#d4af37] object-cover shrink-0 shadow-sm mt-0.5" 
                      />
                      <div 
                        className="bg-[#ebdcc0] p-3.5 rounded-lg rounded-tl-none text-[18px] text-[#2b2118] leading-relaxed max-w-[85%] border border-[#cfbfae] font-serif shadow-sm whitespace-pre-wrap break-words"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                    </div>
                  );
                })}

                {isChatLoading && (
                  <div className="flex items-start gap-2.5">
                    <img 
                      src="/assets/icons/friedrich_avatar.jpg" 
                      alt="Friedrich" 
                      className="w-8 h-8 rounded-full border border-[#d4af37] object-cover shrink-0 shadow-sm mt-0.5 animate-pulse" 
                    />
                    <div className="bg-[#ebdcc0] p-3.5 rounded-lg rounded-tl-none text-[18px] text-[#5c3818] leading-relaxed border border-[#cfbfae] font-serif italic shadow-sm flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#8b6b47]" />
                      <span>Cố vấn Friedrich đang suy ngẫm lý luận kinh tế chính trị...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Gợi ý câu hỏi nhanh */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button 
                  type="button"
                  disabled={isChatLoading}
                  onClick={() => handleSendChat("Phân tích tình hình hiện tại dựa trên các sự kiện gần đây")} 
                  className="px-3.5 py-2 bg-[#ebdcc0] hover:bg-[#dfd0b4] disabled:opacity-60 disabled:cursor-not-allowed border border-[#b8a690] rounded text-[#3d2a1c] font-serif text-[16px] transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <span>💬 Phân tích tình hình hiện tại dựa trên các sự kiện gần đây</span>
                </button>
                {outcome && (
                  <button 
                    type="button"
                    disabled={isChatLoading}
                    onClick={handleExplainOutcome} 
                    className="px-3.5 py-2 bg-[#dfd0b4] hover:bg-[#d0be9e] disabled:opacity-60 disabled:cursor-not-allowed border border-[#8b6b47] rounded text-[#261d15] font-serif font-bold text-[16px] transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <span>📜 Cố vấn giải thích nguyên nhân kết cục</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer Input Khung Chat */}
            <div className="p-3.5 bg-[#ede4d3] border-t border-[#d4c3ab] flex items-center gap-2.5">
              <button 
                type="button"
                onClick={() => setShowAdvisorModal(false)} 
                className="relative px-7 py-2.5 rounded-lg text-[#faebcd] font-serif font-black text-sm tracking-wider uppercase shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#8b6b47] hover:brightness-110 active:scale-95 transition-all cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
                style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-sm tracking-wide">
                  Đóng sổ
                </span>
              </button>

              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  handleSendChat(); 
                }} 
                className="flex-1 flex items-center gap-2"
              >
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Thảo luận với Cố vấn Friedrich..." 
                  className="flex-1 bg-[#f7f2e7] border border-[#b8a690] rounded px-3.5 py-2 text-[18px] text-[#1f1710] placeholder-[#8a6d55] focus:outline-none focus:border-[#5c3818] font-serif"
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()}
                  className="relative px-7 py-2.5 rounded-lg text-[#faebcd] font-serif font-black text-sm tracking-wider uppercase shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#8b6b47] hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
                  style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-sm tracking-wide">
                    Hỏi tiếp
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
