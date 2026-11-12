import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, HelpCircle } from 'lucide-react';

export default function StoryCard({ contexts = [], question }) {
  return (
    <div className="flex flex-col gap-4">
      
      {/* Context Narrative paragraphs */}
      <AnimatePresence mode="popLayout">
        {contexts.map((ctx, idx) => (
          <motion.div
            key={`ctx-${ctx.node}-${idx}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.15 }}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg backdrop-blur-sm relative"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-2 uppercase tracking-widest">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bối cảnh thời kỳ • Node #{ctx.node}</span>
            </div>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-sans">
              {ctx.content}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Decision Question */}
      {question && (
        <motion.div
          key={`q-${question.node}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center gap-2 text-xs font-mono text-amber-300 mb-2 uppercase tracking-widest">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Quyết định chiến lược • Q{question.node}</span>
          </div>

          <h2 className="text-base sm:text-lg lg:text-xl font-serif font-bold text-amber-100 leading-snug">
            {question.content}
          </h2>
        </motion.div>
      )}

    </div>
  );
}
