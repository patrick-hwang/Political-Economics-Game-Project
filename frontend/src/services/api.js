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
