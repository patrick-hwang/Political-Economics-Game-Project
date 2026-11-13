import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  RotateCcw, 
  Award, 
  Loader2
} from 'lucide-react';
import { 
  playPageTurnSound, 
  playStampSound 
} from '../services/soundEffects';
import { playTrack, pauseMusic, resumeMusic, MUSIC_TRACKS } from '../services/musicManager';
import { getNodeEra } from '../services/nodeEraMap';
import AtmosphericVFX from './AtmosphericVFX';
import { getLocalGraph, sendChatMessage, getChatHistory, explainDecision } from '../services/api';

// 1914 Royal Seal Diamond Bullet
function SealBullet() {
  return (
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
}

// 1914 Asteria Imperial Red Wax Seal Stamp
function RedWaxSeal({ className = "w-16 h-16" }) {
  return (
    <div className={`pointer-events-none select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] ${className}`}>
      <svg viewBox="0 0 120 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="waxBaseGradReact" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#df2626" />
            <stop offset="45%" stopColor="#aa1111" />
            <stop offset="85%" stopColor="#6e0808" />
            <stop offset="100%" stopColor="#450303" />
          </radialGradient>
          <radialGradient id="waxInnerGradReact" cx="42%" cy="38%" r="50%">
            <stop offset="0%" stopColor="#c91e1e" />
            <stop offset="60%" stopColor="#880a0a" />
            <stop offset="100%" stopColor="#500505" />
          </radialGradient>
          <linearGradient id="waxHighlightReact" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#ff7b7b" stopOpacity="0.7" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3d0303" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d="M60 6 C75 4, 88 12, 98 22 C108 32, 116 46, 114 62 C112 78, 104 92, 92 103 C80 114, 64 116, 48 114 C32 112, 18 103, 11 89 C4 75, 4 58, 10 44 C16 30, 28 17, 44 10 C50 7, 55 7, 60 6 Z" fill="url(#waxBaseGradReact)" stroke="#3d0202" strokeWidth="1.5" />
        <path d="M58 12 C72 10, 84 17, 92 26 C100 35, 107 48, 105 62 C103 76, 96 87, 86 96 C76 105, 62 107, 48 105 C34 103, 23 95, 17 83 C11 71, 11 56, 16 44 C21 32, 31 21, 44 15 C49 13, 54 13, 58 12 Z" fill="none" stroke="url(#waxHighlightReact)" strokeWidth="3" opacity="0.75" />
        <circle cx="60" cy="60" r="41" fill="url(#waxInnerGradReact)" stroke="#380202" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="40" fill="none" stroke="#ff8585" strokeWidth="0.8" opacity="0.35" />
        <circle cx="60" cy="60" r="36" fill="none" stroke="#480505" strokeWidth="1.2" strokeDasharray="2, 2.5" />
        <path id="waxTextTopReact" d="M 28 60 A 32 32 0 0 1 92 60" fill="none" />
        <text fontFamily="'Cinzel', serif" fontSize="6.5" fontWeight="900" fill="#fca5a5" letterSpacing="1.5" opacity="0.85">
          <textPath href="#waxTextTopReact" startOffset="50%" textAnchor="middle">ASTERIA • 1914</textPath>
        </text>
        <path id="waxTextBottomReact" d="M 92 60 A 32 32 0 0 1 28 60" fill="none" />
        <text fontFamily="'Cinzel', serif" fontSize="5" fontWeight="900" fill="#fca5a5" letterSpacing="1.2" opacity="0.75">
          <textPath href="#waxTextBottomReact" startOffset="50%" textAnchor="middle">WINGS OF CAPITAL</textPath>
        </text>
        <g transform="translate(60,60)">
          <circle cx="0" cy="0" r="16" fill="#5e0707" stroke="#360202" strokeWidth="1" />
          <circle cx="0" cy="0" r="15" fill="none" stroke="#fca5a5" strokeWidth="0.5" opacity="0.4" />
          <path d="M-2 -18 h4 v3 h-4 z M-2 15 h4 v3 h-4 z M-18 -2 v4 h3 v-4 z M15 -2 v4 h3 v-4 z M-13 -13 l2.8 -2.8 l2.1 2.1 l-2.8 2.8 z M9 9 l2.8 -2.8 l2.1 2.1 l-2.8 2.8 z M-13 11 l2.8 2.8 l2.1 -2.1 l-2.8 -2.8 z M9 -11 l2.8 2.8 l2.1 -2.1 l-2.8 -2.8 z" fill="#3b0202" />
          <path d="M-1 -1 C-4 -8, -6 -14, 0 -17 C6 -14, 4 -8, 1 -1 Z" fill="#8c0f0f" stroke="#ff9e9e" strokeWidth="0.5" opacity="0.9" />
          <path d="M1 1 C4 8, 6 14, 0 17 C-6 14, -4 8, -1 1 Z" fill="#8c0f0f" stroke="#ff9e9e" strokeWidth="0.5" opacity="0.9" />
          <circle cx="0" cy="0" r="4.5" fill="#360202" stroke="#ff9e9e" strokeWidth="0.6" />
          <circle cx="-1" cy="-1" r="1" fill="#fff" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

// 1914 Ornate Brass Filigree Corner Bracket
function BrassCornerBracket({ positionClass = "top-0 left-0", transformClass = "" }) {
  return (
    <div className={`absolute ${positionClass} w-11 h-11 pointer-events-none z-30 filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)] ${transformClass}`}>
      <svg viewBox="0 0 40 40" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="brassGradCornerReact" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae89d"/>
            <stop offset="35%" stopColor="#c99728"/>
            <stop offset="70%" stopColor="#7a5410"/>
            <stop offset="100%" stopColor="#422c06"/>
          </linearGradient>
        </defs>
        <path d="M0 0 L40 0 L40 10 L10 10 L10 40 L0 40 Z" fill="url(#brassGradCornerReact)" stroke="#2b1a03" strokeWidth="1.2"/>
        <path d="M2 2 L38 2 L38 8 L8 8 L8 38 L2 38 Z" fill="#ffeaa3" opacity="0.45"/>
        <path d="M10 10 C18 10 24 16 26 26 C22 24 18 20 18 16" fill="#805b10" opacity="0.6"/>
        <circle cx="26" cy="5" r="2.2" fill="#3a2406" stroke="#ffea9f" strokeWidth="0.8"/>
        <line x1="24.5" y1="5" x2="27.5" y2="5" stroke="#ffea9f" strokeWidth="0.8"/>
        <circle cx="5" cy="26" r="2.2" fill="#3a2406" stroke="#ffea9f" strokeWidth="0.8"/>
        <line x1="5" y1="24.5" x2="5" y2="27.5" stroke="#ffea9f" strokeWidth="0.8"/>
        <circle cx="5" cy="5" r="2.8" fill="#f5d36e" stroke="#2b1a03" strokeWidth="0.8"/>
        <circle cx="4.2" cy="4.2" r="0.8" fill="#fff" opacity="0.9"/>
      </svg>
    </div>
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
  companyName = 'ĐỘC TÔN HÀNG KHÔNG',
  gender = 'male',
  historyLength = 0,
  onRestart
}) {
  const [scale, setScale] = useState(1);
  const [graph, setGraph] = useState(null);
  const [showSecretaryModal, setShowSecretaryModal] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedChoiceForDetail, setSelectedChoiceForDetail] = useState(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaAspect, setMediaAspect] = useState(16 / 9);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Chào ngài Chủ tịch, tôi là Friedrich. Hôm nay ngài muốn thảo luận về chiến lược kinh tế hay cơ cấu tư bản của tập đoàn?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatStreamRef = useRef(null);
  const modalVideoRef = useRef(null);

  // Play video with audio and loop when media modal is open; pause/resume BGM
  useEffect(() => {
    if (isMediaModalOpen) {
      pauseMusic();
      if (modalVideoRef.current) {
        modalVideoRef.current.currentTime = 0;
        modalVideoRef.current.muted = false;
        modalVideoRef.current.play().catch(err => {
          console.warn("Autoplay with audio blocked or failed:", err);
        });
      }
    } else {
      resumeMusic();
    }
  }, [isMediaModalOpen]);

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
        setSelectedChoiceForDetail(null);
        setIsMediaModalOpen(false);
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

  // Giải thích kết cục / quyết định bằng AI
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

  const isValidValue = (val) => {
    if (val === null || val === undefined) return false;
    const s = String(val).trim();
    const lower = s.toLowerCase();
    if (!s || s === "" || lower === "không" || lower === "khong" || lower === "không có" || lower === "khong co" || lower === "none" || lower === "n/a") {
      return false;
    }
    return true;
  };

  // Duyệt qua lịch sử các node đã trải qua
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
        const choicesList = (node["next node"] || []).map(Number);
        let chosenId = null;
        if (historyChoiceIdx < history.length) {
          const nextHist = Number(history[historyChoiceIdx]);
          if (choicesList.includes(nextHist)) {
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

      const nextNodes = node["next node"] || [];
      if (nextNodes.length === 0) break;
      currId = Number(nextNodes[0]);
    }

    return events;
  };

  // Xác định node đang hoạt động
  const activeNodeId = currentContext 
    ? currentContext.node 
    : (question ? question.node : currentNodeId);

  // Tính Kỷ nguyên (Era Index 0..7) chuẩn xác 100% theo bản đồ nodeEraMap cho toàn bộ 560 nodes
  const calculateEraIndex = (nodeId, contextObj = null, questionObj = null) => {
    if (nodeId !== null && nodeId !== undefined) {
      const era = getNodeEra(nodeId);
      if (era !== undefined && era !== null && !isNaN(era)) {
        return era;
      }
    }
    const textToCheck = `${(contextObj?.content || "")} ${(questionObj?.content || "")}`.toLowerCase();
    if (textToCheck.includes("1914") || textToCheck.includes("thế chiến thứ nhất") || textToCheck.includes("xưởng nhỏ")) return 0;
    if (textToCheck.includes("1918")) return 1;
    if (textToCheck.includes("1925") || textToCheck.includes("1929") || textToCheck.includes("đại suy thoái")) return 2;
    if (textToCheck.includes("1939") || textToCheck.includes("thế chiến thứ hai")) return 3;
    if (textToCheck.includes("1945") || textToCheck.includes("động cơ phản lực")) return 4;
    if (textToCheck.includes("1973") || textToCheck.includes("1978") || textToCheck.includes("dầu mỏ")) return 5;
    if (textToCheck.includes("2000") || textToCheck.includes("airbus")) return 6;
    if (textToCheck.includes("2008") || textToCheck.includes("2011") || textToCheck.includes("độc quyền")) return 7;
    return 0;
  };

  const eraIndex = calculateEraIndex(activeNodeId, currentContext, question);
  const chapter = ERA_METADATA[eraIndex] || ERA_METADATA[0];

  // Era-based background music transitions
  useEffect(() => {
    if (eraIndex === 0 || eraIndex === 1) {
      playTrack(MUSIC_TRACKS.ERA_I_II);
    } else if (eraIndex === 2 || eraIndex === 3) {
      playTrack(MUSIC_TRACKS.ERA_III_IV);
    } else if (eraIndex === 4 || eraIndex === 5) {
      playTrack(MUSIC_TRACKS.ERA_V_VI);
    } else if (eraIndex === 6 || eraIndex === 7) {
      playTrack(MUSIC_TRACKS.ERA_VII_VIII);
    }
  }, [eraIndex]);

  const formattedBudget = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(budget);

  // Lựa chọn ảnh/video tư liệu hoặc chân dung CEO chính xác theo tình huống game
  const getLeftArt = () => {
    const contextContent = (currentContext?.content || "").toLowerCase();
    const isArrest = activeNodeId === 381 || String(activeNodeId) === "381" ||
      contextContent.includes("bị bắt") || contextContent.includes("bỏ vào tù") || contextContent.includes("vào tù");

    // 1. KỊCH BẢN BỊ BẮT GIỮ DO CẤU KẾT ĐỘC QUYỀN (NODE 381 & CÁC NHÁNH TƯƠNG ĐƯƠNG)
    if (isArrest) {
      const arrestVideo = gender === 'female' 
        ? '/assets/videos/arrest_female_381.mp4' 
        : '/assets/videos/arrest_male_381.mp4';
      return {
        title: "BẢN ÁN TRỪNG PHẠT • PHÁP LÝ",
        caption: "BỊ BẮT GIỮ DO CẤU KẾT ĐỘC QUYỀN & CHÈN ÉP ĐỐI THỦ",
        src: "/assets/events/event_1914.jpg",
        videoSrc: arrestVideo,
        tag: "KHỦNG HOẢNG PHÁP LÝ",
        isStampAlert: true,
        dateText: "NĂM 2008",
      };
    }

    // 2. KẾT CỤC CUỐI GAME (WIN HOẶC LOSE)
    if (outcome) {
      if (outcome.type === 'win' || String(activeNodeId) === "382" || activeNodeId === 382) {
        return {
          title: "KỶ NGUYÊN TOÀN THẮNG • 2011",
          caption: "ĐẾ CHẾ CÁNH BAY ĐỘC TÔN HOÀN TOÀN THỐNG TRỊ THỊ TRƯỜNG",
          src: "/assets/events/event_1945.jpg",
          videoSrc: "/assets/videos/victory_382.mp4",
          tag: "KỶ NGUYÊN TOÀN THẮNG",
          dateText: "NĂM 2011",
        };
      }
      return {
        title: "BẢN ÁN SUY TÀN • PHÁ SẢN",
        caption: "DOANH NGHIỆP THẤT BẠI TRONG CUỘC ĐUA ĐỘC QUYỀN",
        src: "/assets/events/event_1929.jpg",
        videoSrc: "/assets/videos/event_1929.mp4",
        tag: "KẾT CỤC BIÊN NIÊN SỬ",
        dateText: "NĂM 2011",
      };
    }

    // 3. CÁC ĐOẠN NGỮ CẢNH LỊCH SỬ (CONTEXT NODES)
    if (currentContext) {
      // Nhánh 1914 - 1918: Thế chiến thứ nhất
      if (
        contextContent.includes("1914") || 
        contextContent.includes("1917") || 
        contextContent.includes("1918") || 
        contextContent.includes("thế chiến thứ nhất") || 
        contextContent.includes("xưởng nhỏ") ||
        activeNodeId === 41 || activeNodeId === 42 || activeNodeId === 71
      ) {
        return {
          title: `HỒ SƠ TƯ LIỆU #${activeNodeId}`,
          caption: "KHAI CHIẾN & CƠ HỘI SẢN XUẤT QUÂN SỰ THẾ CHIẾN I",
          src: "/assets/events/event_1914.jpg",
          videoSrc: "/assets/videos/event_1914.mp4",
          tag: "KHỞI NGUYÊN ASTERIA 1914",
          dateText: contextContent.includes("1918") || activeNodeId === 42 || activeNodeId === 71 ? "NĂM 1918" : "THÁNG 8 • 1914",
        };
      }

      // Nhánh 1929 Đại suy thoái, 1973 Cú sốc dầu mỏ, hoặc 2008 Bão tài chính
      if (
        contextContent.includes("1929") || 
        contextContent.includes("1930") || 
        contextContent.includes("đại suy thoái") || 
        contextContent.includes("thương mại hóa") ||
        contextContent.includes("1973") ||
        contextContent.includes("dầu mỏ") ||
        contextContent.includes("năng lượng") ||
        contextContent.includes("2008") ||
        contextContent.includes("bão tài chính") ||
        contextContent.includes("tín dụng")
      ) {
        return {
          title: `HỒ SƠ TƯ LIỆU #${activeNodeId}`,
          caption: "ĐẠI SUY THOÁI & BIẾN ĐỘNG THỊ TRƯỜNG KINH TẾ",
          src: "/assets/events/event_1929.jpg",
          videoSrc: "/assets/videos/event_1929.mp4",
          tag: contextContent.includes("2008") ? "BÃO TÀI CHÍNH 2008" : (contextContent.includes("1973") ? "CÚ SỐC DẦU MỎ 1973" : "SUY THOÁI KINH TẾ 1929"),
          dateText: contextContent.includes("2008") ? "NĂM 2008" : (contextContent.includes("1973") ? "NĂM 1973" : "NĂM 1929"),
        };
      }

      // Nhánh 1939 - 1945: Thế chiến thứ hai, Động cơ phản lực, Cạnh tranh Airbus
      if (
        contextContent.includes("1939") || 
        contextContent.includes("1945") || 
        contextContent.includes("thế chiến thứ hai") || 
        contextContent.includes("phản lực") ||
        contextContent.includes("airbus") ||
        contextContent.includes("2000")
      ) {
        return {
          title: `HỒ SƠ TƯ LIỆU #${activeNodeId}`,
          caption: "THẾ CHIẾN II & KỶ NGUYÊN ĐỘNG CƠ PHẢN LỰC",
          src: "/assets/events/event_1945.jpg",
          videoSrc: "/assets/videos/event_1945.mp4",
          tag: contextContent.includes("airbus") || contextContent.includes("2000") ? "SỨC ÉP AIRBUS 2000" : (contextContent.includes("1945") ? "PHẢN LỰC 1945" : "CHIẾN TRANH TOÀN CẦU 1939"),
          dateText: contextContent.includes("2000") ? "NĂM 2000" : (contextContent.includes("1945") ? "NĂM 1945" : "NĂM 1939"),
        };
      }

      // Mặc định cho Context node dựa trên era
      return {
        title: `HỒ SƠ TƯ LIỆU #${activeNodeId}`,
        caption: chapter.title,
        src: chapter.artSrc,
        videoSrc: chapter.videoSrc,
        tag: chapter.tag,
        dateText: TIMELINE_ERAS[eraIndex]?.year || "1914",
      };
    }

    // 4. KHI Ở QUESTION NODE (QUYẾT SÁCH CHIẾN LƯỢC): HIỆN CHÂN DUNG CEO
    const portraitSrc = gender === 'female' 
      ? '/assets/portraits/ceo_female.jpg' 
      : '/assets/portraits/ceo_male.jpg';

    return {
      title: gender === 'female' ? "TỔNG GIÁM ĐỐC VICTORIA VANCE" : "CHỦ TỊCH ALEXANDER VANCE",
      caption: "QUYẾT SÁCH CHIẾN LƯỢC CỦA DOANH NGHIỆP",
      src: portraitSrc,
      tag: "QUYẾT ĐỊNH CỦA CHỦ TỊCH",
      dateText: TIMELINE_ERAS[eraIndex]?.year || "1914",
    };
  };

  const leftArt = getLeftArt();

  // Tự động nhận diện tỉ lệ media ban đầu theo loại tài nguyên (tránh giật layout)
  useEffect(() => {
    if (leftArt.src && (leftArt.src.includes('portrait') || leftArt.src.includes('ceo'))) {
      setMediaAspect(896 / 1200);
    } else {
      setMediaAspect(16 / 9);
    }
  }, [leftArt.src, leftArt.videoSrc]);

  const getAtmosphereType = () => {
    if (outcome) return outcome.type === 'win' ? 'gold' : 'rain';
    if (!currentContext && question) return 'dust';
    return chapter.vfx || 'dust';
  };

  // Drop cap chữ cái đầu tiên cho văn bản ngữ cảnh
  const formatStoryWithDropCap = (text) => {
    if (!text) return null;
    const normalized = String(text).normalize('NFC').trim();
    const firstLetter = normalized.charAt(0);
    const rest = normalized.slice(1);
    return (
      <p className="font-serif text-[#2a241e] text-[17px] leading-[1.75] text-justify tracking-normal">
        <span className="float-left text-5xl font-serif font-black text-[#5c3818] mr-2 -mt-1 leading-none select-none">
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

  const handleChoiceClick = (choice) => {
    setSelectedChoiceForDetail(choice);
  };

  const handleConfirmChoice = (choice) => {
    playStampSound();
    setSelectedChoiceForDetail(null);
    onSelectChoice(choice);
  };

  return (
    <div className="w-screen h-screen overflow-hidden desk-bg text-[#2a241e] font-serif flex items-center justify-center p-0 m-0 antialiased select-none">
      
      {/* 16:9 Fixed Game Canvas (1280x720 with uniform GPU scaling) */}
      <main 
        className="game-canvas-1280-720 select-none"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="relative z-10 w-[1280px] h-[720px] bg-[#1a1512] p-3.5 shadow-[0_25px_70px_rgba(0,0,0,0.98)] border-4 border-[#3d2a1c] rounded-xl flex flex-col justify-between overflow-hidden select-none">
          
          {/* ======================================================================= */}
          {/* 4 GÓC KIM LOẠI ĐỒNG THAU BỌC SỔ CÁI (DIRECTION 3: ORNATE BRASS BRACKETS) */}
          {/* ======================================================================= */}
          <BrassCornerBracket positionClass="top-0 left-0" />
          <BrassCornerBracket positionClass="top-0 right-0" transformClass="rotate-90" />
          <BrassCornerBracket positionClass="bottom-0 right-0" transformClass="rotate-180" />
          <BrassCornerBracket positionClass="bottom-0 left-0" transformClass="-rotate-90" />

          {/* ======================================================================= */}
          {/* 1. TOP BAR: EXECUTIVE BRASS CHRONOMETER & MECHANICAL BALANCE GAUGE      */}
          {/* ======================================================================= */}
          <div className="flex flex-row items-center justify-between px-3 py-1 text-[11px] font-mono text-[#a88d74] border-b-2 border-[#4a3424] mb-2 gap-2 h-[42px] shrink-0 bg-gradient-to-r from-[#17110c] via-[#211710] to-[#17110c] rounded-t-lg shadow-sm">
            
            {/* Medallion & Company Title */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#d4af37] to-[#614511] p-[1px] shadow-sm flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#1e150d] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[#d4af37]" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0.75L15.25 8L8 15.25L0.75 8Z"/>
                  </svg>
                </div>
              </div>
              <span className="tracking-wider uppercase font-bold text-[#c4aa92]">
                BẢN GHI ĐIỀU HÀNH • <span className="text-[#d4af37] font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{companyName}</span> (Asteria)
              </span>
            </div>

            {/* 1914 Chronometer Timeline Plaque (Thước đo thời gian bọc đồng với ốc vít cơ khí) */}
            <div className="relative px-3 py-1 rounded bg-gradient-to-r from-[#21160d] via-[#332214] to-[#21160d] border border-[#78531d] shadow-[inset_0_1px_3px_rgba(0,0,0,0.9),0_2px_5px_rgba(0,0,0,0.6)] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_0.5px_0.5px_#fff] shrink-0"></div>
              
              <div className="flex items-center gap-1 overflow-hidden">
                {TIMELINE_ERAS.map((era, idx) => {
                  const isActive = idx === eraIndex;
                  const isPast = idx < eraIndex;
                  return (
                    <div
                      key={era.id}
                      title={`Kỷ nguyên ${era.roman} • Năm ${era.year} (${era.label})`}
                      className={`px-2 py-0.5 rounded font-serif text-xs transition-all flex items-center justify-center min-w-[24px] cursor-help ${
                        isActive
                          ? 'font-black bg-gradient-to-b from-[#ffe599] via-[#d4af37] to-[#8c6721] text-[#1c1205] shadow-[0_1px_3px_rgba(0,0,0,0.8)] border border-[#382305]'
                          : isPast
                          ? 'bg-[#1a120b] text-[#a48a73] border border-[#422c19] hover:text-[#d4af37]'
                          : 'text-[#5c4737] border border-transparent'
                      }`}
                    >
                      {isActive ? (
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#523306]"></span>
                          <span>{era.roman} • {era.year}</span>
                        </div>
                      ) : (
                        <span>{era.roman}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#3b280a] shadow-[inset_0_0.5px_0.5px_#fff] shrink-0"></div>
            </div>

            {/* Ngân quỹ & Nút Gấp Sổ Lại */}
            <div className="flex items-center gap-3">
              {/* Mechanical Balance Gauge */}
              <div className="flex items-center gap-1.5 bg-[#120d08] px-2.5 py-1 rounded-full border border-[#6b4c1e] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#d4af37] text-[#1e1305] flex items-center justify-center font-bold text-[9px] shadow-sm">
                  $
                </div>
                <span className="font-mono text-xs font-black tracking-wider text-[#faebcd] drop-shadow-sm">{formattedBudget}</span>
              </div>

              {/* Button Gấp Sổ Lại */}
              <button 
                type="button" 
                onClick={onRestart} 
                className="text-[#c4aa92] hover:text-[#faebcd] transition-all flex items-center gap-1.5 cursor-pointer font-serif font-bold text-xs px-2.5 py-1 rounded border border-[#6b4c1e] hover:border-[#d4af37] bg-gradient-to-b from-[#2e1f14] to-[#1c120a] shadow-sm active:scale-95"
                title="Gấp sổ lại và quay về bìa sách"
              >
                <RotateCcw className="w-3 h-3 text-[#d4af37]" />
                <span>Gấp sổ</span>
              </button>
            </div>

          </div>

          {/* ======================================================================= */}
          {/* 2. HAI TRANG GIẤY DA MỞ RỘNG (Left Page & Right Page • Cố định 2 cột 1280x720) */}
          {/* ======================================================================= */}
          <div className="relative w-full h-[644px] rounded-lg bg-[#f7f2e7] shadow-[inset_0_0_35px_rgba(61,42,28,0.2),0_15px_35px_rgba(0,0,0,0.85)] border-2 border-[#b8a287] grid grid-cols-2 overflow-hidden">
            
            {/* Nếp gấp gáy sách chính giữa (3D Spine Crease & Stitching) */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-9 bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none z-30"></div>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-[#8a6845]/30 z-30 pointer-events-none"></div>

            {/* ===================================================================== */}
            {/* TRANG BÊN TRÁI: KHUNG KẸP KIM LOẠI QUÂN SỰ 1914 + 2 NÚT + CHÚ THÍCH    */}
            {/* ===================================================================== */}
            <div className="relative w-full h-full bg-[#f4ecd8] p-6 flex flex-col justify-between border-r border-[#d4c3ab]">
              
              {/* Header trên cùng trang trái */}
              <div className="flex items-center text-[#7a6452] border-b border-[#d8c9b6] pb-1.5">
                <span className="font-serif font-black text-xs tracking-widest uppercase text-[#5c3818]">
                  {leftArt.tag}
                </span>
              </div>

              {/* Khung Kẹp Kim Loại Quân Sự 1914: Tự động co giãn linh hoạt theo tỉ lệ media, không đè lên các thành phần khác */}
              <div className="flex-1 w-full min-h-0 my-auto flex items-center justify-center overflow-hidden py-1">
                <div 
                  onClick={() => setIsMediaModalOpen(true)}
                  className="relative rounded-lg bg-gradient-to-b from-[#261b11] via-[#1a120b] to-[#120d08] p-2.5 border-2 border-[#7a5823] hover:border-[#d4af37] shadow-[0_10px_25px_rgba(0,0,0,0.65),inset_0_1px_2px_rgba(255,225,130,0.2)] flex items-center justify-center cursor-pointer group transition-all duration-300"
                  style={{
                    aspectRatio: mediaAspect ? `${mediaAspect}` : '16/9',
                    maxHeight: '330px',
                    maxWidth: '100%',
                    height: mediaAspect && mediaAspect < 1 ? '330px' : 'auto',
                    width: mediaAspect && mediaAspect >= 1 ? '100%' : 'auto',
                  }}
                  title="Nhấn vào clip/ảnh để mở xem toàn màn hình (Pop-up Video)"
                >
                  {/* Photo Container with Brass Corner Clamps */}
                  <div className="relative w-full h-full rounded overflow-hidden bg-[#0a0705] border border-[#52391e] shadow-inner flex items-center justify-center">
                    
                    {/* 4 Corner Brass Mounting Clamps */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#d4af37] z-20 pointer-events-none shadow-sm"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#d4af37] z-20 pointer-events-none shadow-sm"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#d4af37] z-20 pointer-events-none shadow-sm"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#d4af37] z-20 pointer-events-none shadow-sm"></div>

                    {/* Nút chỉ dẫn hover: Phóng to toàn màn hình */}
                    <div className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#160f0a]/90 border border-[#d4af37]/80 text-[10px] font-mono text-[#d4af37] tracking-wider flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.85)] pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span className="font-bold uppercase tracking-wide">Phóng to ⛶</span>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={(leftArt.videoSrc || leftArt.src) + activeNodeId + (outcome ? '_outcome' : '')}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25 }}
                        className="relative w-full h-full flex items-center justify-center overflow-hidden"
                      >
                        {leftArt.videoSrc ? (
                          <video
                            key={leftArt.videoSrc}
                            src={leftArt.videoSrc}
                            autoPlay
                            loop
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              if (e.currentTarget.videoWidth && e.currentTarget.videoHeight) {
                                setMediaAspect(e.currentTarget.videoWidth / e.currentTarget.videoHeight);
                              }
                            }}
                            className="w-full h-full object-contain object-center filter contrast-[1.03]"
                          />
                        ) : (
                          <img 
                            key={leftArt.src}
                            src={leftArt.src} 
                            alt={leftArt.title}
                            onLoad={(e) => {
                              if (e.currentTarget.naturalWidth && e.currentTarget.naturalHeight) {
                                setMediaAspect(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight);
                              }
                            }}
                            className="w-full h-full object-contain contrast-[1.05] transition-all duration-300"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1517976487507-5b3b11929314?q=80&w=900&auto=format&fit=crop';
                            }}
                          />
                        )}

                        {!leftArt.videoSrc && <AtmosphericVFX type={getAtmosphereType()} />}

                        {/* Dramatic Arrest Stamp Overlay on Node 381 */}
                        {leftArt.isStampAlert && (
                          <motion.div 
                            initial={{ scale: 3.8, opacity: 0, rotate: -25, y: -50 }}
                            animate={{ scale: 1, opacity: 1, rotate: -12, y: 0 }}
                            transition={{ type: "spring", damping: 11, stiffness: 240, delay: 0.08 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                          >
                            <div className="px-6 py-3 border-4 border-rose-700 bg-rose-950/90 text-rose-200 font-mono font-black text-xl tracking-widest shadow-[0_0_35px_rgba(225,29,72,0.7)] backdrop-blur-sm border-dashed">
                              CHÍNH PHỦ BẮT GIỮ
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* 2 Nút: Biên Bản & Cố Vấn Friedrich (Phông chữ Condensed 1914, căn giữa ô, cách đều 2 mép trang) */}
              <div className="my-3 w-full flex items-center justify-evenly">
                <button 
                  type="button"
                  onClick={() => setShowSecretaryModal(true)}
                  className="relative h-[62px] aspect-[1320/440] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer overflow-visible group"
                  title="Xem lại toàn bộ các sự kiện và quyết định đã trải qua"
                >
                  <img 
                    src="/assets/asset_btn_minutes_ledger_clean.png" 
                    alt="Biên bản" 
                    className="absolute inset-0 w-full h-full object-contain filter brightness-95 group-hover:brightness-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] transition-all pointer-events-none" 
                  />
                  {/* Vùng da chứa chữ: Căn giữa tuyệt đối cả chiều ngang và dọc so với lòng ô */}
                  <div className="absolute left-[29%] right-[9%] top-[15%] bottom-[5%] flex items-center justify-center pointer-events-none z-10 px-2">
                    <span className="font-['Playfair_Display_SC','Faustina',serif] font-bold tracking-wider text-xs sm:text-[13px] text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] uppercase select-none whitespace-nowrap text-center">
                      Biên bản
                    </span>
                  </div>
                </button>

                <button 
                  type="button"
                  onClick={() => setShowAdvisorModal(true)}
                  className="relative h-[62px] aspect-[1320/440] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer overflow-visible group"
                  title="Mở Cố Vấn Friedrich để đàm đạo chiến lược và lý luận KTCT"
                >
                  <img 
                    src="/assets/asset_btn_friedrich_plaque_clean.png" 
                    alt="Cố Vấn Friedrich" 
                    className="absolute inset-0 w-full h-full object-contain filter brightness-95 group-hover:brightness-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.65)] transition-all pointer-events-none" 
                  />
                  {/* Vùng da chứa chữ: Căn giữa tuyệt đối cả chiều ngang và dọc so với lòng ô */}
                  <div className="absolute left-[29%] right-[9%] top-[15%] bottom-[5%] flex items-center justify-center pointer-events-none z-10 px-2">
                    <span className="font-['Playfair_Display_SC','Faustina',serif] font-bold tracking-normal text-[11px] sm:text-[12px] text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] uppercase select-none whitespace-nowrap text-center">
                      Cố vấn Friedrich
                    </span>
                  </div>
                </button>
              </div>

              {/* Chú Thích Trang Trái */}
              <div className="text-center pt-2 border-t border-[#d8c9b6]">
                <h4 className="font-serif font-black text-[15px] text-[#3d2f24] tracking-wider uppercase">
                  HỒ SƠ, TƯ LIỆU LIÊN QUAN
                </h4>
              </div>

            </div>

            {/* ===================================================================== */}
            {/* TRANG BÊN PHẢI: NỘI DUNG SỬ LIỆU JSON + CÂU HỎI + NÚT TIẾP THEO       */}
            {/* ===================================================================== */}
            <div className="relative w-full h-full bg-[#f9f5ed] p-6 flex flex-col justify-between overflow-hidden">
              
              {/* Top Chapter & Node Header */}
              <div className="border-b-2 border-[#3d2f24] pb-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#826b58] uppercase tracking-wider mb-0.5">
                  <span>{chapter.era}</span>
                </div>
                <h2 className="font-serif font-black text-xl text-[#2b2118] tracking-tight">
                  {chapter.title}
                </h2>
              </div>

              {/* Animated Content for Right Page */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeNodeId + (currentContext ? `_ctx_${contextIndex}` : '_q')}
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col justify-between"
                >

                  {/* 1. MÀN HÌNH NARRATIVE CONTEXT (CÓ CON DẤU SÁP ĐỎ ASTERIA 1914) */}
                  {currentContext && (
                    <div className="my-auto py-2 space-y-3.5">
                      {formatStoryWithDropCap(currentContext.content)}

                      {/* Financial Movement with Red Wax Seal Stamp (Bỏ nền xanh/đỏ, dùng 2 font riêng biệt làm nổi bật) */}
                      {currentContext.revenue && currentContext.revenue.trim() !== "" && (
                        <div className="relative p-3.5 bg-[#ede4d3]/85 border-l-4 border-[#7a5538] rounded-r shadow-sm flex items-center justify-between gap-4 pr-20 overflow-hidden">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <span className="font-condensed font-bold text-xs sm:text-[13px] text-[#6b421a] tracking-widest uppercase select-none">
                              GHI NHẬN BIẾN ĐỘNG SỔ CÁI:
                            </span>
                            <span className={`font-title font-black text-xl sm:text-2xl tracking-wide select-none ${
                              currentContext.revenue.includes('-') ? 'text-[#922119]' : 'text-[#166534]'
                            }`}>
                              {currentContext.revenue}
                            </span>
                          </div>
                          
                          {/* Asteria Imperial Red Wax Seal Stamp */}
                          <div className="absolute -bottom-2 right-1 pointer-events-none select-none">
                            <RedWaxSeal className="w-16 h-16 drop-shadow-md opacity-95" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 2. MÀN HÌNH QUESTION & CHOICES */}
                  {!currentContext && question && !outcome && (
                    <div className="my-auto py-2 space-y-4">
                      {/* Strategic Question Box (Bỏ màu nền, bỏ viền trái, tiêu đề to nổi bật) */}
                      <div className="pb-1">
                        <span className="font-title font-black text-sm sm:text-base text-[#5c3818] tracking-widest uppercase block mb-1.5">
                          CÂU HỎI CHIẾN LƯỢC:
                        </span>
                        <h3 className="font-serif font-bold text-base sm:text-[18px] text-[#241a12] leading-snug">
                          {question.content}
                        </h3>
                      </div>

                      {/* Danh sách lựa chọn A & B: Giữ nguyên tỉ lệ gốc của asset choice bar, căn giữa phương án */}
                      <div className="space-y-3.5 flex flex-col items-center">
                        {choices.map((choice, idx) => {
                          const isFirst = idx === 0;

                          return (
                            <button
                              key={choice.node}
                              type="button"
                              onClick={() => handleChoiceClick(choice)}
                              className="relative w-full max-w-[480px] aspect-[1202/421] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer overflow-hidden group flex items-center justify-center rounded shadow-md hover:brightness-105"
                            >
                              <img 
                                src="/assets/asset_choice_bar_clean.png" 
                                alt={`Phương án ${isFirst ? 'A' : 'B'}`} 
                                className="absolute inset-0 w-full h-full object-contain filter brightness-95 group-hover:brightness-105 pointer-events-none" 
                              />
                              {/* Nội dung phương án căn giữa theo chiều ngang và chiều dọc */}
                              <div className="relative z-10 w-full h-full px-12 sm:px-14 flex items-center justify-center text-center">
                                <span className="font-serif font-bold text-[15px] sm:text-[17px] text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] leading-snug text-center">
                                  {choice.content}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. MÀN HÌNH TERMINAL OUTCOME */}
                  {!currentContext && outcome && (
                    <div className="my-auto py-2 space-y-3.5 text-center">
                      <div className="inline-flex p-3 rounded-full bg-[#3d2f24] text-[#d4af37] shadow-xl mb-0.5 border-2 border-[#d4af37]">
                        <Award className="w-8 h-8 text-[#d4af37]" />
                      </div>

                      <h3 className="font-serif font-black text-xl text-[#2b2118] tracking-tight">
                        <span className="gold-shimmer">
                          {outcome.type === 'win' ? "CHIẾN LƯỢC TOÀN THẮNG: ĐỘC QUYỀN ASTERIA" : "BẢN ÁN SUY THOÁI & THẤT BẠI"}
                        </span>
                      </h3>

                      <div className="bg-[#ede4d3] p-3.5 rounded border border-[#bfae97] text-left text-[13px] text-[#261d15] leading-relaxed shadow-inner">
                        {outcome.content}
                      </div>

                      <div className="bg-[#241a12] text-[#f7f2e7] p-3 rounded border border-[#d4af37]/40 text-xs font-mono flex items-center justify-between shadow-md">
                        <span className="text-[#c4aa92]">NGÂN SÁCH TÍCH LŨY CUỐI CÙNG:</span>
                        <span className="font-black text-base text-[#d4af37]">{formattedBudget}</span>
                      </div>

                      <div className="flex flex-row items-center justify-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={handleExplainOutcome}
                          className="py-2 px-3.5 rounded bg-[#3d2f24] hover:bg-[#2b2118] text-[#f4ecd8] border-2 border-[#8b6b47] font-serif font-bold text-xs shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <img src="/assets/icons/friedrich_avatar.jpg" alt="Friedrich" className="w-4 h-4 rounded-full border border-[#d4af37] object-cover shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          <span>Cố vấn giải thích kết cục</span>
                        </button>

                        <button
                          type="button"
                          onClick={onRestart}
                          className="py-2 px-3.5 rounded bg-[#5c3818] hover:bg-[#472a12] text-[#f7f2e7] font-serif font-bold text-xs shadow-[3px_3px_0px_#1a1512] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>MỞ LẠI SỔ CÁI TỪ NĂM 1914</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer Trang Phải: Nút Tiếp Theo (Chuẩn hóa h-[62px] bằng 2 nút bên trái, dùng asset antique_leather_button, bỏ mũi tên) */}
                  <div className="pt-2 border-[#d8c9b6] flex items-center justify-end h-[68px] shrink-0">
                    {currentContext && (
                      <button 
                        type="button" 
                        onClick={handleNext}
                        className="relative h-[62px] aspect-[1150/388] transition-all active:translate-x-0.5 active:translate-y-0.5 cursor-pointer overflow-hidden group flex items-center justify-center rounded shadow-md border border-[#8b6e4e]/40 hover:brightness-105"
                        style={{
                          backgroundImage: "url('/assets/icons/antique_leather_button.jpg')",
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        <img 
                          src="/assets/asset_menu_button_clean.png" 
                          alt="Nút tiếp theo" 
                          className="absolute inset-0 w-full h-full object-fill filter brightness-95 group-hover:brightness-105 pointer-events-none" 
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                        <span className="relative z-10 font-['Playfair_Display_SC','Faustina',serif] font-bold text-xs sm:text-[17px] text-[#f4ecd8] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)] tracking-widest uppercase select-none">
                          {contextIndex >= totalContexts - 1 ? "TIẾP THEO" : "TRANG KẾ TIẾP"}
                        </span>
                      </button>
                    )}
                  </div>

                </motion.div>
              </AnimatePresence>

            </div>

          </div>

          {/* ======================================================================= */}
          {/* CÂY BÚT MỰC ĐIỀU HÀNH 1914 & QUAI CÀI DA (1914 EXECUTIVE FOUNTAIN PEN)  */}
          {/* ======================================================================= */}
          <div className="absolute right-1 top-[200px] z-40 pointer-events-none select-none flex flex-col items-center">
            {/* Leather loop tab stitched to tome edge */}
            <div className="relative w-6 h-28 bg-gradient-to-r from-[#24150b] via-[#3a2213] to-[#1c1008] rounded-l border-l-2 border-y-2 border-[#6b4720] shadow-[-3px_5px_10px_rgba(0,0,0,0.85)] flex items-center justify-center">
              <div className="w-1 h-20 bg-[#0d0704] rounded-full border border-[#4d3016]"></div>
              <div className="absolute top-1.5 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#2b1803] shadow-[inset_0_0.5px_0.5px_#fff]"></div>
              <div className="absolute bottom-1.5 right-1 w-1.5 h-1.5 rounded-full bg-[#d4af37] border border-[#2b1803] shadow-[inset_0_0.5px_0.5px_#fff]"></div>
            </div>
            {/* Fountain Pen Image (Scaled and Rotated -68deg for Perfect Vertical Alignment) */}
            <div className="absolute -top-10 -left-16 w-44 h-44 flex items-center justify-center pointer-events-none">
              <img 
                src="/assets/asset_vintage_fountain_pen.png" 
                alt="Bút Mực Điều Hành Asteria 1914" 
                style={{
                  width: '240px',
                  height: '240px',
                  transform: 'rotate(-68deg)',
                  objectFit: 'contain',
                  filter: 'drop-shadow(-6px 12px 14px rgba(0,0,0,0.85))'
                }}
              />
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* MODAL: PHÓNG TO TƯ LIỆU / VIDEO TOÀN MÀN HÌNH (FULLSCREEN MEDIA MODAL)   */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMediaModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMediaModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/92 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.94, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl max-h-[92vh] bg-[#16100a] border-2 border-[#8c6721] rounded-xl shadow-[0_30px_90px_rgba(0,0,0,0.98),0_0_40px_rgba(140,103,33,0.35)] flex flex-col overflow-hidden text-[#e6d5c1]"
            >
              {/* Modal Brass Corner Brackets */}
              <BrassCornerBracket positionClass="top-0 left-0" />
              <BrassCornerBracket positionClass="top-0 right-0" transformClass="rotate-90" />
              <BrassCornerBracket positionClass="bottom-0 right-0" transformClass="rotate-180" />
              <BrassCornerBracket positionClass="bottom-0 left-0" transformClass="-rotate-90" />

              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#21160d] via-[#2f2014] to-[#21160d] px-5 py-2.5 border-b-2 border-[#5c401f] flex items-center justify-center text-center z-10 shrink-0">
                <h2 className="font-serif font-black text-base sm:text-lg text-[#f0dfcc] tracking-wide leading-tight uppercase text-center">
                  HỒ SƠ, TƯ LIỆU LIÊN QUAN
                </h2>
              </div>

              {/* Modal Body / Media Viewport */}
              <div className="relative w-full flex-1 bg-black/95 flex items-center justify-center p-2 min-h-0 overflow-hidden">
                {leftArt.videoSrc ? (
                  <video
                    ref={modalVideoRef}
                    key={leftArt.videoSrc}
                    src={leftArt.videoSrc}
                    autoPlay
                    loop
                    playsInline
                    className="w-full max-h-[min(54vh,440px)] object-contain rounded shadow-2xl pointer-events-none select-none"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <img
                    src={leftArt.src}
                    alt={leftArt.title}
                    className="w-full max-h-[min(54vh,440px)] object-contain rounded shadow-2xl"
                  />
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-[#1b130c] px-5 py-2.5 border-t border-[#422c17] flex items-center justify-center z-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(false)}
                  className="relative px-8 py-1.5 min-w-[120px] rounded text-[#faebcd] font-serif font-black text-xs tracking-wider uppercase transition-all shadow-[0_3px_10px_rgba(0,0,0,0.7)] border border-[#a87f32] hover:brightness-110 active:scale-95 cursor-pointer flex items-center justify-center overflow-hidden group shrink-0"
                  style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <img 
                    src="/assets/asset_menu_button_clean.png" 
                    alt="Button" 
                    className="absolute inset-0 w-full h-full object-fill filter brightness-90 group-hover:brightness-100 transition-all pointer-events-none" 
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-xs tracking-widest">
                    ĐÓNG
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 1: BẢN GHI THƯ KÝ — BIÊN BẢN DOANH NGHIỆP                           */}
      {/* ========================================================================= */}
      {showSecretaryModal && (
        <div 
          onClick={() => setShowSecretaryModal(false)}
          className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-3"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl w-[820px] max-h-[610px] shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden text-[#2a241e]"
          >
            {/* Header */}
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

            {/* Danh Sách Sự Kiện */}
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
                      <div className="event-title font-title font-black text-[18px] text-[#3e220f] w-28 shrink-0 tracking-wide pt-0.5 select-none whitespace-nowrap">
                        Sự kiện {idx + 1}
                      </div>
                      <div className="flex-1 space-y-2 text-[16px] text-[#2a241e] font-serif leading-relaxed">
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
                              <span className={`font-serif font-bold text-[17px] ${isNegative ? 'text-rose-900' : 'text-emerald-800'}`}>
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

            {/* Footer */}
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
      {/* MODAL 2: CỐ VẤN FRIEDRICH (GIAO DIỆN THUẦN CHAT)                          */}
      {/* ========================================================================= */}
      {showAdvisorModal && (
        <div 
          onClick={() => setShowAdvisorModal(false)}
          className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-3"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl w-[820px] max-h-[610px] shadow-[0_25px_70px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-[#2a241e]"
          >
            {/* Header */}
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

            {/* Chat Stream */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#f9f5ed]">
              <div ref={chatStreamRef} className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                {chatMessages.map((msg, i) => {
                  if (msg.role === 'user') {
                    return (
                      <div key={i} className="flex items-start justify-end gap-2.5">
                        <div className="bg-[#3d2f24] text-[#f7f2e7] p-3 rounded-lg rounded-tr-none text-[16px] font-serif max-w-[85%] leading-relaxed shadow-sm whitespace-pre-wrap break-words">
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
                        className="bg-[#ebdcc0] p-3 rounded-lg rounded-tl-none text-[16px] text-[#2b2118] leading-relaxed max-w-[85%] border border-[#cfbfae] font-serif shadow-sm whitespace-pre-wrap break-words"
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
                    <div className="bg-[#ebdcc0] p-3 rounded-lg rounded-tl-none text-[16px] text-[#5c3818] leading-relaxed border border-[#cfbfae] font-serif italic shadow-sm flex items-center gap-2">
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
                  className="px-3.5 py-1.5 bg-[#ebdcc0] hover:bg-[#dfd0b4] disabled:opacity-60 disabled:cursor-not-allowed border border-[#b8a690] rounded text-[#3d2a1c] font-serif text-[15px] transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                >
                  <span>💬 Phân tích tình hình hiện tại</span>
                </button>
                {outcome && (
                  <button 
                    type="button" 
                    disabled={isChatLoading}
                    onClick={handleExplainOutcome} 
                    className="px-3.5 py-1.5 bg-[#dfd0b4] hover:bg-[#d0be9e] disabled:opacity-60 disabled:cursor-not-allowed border border-[#8b6b47] rounded text-[#261d15] font-serif font-bold text-[15px] transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <span>📜 Cố vấn giải thích nguyên nhân kết cục</span>
                  </button>
                )}
              </div>
            </div>

            {/* Footer Chat */}
            <div className="p-3 bg-[#ede4d3] border-t border-[#d4c3ab] flex items-center gap-2.5">
              <button 
                type="button" 
                onClick={() => setShowAdvisorModal(false)} 
                className="relative px-6 py-2 rounded-lg text-[#faebcd] font-serif font-black text-xs tracking-wider uppercase shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#8b6b47] hover:brightness-110 active:scale-95 transition-all cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
                style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              >
                <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-xs tracking-wide">
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
                  className="flex-1 bg-[#f7f2e7] border border-[#b8a690] rounded px-3 py-1.5 text-[16px] text-[#1f1710] placeholder-[#8a6d55] focus:outline-none focus:border-[#5c3818] font-serif"
                />
                <button 
                  type="submit" 
                  disabled={isChatLoading || !chatInput.trim()}
                  className="relative px-6 py-2 rounded-lg text-[#faebcd] font-serif font-black text-xs tracking-wider uppercase shadow-[0_4px_10px_rgba(0,0,0,0.5)] border-2 border-[#8b6b47] hover:brightness-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer overflow-hidden flex items-center justify-center shrink-0"
                  style={{ backgroundImage: "url('/assets/icons/antique_leather_button.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <span className="relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] text-[#faebcd] font-serif font-black text-xs tracking-wide">
                    Hỏi tiếp
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: POP-UP PHÊ CHUẨN SẮC LỆNH (CÓ CON DẤU SÁP ĐỎ ASTERIA 1914)        */}
      {/* ========================================================================= */}
      {selectedChoiceForDetail && (() => {
        const choice = selectedChoiceForDetail;
        const choiceIdx = choices.indexOf(choice);
        const choiceLetter = choiceIdx >= 0 ? String.fromCharCode(65 + choiceIdx) : 'A';
        
        const content = choice.content || choice['nội dung'];
        const benefits = choice.benefits || choice['lợi ích'] || choice.benefit;
        const drawback = choice['potential drawback'] || choice.potential_drawback || choice.drawback || choice['tác hại'];
        const impact = choice.impact || choice['ảnh hưởng'] || choice['tác động'];
        const rev = choice.revenue || (choice.revenue_million ? `+$${choice.revenue_million} million` : null) || choice['doanh thu'];
        const isRevValid = isValidValue(rev);
        const isNegative = isRevValid && String(rev).includes('-');

        return (
          <div 
            onClick={() => setSelectedChoiceForDetail(null)}
            className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4 select-none"
          >
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-[#f7f2e7] border-4 border-[#3d2a1c] rounded-xl w-[640px] max-h-[85vh] p-6 shadow-[0_25px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between text-[#2a241e] font-serif"
            >
              {/* Header Pop-up (Đã bỏ dấu ✕, thay icon A/B thành chữ 'PHƯƠNG ÁN A/B:') */}
              <div className="flex items-center pb-3 border-b-2 border-[#b8a690]">
                <h3 className="font-title font-bold text-lg text-[#261d15] tracking-wide uppercase">
                  <span className="text-[#7a3e14] font-black mr-2">PHƯƠNG ÁN {choiceLetter}:</span>
                  XÁC NHẬN SẮC LỆNH ĐIỀU HÀNH
                </h3>
              </div>

              {/* Danh sách các trường thông tin: hiện trơn bằng bullet SealBullet, không icon khác, không viền/background card */}
              <div className="my-4 overflow-y-auto max-h-[400px] pr-2 space-y-3.5 text-[15px] sm:text-[16px] text-[#2a241e] leading-relaxed">
                {isValidValue(content) && (
                  <div className="flex items-start gap-2.5">
                    <SealBullet />
                    <div className="flex-1">
                      <span className="font-bold text-[#5c3818]">Nội dung:</span> {content}
                    </div>
                  </div>
                )}

                {isValidValue(benefits) && (
                  <div className="flex items-start gap-2.5">
                    <SealBullet />
                    <div className="flex-1">
                      <span className="font-bold text-[#5c3818]">Lợi ích:</span> {benefits}
                    </div>
                  </div>
                )}

                {isValidValue(drawback) && (
                  <div className="flex items-start gap-2.5">
                    <SealBullet />
                    <div className="flex-1">
                      <span className="font-bold text-[#5c3818]">Tác hại:</span> {drawback}
                    </div>
                  </div>
                )}

                {isValidValue(impact) && (
                  <div className="flex items-start gap-2.5">
                    <SealBullet />
                    <div className="flex-1">
                      <span className="font-bold text-[#5c3818]">Ảnh hưởng:</span> {impact}
                    </div>
                  </div>
                )}

                {isRevValid && (
                  <div className="flex items-start gap-2.5">
                    <SealBullet />
                    <div className="flex-1">
                      <span className="font-bold text-[#5c3818]">Doanh thu:</span>{" "}
                      <span className={`font-serif font-bold text-[17px] ${isNegative ? 'text-rose-900' : 'text-emerald-800'}`}>
                        {rev}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: Góc trái dưới có Con dấu sáp đỏ Asteria 1914, Góc phải dưới có 2 Nút Duyệt / Không Duyệt */}
              <div className="pt-3 flex items-center justify-between border-t border-[#b8a690]">
                {/* Góc trái dưới: Con dấu sáp không che nội dung */}
                <div className="flex items-center gap-2">
                  <RedWaxSeal className="w-14 h-14 shrink-0 drop-shadow-md" />
                </div>

                {/* Góc phải dưới: 2 Nút Duyệt / Suy nghĩ thêm */}
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => setSelectedChoiceForDetail(null)}
                    className="py-2 px-5 rounded bg-[#7a5538] hover:bg-[#65442a] text-white font-mono font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_#422316] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                  >
                    SUY NGHĨ THÊM
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={() => handleConfirmChoice(choice)}
                    className="py-2 px-6 rounded bg-[#1e7e34] hover:bg-[#19692c] text-white font-mono font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_#11451d] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer flex items-center gap-1.5"
                  >
                    <span>✓ DUYỆT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Watermark 16:9 Letterbox */}
      <aside className="fixed bottom-1.5 right-2 font-mono text-[9px] text-[#8c6721]/50 tracking-wider pointer-events-none select-none z-50">
        ASTERIA 1914 • TỈ LỆ CỐ ĐỊNH 16:9 (LETTERBOXED)
      </aside>

    </div>
  );
}
