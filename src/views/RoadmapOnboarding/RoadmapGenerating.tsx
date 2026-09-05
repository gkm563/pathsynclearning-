"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Network, Clock, Sparkles } from 'lucide-react';

const STEPS = [
  { text: "Analyzing your profile...", icon: Brain, color: "#6c63ff" },
  { text: "Mapping skill dependencies...", icon: Network, color: "#00c9a7" },
  { text: "Calculating learning timeline...", icon: "#f7971e" }, // wait, icon type mismatch, fixed below
  { text: "Building your personalized roadmap...", icon: Sparkles, color: "#6c63ff" }
];

// Re-defining properly
const STEPS_CONFIG = [
  { text: "Analyzing your profile...", icon: Brain, color: "#6c63ff" },
  { text: "Mapping skill dependencies...", icon: Network, color: "#00c9a7" },
  { text: "Calculating learning timeline...", icon: Clock, color: "#f7971e" },
  { text: "Building your personalized roadmap...", icon: Sparkles, color: "#6c63ff" }
];

export default function RoadmapGenerating({
  isOpen,
  onComplete,
  targetCompany,
  targetRole,
}: {
  isOpen: boolean;
  onComplete: () => void;
  targetCompany?: string | null;
  targetRole?: string;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= STEPS_CONFIG.length) {
        clearInterval(interval);
        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setCurrentStep(step);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(10px)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  };

  const CurrentIcon = STEPS_CONFIG[currentStep]?.icon || Sparkles;
  const currentColor = STEPS_CONFIG[currentStep]?.color || '#fff';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={overlayStyle}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <motion.div 
            key={currentStep}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              style={{ padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '50%', border: `2px solid ${currentColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${currentColor}40` }}
            >
              <CurrentIcon size={48} color={currentColor} />
            </motion.div>
            
            <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'Outfit', color: '#fff', textAlign: 'center', maxWidth: 480 }}>
              {targetCompany && currentStep === STEPS_CONFIG.length - 1
                ? `Building your ${targetCompany}${targetRole ? ` ${targetRole}` : ''} roadmap...`
                : STEPS_CONFIG[currentStep]?.text}
            </div>
            {targetCompany && currentStep === 0 ? (
              <div style={{ fontSize: 14, fontFamily: 'Outfit', color: 'rgba(255,255,255,0.75)', textAlign: 'center' }}>
                Matching interview prep and skills to {targetCompany}
              </div>
            ) : null}
          </motion.div>

          <div style={{ width: '300px', height: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '3px', marginTop: '48px', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / STEPS_CONFIG.length) * 100}%` }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              style={{ height: '100%', backgroundColor: currentColor, borderRadius: '3px' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
