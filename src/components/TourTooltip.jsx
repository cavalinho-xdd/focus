import React from 'react';
import { motion } from 'framer-motion';

export default function TourTooltip({
  index,
  step,
  size,
  tooltipProps,
  primaryProps,
  skipProps,
  isLastStep,
}) {
  const originMap = {
    top: 'bottom center',
    bottom: 'top center',
    left: 'right center',
    right: 'left center',
  };
  const transformOrigin = originMap[step.placement] || 'center';

  return (
    <motion.div
      style={{ transformOrigin }}
      {...tooltipProps}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#0c0b18] border border-white/10 rounded-2xl p-6 w-[340px] shadow-2xl backdrop-blur-xl relative"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white font-bold text-[1.1rem] tracking-tight">{step.title}</h3>
        <span className="text-xs text-focus-primary font-mono font-bold px-2.5 py-1 bg-focus-primary/10 rounded-md">
          {index + 1} / {size}
        </span>
      </div>
      <p className="text-[#a0a0ab] text-[0.9rem] mb-8 leading-relaxed">
        {step.content}
      </p>
      
      <div className="flex justify-between items-center mt-2">
        <button
          {...skipProps}
          className="text-[#6e6e77] hover:text-white transition-colors text-sm font-medium px-2 py-1 -ml-2"
        >
          Skip
        </button>
        <button
          {...primaryProps}
          className="bg-focus-primary text-white px-6 py-2 rounded-full text-sm font-bold shadow-glow-cta hover:shadow-glow-cta-hover btn-press"
        >
          {isLastStep ? 'Finish' : 'Next'}
        </button>
      </div>
    </motion.div>
  );
}
