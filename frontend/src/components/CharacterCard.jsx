import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Award } from 'lucide-react';

export default function CharacterCard({ era = "1914 - 1928: Thế chiến I & Hậu chiến", emotion = "neutral" }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-amber-900/40 rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden group"
    >
      {/* Decorative Art-Deco background glow */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Frame for Character Avatar */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-xl bg-slate-800">
        <motion.img 
          src="/assets/ceo_base.png" 
          alt="CEO Asteria Aviation"
          className="w-full h-full object-cover object-top select-none"
          animate={{
            y: [0, -3, 0],
            scale: [1, 1.01, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Vintage Vignette Overlay */}
        <div className="absolute inset-0 bg-radial from-transparent via-black/10 to-black/40 pointer-events-none" />
        
        {/* Status indicator badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/30 text-[10px] font-mono text-amber-300 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active</span>
        </div>
      </div>

      {/* Character Identity */}
      <div className="mt-4 text-center w-full">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-serif font-semibold tracking-wider">
          <Briefcase className="w-3 h-3" />
          <span>TỔNG GIÁM ĐỐC (CEO)</span>
        </div>

        <h3 className="font-serif font-bold text-lg text-slate-100 mt-1 tracking-wide">
          Asteria Aircraft Corporation
        </h3>

        {/* Timeline Era Tag */}
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400 font-mono bg-slate-800/60 rounded-lg py-1 px-3 border border-slate-700/60">
          <Award className="w-3 h-3 text-amber-400" />
          <span>{era}</span>
        </div>
      </div>
    </motion.div>
  );
}
