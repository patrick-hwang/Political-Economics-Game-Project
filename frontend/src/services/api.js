// Dual-mode Game Service: Connects to FastAPI Backend, with robust offline graph fallback

// Browser requests use the public route; runtime service bindings are server-only.
const API_BASE = "/api";

let localGraph = null;

// Parse strings like '+$3.2 million', '-$2 million', '+$50 million', '$250,000'
export function parseRevenue(raw) {
  if (raw === null || raw === undefined || raw === "") return 0;
  if (typeof raw === "number") return raw;

  const text = String(raw).trim().toLowerCase();
  const sign = text.startsWith("-") ? -1 : 1;
  const match = text.match(/[+-]?\$?\s*([\d,.]+)\s*(million|m|thousand|k)?/);
  if (!match) return 0;

  const value = parseFloat(match[1].replace(/,/g, ""));
  const unit = match[2];
  const multiplier = (unit === "million" || unit === "m")
    ? 1_000_000
    : (unit === "thousand" || unit === "k")
    ? 1_000
    : 1;

  return value * multiplier * sign;
}

export async function getLocalGraph() {
  if (!localGraph) {
    const res = await fetch("/questions_v3.json");
    const data = await res.json();
    localGraph = new Map(data.map(item => {
      const normalizedItem = { ...item };
      for (const [k, v] of Object.entries(normalizedItem)) {
        if (typeof v === 'string') {
          normalizedItem[k] = v.normalize('NFC');
        }
      }
      return [Number(item.node), normalizedItem];
    }));
  }
  return localGraph;
}

// Local fallback resolver
export function resolveScreenLocally(graph, startId) {
  const contexts = [];
  let nodeId = startId;
  const visited = new Set();

  while (true) {
    if (visited.has(nodeId)) break;
    visited.add(nodeId);

    const node = graph.get(nodeId);
    if (!node) break;

    if (node.type === "context") {
      contexts.push(node);
      const next = node["next node"] || [];
      if (next.length > 0) {
        nodeId = Number(next[0]);
        continue;
      }
      break;
    }

    if (node.type === "question") {
      const choices = (node["next node"] || []).map(cid => {
        const c = graph.get(Number(cid));
        if (!c) return null;
        const { "next node": _, ...rest } = c;
        const revValue = parseRevenue(rest.revenue_million || rest.revenue);
        return {
          ...rest,
          revenue_parsed: revValue
        };
      }).filter(Boolean);
      return { contexts, question: node, choices };
    }

    if (node.type === "win" || node.type === "lose") {
      return { contexts, outcome: node };
    }

    break;
  }

  return { contexts, question: null, choices: [] };
}

export async function createSession() {
  try {
    const res = await fetch(`${API_BASE}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      const data = await res.json();
      return { ...data, isBackend: true };
    }
  } catch (err) {
    console.warn("Backend not reachable, running in offline client graph mode:", err);
  }

  // Fallback to local graph
  const graph = await getLocalGraph();
  const screen = resolveScreenLocally(graph, 1);
  return {
    session_id: "local_session",
    budget: 1000000,
    current_node: screen.question ? screen.question.node : 1,
    history: [],
    screen,
    isBackend: false
  };
}

export async function submitChoice(session, choiceNodeId) {
  if (session.isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${session.session_id}/choose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice_node_id: choiceNodeId })
      });
      if (res.ok) {
        const data = await res.json();
        return { ...data, isBackend: true };
      }
    } catch (err) {
      console.error("Backend choose error, falling back to local resolver:", err);
    }
  }

  // Local fallback with accurate revenue delta (choice revenue + context revenues)
  const graph = await getLocalGraph();
  const choice = graph.get(choiceNodeId);
  const choiceRev = parseRevenue(choice?.revenue_million || choice?.revenue);
  const nextTarget = Number(choice["next node"]?.[0] || 1);
  const newScreen = resolveScreenLocally(graph, nextTarget);
  const contextRev = (newScreen.contexts || []).reduce((acc, ctx) => acc + parseRevenue(ctx.revenue), 0);
  const newBudget = (session.budget || 0) + choiceRev + contextRev;

  return {
    session_id: session.session_id,
    budget: newBudget,
    current_node: newScreen.question ? newScreen.question.node : (newScreen.outcome ? newScreen.outcome.node : nextTarget),
    history: [...(session.history || []), choiceNodeId],
    screen: newScreen,
    isBackend: false
  };
}

// ============================================
// AI ADVISOR (FRIEDRICH) SERVICE & FALLBACK
// ============================================

const localChatStore = new Map();

const DEFAULT_GREETING = {
  role: 'assistant',
  content: 'Chào tổng tài, hôm nay bạn muốn thảo luận với tôi về chủ đề gì?'
};

function ensureGreetingMessage(messages = []) {
  if (!messages || messages.length === 0) {
    return [DEFAULT_GREETING];
  }
  if (messages[0].role !== 'assistant') {
    return [DEFAULT_GREETING, ...messages];
  }
  return messages;
}

function isAIErrorMessage(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  return (
    lower.includes("gemini_api_key") ||
    lower.includes("google-genai") ||
    lower.includes("could not initialize") ||
    lower.includes("unavailable") ||
    lower.includes("api key") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("resourceexhausted")
  );
}

/**
 * Intelligent Marxist-Leninist Political Economy response generator.
 * Used for offline play, fallback, or when Gemini API key is unconfigured.
 */
export function generateSmartAdvisorReply(message = "") {
  const lower = String(message || "").toLowerCase();

  if (lower.includes("kết cục") || lower.includes("giải thích") || lower.includes("thất bại") || lower.includes("chiến thắng")) {
    return "Thưa Tổng tài, nhìn lại toàn bộ chuỗi quyết định của ngài, kết cục hôm nay là sự thể hiện chuẩn xác của các quy luật kinh tế chính trị: việc điều hòa giữa tích tụ tư bản (mở rộng quy mô, mua sắm tư liệu sản xuất c) và duy trì vốn lưu động biến đổi (v) đóng vai trò sống còn. Doanh nghiệp tư bản nào không bắt kịp các bước ngoặt của chu kỳ kinh tế và sự can thiệp của nhà nước độc quyền sẽ tất yếu bị đào thải hoặc thâu tóm bởi các liên minh tư bản lớn hơn!";
  }

  if (lower.includes("phân tích tình hình hiện tại") || lower.includes("sự kiện gần đây") || lower.includes("tình hình")) {
    return "Thưa Tổng tài, nhìn lại toàn bộ biên bản hành trình từ năm 1914 đến nay, Asteria đã liên tục trải qua các nấc thang tích tụ và tập trung tư bản mang tính quy luật: từ bóc lột giá trị thặng dư thời chiến (1914), tái cấu trúc thương mại (1918), đến thâu tóm đối thủ trong Đại suy thoái (1929) và vươn lên thành tập đoàn độc quyền phản lực năm 1945. Mỗi lựa chọn chiến lược của ngài đều phản ánh quy luật <em>cạnh tranh giữa các tổ chức độc quyền</em>: liên minh với nhà nước để được bảo hộ hay phát động chiến tranh giá cả để triệt hạ đối thủ. Hãy luôn kiểm soát thanh khoản và bảo toàn nguồn vốn tư bản trước các cuộc khủng hoảng chu kỳ!";
  }

  if (lower.includes("chiến tranh") || lower.includes("quân sự") || lower.includes("vũ khí") || lower.includes("thế chiến")) {
    return "Thưa Tổng tài, trong thời kỳ đế quốc chủ nghĩa, chiến tranh thế giới gắn liền với việc phân chia lại phạm vi ảnh hưởng của các liên minh độc quyền quốc tế. Đơn đặt hàng quân sự đem lại siêu lợi nhuận độc quyền thời chiến, nhưng doanh nghiệp phải hết sức tỉnh táo để chuyển đổi kịp thời sang thị trường dân dụng, tránh thảm họa dư thừa công suất khi khói lửa chiến tranh chấm dứt!";
  }

  if (lower.includes("công nghệ") || lower.includes("phản lực") || lower.includes("nghiên cứu") || lower.includes("kỹ thuật")) {
    return "Thưa Tổng tài, theo C. Mác, áp dụng kỹ thuật tiên tiến cho phép hạ thấp giá trị cá biệt của hàng hóa xuống dưới giá trị xã hội, mang lại <em>giá trị thặng dư siêu ngạch</em>. Việc Asteria độc quyền hóa công nghệ động cơ phản lực không chỉ giúp thống lĩnh bầu trời mà còn dựng nên hàng rào độc quyền tự nhiên ngăn chặn các đối thủ cạnh tranh mới!";
  }

  if (lower.includes("dầu mỏ") || lower.includes("năng lượng") || lower.includes("opec") || lower.includes("nhiên liệu")) {
    return "Thưa Tổng tài, khủng hoảng dầu mỏ tác động trực tiếp vào bộ phận tư bản bất biến (c) trong chi phí sản xuất. Giá dầu tăng phi mã kéo theo tỷ suất lợi nhuận bình quân giảm sút nghiêm trọng. Tập đoàn nào nhanh chóng đổi mới khí động học và tiết kiệm nhiên liệu sẽ biến khủng hoảng thành bàn đạp thâu tóm các hãng bay kiệt quệ tài chính!";
  }

  if (lower.includes("trợ cấp") || lower.includes("nhà nước") || lower.includes("chính phủ") || lower.includes("wto") || lower.includes("thuế")) {
    return "Thưa Tổng tài, chính xác! Theo V.I. Lênin, trong giai đoạn độc quyền, nhà nước tư sản không còn đứng ngoài thị trường mà trở thành công cụ của các nhóm tài phiệt. Việc các chính phủ can thiệp qua trợ cấp, bảo hộ thuế quan hay kiện tụng thương mại chính là hình thức <em>kết hợp giữa sức mạnh của các tổ chức độc quyền với sức mạnh của bộ máy nhà nước</em> để cạnh tranh và bảo toàn lợi nhuận siêu ngạch độc quyền trên trường quốc tế.";
  }

  if (lower.includes("2008") || lower.includes("khủng hoảng") || lower.includes("suy thoái") || lower.includes("bong bóng") || lower.includes("nợ")) {
    return "Thưa Tổng tài, các cuộc khủng hoảng kinh tế (như Đại suy thoái 1929 hay Bão tài chính 2008) là tính tất yếu chu kỳ của phương thức sản xuất tư bản chủ nghĩa, nảy sinh từ mâu thuẫn sâu sắc giữa tính chất xã hội hóa của sản xuất với chế độ chiếm hữu tư nhân tư bản chủ nghĩa. Khi các tập đoàn sa đà vào đòn bẩy tài chính và chạy đua giá cả, khủng hoảng thanh khoản sẽ bóp nghẹt các mắt xích yếu nhất trong chuỗi tích lũy tư bản!";
  }

  if (lower.includes("giá trị thặng dư") || lower.includes("thặng dư") || lower.includes("bóc lột") || lower.includes("công nhân") || lower.includes("lao động") || lower.includes("tiền lương")) {
    return "Thưa Tổng tài, theo Karl Marx, giá trị thặng dư (m) là cội nguồn duy nhất của mọi sự tích lũy tư bản. Dù ở thời chiến hay thời bình, lợi nhuận ròng mà Asteria thu được thực chất đều kết tinh từ phần lao động không công của đội ngũ công nhân và kỹ sư chế tạo máy bay trong dây chuyền sản xuất.";
  }

  if (lower.includes("độc quyền") || lower.includes("cạnh tranh") || lower.includes("thị phần") || lower.includes("airbus") || lower.includes("giá vé") || lower.includes("giá cả")) {
    return "Thưa Tổng tài, V.I. Lênin đã chỉ rõ: Độc quyền sinh ra từ cạnh tranh tự do, nhưng không thủ tiêu cạnh tranh mà làm cho cạnh tranh trở nên gay gắt, khốc liệt hơn gấp bội. Khi các tập đoàn độc quyền đã làm chủ thị trường nội địa, cuộc chiến giành giật thị trường thế giới thông qua <em>giá cả độc quyền</em> và phân chia lại khu vực ảnh hưởng là quy luật không thể tránh khỏi.";
  }

  if (lower.includes("tư bản tài chính") || lower.includes("ngân hàng") || lower.includes("phố wall") || lower.includes("cổ phiếu")) {
    return "Thưa Tổng tài, sự thâm nhập và dung hợp lẫn nhau giữa tư bản ngân hàng và tư bản công nghiệp tạo nên <em>tư bản tài chính</em>. Đầu sỏ tài chính không chỉ cung cấp tín dụng cho các dự án hàng không của Asteria mà còn nắm quyền chi phối vận mệnh sống còn của cả tập đoàn.";
  }

  return `Thưa Tổng tài, câu hỏi rất thấu đáo! Dưới lăng kính Kinh tế Chính trị Mác - Lênin, mỗi lựa chọn điều hành của ngài tại Asteria đều gắn liền với các quy luật kinh tế khách quan: quy luật giá trị, tích tụ và tập trung tư bản, giá trị thặng dư và phân chia thị trường giữa các liên minh độc quyền. Cố vấn Friedrich tôi luôn túc trực để cùng ngài chèo lái tập đoàn vượt qua mọi thử thách!`;
}

function resolveSessionIdAndMode(sessionOrId) {
  if (typeof sessionOrId === 'object' && sessionOrId !== null) {
    return {
      sessionId: sessionOrId.session_id || 'local_session',
      isBackend: Boolean(sessionOrId.isBackend)
    };
  }
  const strId = String(sessionOrId || 'local_session');
  return {
    sessionId: strId,
    isBackend: strId !== 'local_session'
  };
}

/**
 * Gửi tin nhắn đàm thoại tới Cố vấn AI Friedrich.
 * Hỗ trợ cả 2 chế độ: Online (backend FastAPI + Gemini) và Offline fallback.
 */
export async function sendChatMessage(sessionOrId, message) {
  const { sessionId, isBackend } = resolveSessionIdAndMode(sessionOrId);

  if (isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });

      if (res.ok) {
        const data = await res.json();
        const lastMsg = data.messages?.[data.messages.length - 1];

        // Nếu backend chưa cấu hình GEMINI_API_KEY hoặc ai_available là false,
        // hoặc gặp thông báo lỗi AI từ server, tự động chuyển tiếp sang câu trả lời lý luận thông minh
        if (!data.ai_available || isAIErrorMessage(lastMsg?.content)) {
          const smartReply = generateSmartAdvisorReply(message);
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = smartReply;
          } else {
            data.messages.push({ role: 'assistant', content: smartReply });
          }
        }

        // Đảm bảo tin nhắn chào hỏi của Friedrich luôn mở đầu danh sách
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend chat failed, falling back to local advisor:", err);
    }
  }

  // Chế độ Offline / Client-side fallback
  const currentHistory = localChatStore.get(sessionId) || [DEFAULT_GREETING];

  const userMsg = { role: 'user', content: message };
  const smartReply = generateSmartAdvisorReply(message);
  const assistantMsg = { role: 'assistant', content: smartReply };

  const updatedMessages = [...currentHistory, userMsg, assistantMsg];
  localChatStore.set(sessionId, updatedMessages);

  return {
    messages: updatedMessages,
    ai_available: false
  };
}

/**
 * Lấy lịch sử đàm thoại của phiên chơi hiện tại.
 */
export async function getChatHistory(sessionOrId) {
  const { sessionId, isBackend } = resolveSessionIdAndMode(sessionOrId);

  if (isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}/chat`);
      if (res.ok) {
        const data = await res.json();
        if (!data.messages || data.messages.length === 0) {
          data.messages = [DEFAULT_GREETING];
        } else {
          // Lọc thông điệp lỗi API kỹ thuật nếu có
          data.messages = data.messages.map(m => {
            if (m.role === 'assistant' && isAIErrorMessage(m.content)) {
              return {
                ...m,
                content: generateSmartAdvisorReply("phân tích tình hình hiện tại")
              };
            }
            return m;
          });
        }
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend getChatHistory failed, falling back to local:", err);
    }
  }

  const msgs = localChatStore.get(sessionId) || [DEFAULT_GREETING];

  return {
    messages: msgs,
    ai_available: false
  };
}

/**
 * Giải thích quyết định / kết cục hiện tại bằng AI (nối endpoint POST /api/session/{id}/explain).
 */
export async function explainDecision(sessionOrId) {
  const { sessionId, isBackend } = resolveSessionIdAndMode(sessionOrId);

  if (isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}/explain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (res.ok) {
        const data = await res.json();
        const lastMsg = data.messages?.[data.messages.length - 1];
        if (!data.ai_available || isAIErrorMessage(lastMsg?.content)) {
          const smartReply = generateSmartAdvisorReply("kết cục giải thích quyết định");
          if (lastMsg && lastMsg.role === 'assistant') {
            lastMsg.content = smartReply;
          } else {
            data.messages.push({ role: 'assistant', content: smartReply });
          }
        }
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend explainDecision failed, falling back to local advisor:", err);
    }
  }

  const currentHistory = localChatStore.get(sessionId) || [DEFAULT_GREETING];
  const smartReply = generateSmartAdvisorReply("kết cục giải thích quyết định");
  const assistantMsg = { role: 'assistant', content: smartReply };
  const updatedMessages = [...currentHistory, assistantMsg];
  localChatStore.set(sessionId, updatedMessages);

  return {
    messages: updatedMessages,
    ai_available: false
  };
}
