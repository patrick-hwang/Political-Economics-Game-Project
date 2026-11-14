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
  let initRunningBudget = 1000000;
  for (const ctx of (screen.contexts || [])) {
    const ctxRev = parseRevenue(ctx.revenue);
    ctx.budget_before = initRunningBudget;
    initRunningBudget += ctxRev;
    ctx.budget_after = initRunningBudget;
  }
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
  const graph = await getLocalGraph();
  const choice = graph ? graph.get(Number(choiceNodeId)) : null;
  const oldBudget = session.budget ?? 1000000;
  const choiceRev = parseRevenue(choice?.revenue_million || choice?.revenue);
  const choiceBudgetAfter = oldBudget + choiceRev;

  const choiceResultNode = choice ? {
    node: Number(choice.node),
    type: "choice_result",
    isChoiceResult: true,
    content: choice.content || "",
    benefits: choice.benefits || "",
    potential_drawback: choice["potential drawback"] || "",
    impact: choice.impact || "",
    revenue: choice.revenue || (choice.revenue_million ? `+$${choice.revenue_million} million` : ""),
    budget_before: oldBudget,
    budget_after: choiceBudgetAfter,
  } : null;

  if (session.isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${session.session_id}/choose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice_node_id: choiceNodeId })
      });
      if (res.ok) {
        const data = await res.json();
        // Luôn đảm bảo node kết quả phương án xuất hiện đầu tiên trong danh sách contexts
        if (choiceResultNode && (!data.screen.contexts || data.screen.contexts.length === 0 || Number(data.screen.contexts[0]?.node) !== Number(choiceNodeId))) {
          data.screen.contexts = [choiceResultNode, ...(data.screen.contexts || [])];
        }
        // Gán tuần tự budget_before và budget_after cho toàn bộ contexts để mọi trang đều hiển thị số tiền chính xác
        let running = choiceBudgetAfter;
        for (let i = 0; i < (data.screen.contexts || []).length; i++) {
          const ctx = data.screen.contexts[i];
          if (ctx.isChoiceResult) {
            ctx.budget_before = oldBudget;
            ctx.budget_after = choiceBudgetAfter;
            running = choiceBudgetAfter;
          } else {
            const ctxRev = parseRevenue(ctx.revenue);
            ctx.budget_before = running;
            running += ctxRev;
            ctx.budget_after = running;
          }
        }
        return { ...data, isBackend: true };
      }
    } catch (err) {
      console.error("Backend choose error, falling back to local resolver:", err);
    }
  }

  // Local fallback with accurate revenue delta (choice revenue + context revenues)
  const nextTarget = Number(choice["next node"]?.[0] || 1);
  const newScreen = resolveScreenLocally(graph, nextTarget);

  let runningBudget = choiceBudgetAfter;
  for (const ctx of (newScreen.contexts || [])) {
    const ctxRev = parseRevenue(ctx.revenue);
    ctx.budget_before = runningBudget;
    runningBudget += ctxRev;
    ctx.budget_after = runningBudget;
  }

  const contextRev = (newScreen.contexts || []).reduce((acc, ctx) => acc + parseRevenue(ctx.revenue), 0);
  const newBudget = oldBudget + choiceRev + contextRev;

  if (choiceResultNode) {
    newScreen.contexts = [choiceResultNode, ...(newScreen.contexts || [])];
  }

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
 * Gửi tin nhắn đàm thoại tới Cố vấn AI Friedrich (Backend tự quyết định xử lý).
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
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend chat request failed:", err);
    }
  }

  // Chế độ ngoại tuyến khi không kết nối Backend
  const currentHistory = localChatStore.get(sessionId) || [DEFAULT_GREETING];
  const userMsg = { role: 'user', content: message };
  const assistantMsg = { 
    role: 'assistant', 
    content: 'Cố vấn Friedrich chỉ có thể đàm thoại trực tiếp khi máy chủ Backend AI đang hoạt động.' 
  };
  const updatedMessages = [...currentHistory, userMsg, assistantMsg];
  localChatStore.set(sessionId, updatedMessages);

  return {
    messages: updatedMessages,
    ai_available: false
  };
}

/**
 * Lấy lịch sử đàm thoại của phiên chơi hiện tại (từ Backend).
 */
export async function getChatHistory(sessionOrId) {
  const { sessionId, isBackend } = resolveSessionIdAndMode(sessionOrId);

  if (isBackend) {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}/chat`);
      if (res.ok) {
        const data = await res.json();
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend getChatHistory request failed:", err);
    }
  }

  const msgs = localChatStore.get(sessionId) || [DEFAULT_GREETING];
  return {
    messages: msgs,
    ai_available: false
  };
}

/**
 * Giải thích quyết định / kết cục hiện tại (Backend tự xử lý logic AI).
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
        data.messages = ensureGreetingMessage(data.messages);
        return data;
      }
    } catch (err) {
      console.warn("Backend explainDecision request failed:", err);
    }
  }

  const currentHistory = localChatStore.get(sessionId) || [DEFAULT_GREETING];
  const assistantMsg = { 
    role: 'assistant', 
    content: 'Chức năng cố vấn giải thích kết cục bằng AI yêu cầu kết nối với máy chủ Backend.' 
  };
  const updatedMessages = [...currentHistory, assistantMsg];
  localChatStore.set(sessionId, updatedMessages);

  return {
    messages: updatedMessages,
    ai_available: false
  };
}
