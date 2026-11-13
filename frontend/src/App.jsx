import React, { useState } from 'react';
import StartMenu from './components/StartMenu';
import ExecutiveLedger from './components/ExecutiveLedger';
import { createSession, submitChoice } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [characterGender, setCharacterGender] = useState('male');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Step-by-step context progression
  const [contextIndex, setContextIndex] = useState(0);

  // Filter out empty or trivial "Start" contexts
  const getCleanContexts = (contexts = []) => {
    return (contexts || []).filter(c => c && c.content && c.content.trim().toLowerCase() !== "start");
  };

  const initGame = async () => {
    setLoading(true);
    setContextIndex(0);
    try {
      const data = await createSession();
      setSession(data);
    } catch (err) {
      console.error("Failed to init game:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = ({ gender }) => {
    setCharacterGender(gender);
    setGameState('playing');
    initGame();
  };

  const handleRestart = () => {
    setGameState('menu');
    setSession(null);
    setContextIndex(0);
  };

  const handleSelectChoice = async (choice) => {
    if (!session || !choice) return;
    try {
      setLoading(true);
      const updated = await submitChoice(session, choice.node);
      setSession(updated);
      setContextIndex(0); // Reset context step for new screen
    } catch (err) {
      console.error("Failed to submit choice:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Start Menu view: Leather Tome Cover
  if (gameState === 'menu') {
    return <StartMenu onStartGame={handleStartGame} />;
  }

  // 2. Initial Loading state
  if (loading && !session) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#0c0e12] text-[#f4ecd8] font-serif">
        <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin mb-3" />
        <h2 className="font-black text-xl text-[#d4af37]">
          Đang mở Sổ Cái Asteria (1914)...
        </h2>
        <p className="text-xs text-[#a48a73] mt-1 font-mono">
          Nạp 28 nodes kịch bản Nhánh 1 • Kinh tế chính trị Mác - Lênin
        </p>
      </div>
    );
  }

  // 3. Playing view: 2-Page Executive Ledger (The Life and Suffering of Sir Brante style)
  const screen = session?.screen || {};
  const cleanContexts = getCleanContexts(screen.contexts);
  const isReadingContext = cleanContexts.length > 0 && contextIndex < cleanContexts.length;
  const currentContext = isReadingContext ? cleanContexts[contextIndex] : null;

  // Outcome screen is displayed ONLY after all intermediate contexts have been read
  const isOutcome = !isReadingContext && Boolean(screen.outcome);

  const effectiveNodeId = currentContext 
    ? currentContext.node 
    : (screen.question ? screen.question.node : (session?.current_node || 1));

  return (
    <ExecutiveLedger
      session={session}
      currentNodeId={effectiveNodeId}
      currentContext={currentContext}
      contextIndex={contextIndex}
      totalContexts={cleanContexts.length}
      onNextContext={() => setContextIndex(prev => prev + 1)}
      question={!isReadingContext ? screen.question : null}
      choices={!isReadingContext ? (screen.choices || []) : []}
      onSelectChoice={handleSelectChoice}
      outcome={isOutcome ? screen.outcome : null}
      budget={session?.budget ?? 1000000}
      gender={characterGender}
      historyLength={session?.history?.length || 0}
      onRestart={handleRestart}
    />
  );
}
