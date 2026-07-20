import React from 'react';
import { motion } from 'motion/react';
import { AppleButton } from './Shared';

interface HeroProps {
  onNavigate?: () => void;
}

export function Hero({ onNavigate }: HeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-12 md:mt-24 mb-8 text-center flex flex-col items-center px-10 relative z-[1]"
    >
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tighter leading-none"
      >
        <span className="block animate-shiny mt-1 md:mt-2">ZivAI</span>
      </motion.h1>
      <div className="mt-6 md:mt-8 flex flex-col items-center gap-3">
        <AppleButton label="ورود به زیوای" onNavigate={onNavigate} />
      </div>
    </motion.section>
  );
}
