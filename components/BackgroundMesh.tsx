'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { usePerformanceTier } from '@/lib/usePerformanceTier';

/* ─── Seamlessly-tileable SVG paths (viewBox "0 0 4000 1200") ─────────────── */
const L1 = [
  'M 0 220 C 400 60 900 440 1400 260 C 1700 140 1900 200 2000 220 C 2400 60 2900 440 3400 260 C 3700 140 3900 200 4000 220 L 4000 1200 L 0 1200 Z',
  'M 0 220 C 500 380 1000 80 1500 180 C 1750 280 1900 240 2000 220 C 2500 380 3000 80 3500 180 C 3750 280 3900 240 4000 220 L 4000 1200 L 0 1200 Z',
  'M 0 220 C 600 120 1100 400 1600 220 C 1820 120 1960 190 2000 220 C 2600 120 3100 400 3600 220 C 3820 120 3960 190 4000 220 L 4000 1200 L 0 1200 Z',
  'M 0 220 C 400 60 900 440 1400 260 C 1700 140 1900 200 2000 220 C 2400 60 2900 440 3400 260 C 3700 140 3900 200 4000 220 L 4000 1200 L 0 1200 Z',
];
const L2 = [
  'M 0 400 C 400 200 900 620 1400 440 C 1700 300 1900 370 2000 400 C 2400 200 2900 620 3400 440 C 3700 300 3900 370 4000 400 L 4000 1200 L 0 1200 Z',
  'M 0 400 C 500 560 1000 220 1500 360 C 1750 480 1900 430 2000 400 C 2500 560 3000 220 3500 360 C 3750 480 3900 430 4000 400 L 4000 1200 L 0 1200 Z',
  'M 0 400 C 600 280 1100 540 1600 400 C 1820 300 1960 380 2000 400 C 2600 280 3100 540 3600 400 C 3820 300 3960 380 4000 400 L 4000 1200 L 0 1200 Z',
  'M 0 400 C 400 200 900 620 1400 440 C 1700 300 1900 370 2000 400 C 2400 200 2900 620 3400 440 C 3700 300 3900 370 4000 400 L 4000 1200 L 0 1200 Z',
];
const L3 = [
  'M 0 580 C 400 380 900 780 1400 620 C 1700 480 1900 550 2000 580 C 2400 380 2900 780 3400 620 C 3700 480 3900 550 4000 580 L 4000 1200 L 0 1200 Z',
  'M 0 580 C 500 740 1000 420 1500 540 C 1750 660 1900 610 2000 580 C 2500 740 3000 420 3500 540 C 3750 660 3900 610 4000 580 L 4000 1200 L 0 1200 Z',
  'M 0 580 C 600 460 1100 700 1600 580 C 1820 460 1960 560 2000 580 C 2600 460 3100 700 3600 580 C 3820 460 3960 560 4000 580 L 4000 1200 L 0 1200 Z',
  'M 0 580 C 400 380 900 780 1400 620 C 1700 480 1900 550 2000 580 C 2400 380 2900 780 3400 620 C 3700 480 3900 550 4000 580 L 4000 1200 L 0 1200 Z',
];
const L4 = [
  'M 0 760 C 400 600 900 900 1400 780 C 1700 660 1900 730 2000 760 C 2400 600 2900 900 3400 780 C 3700 660 3900 730 4000 760 L 4000 1200 L 0 1200 Z',
  'M 0 760 C 500 880 1000 660 1500 720 C 1750 840 1900 790 2000 760 C 2500 880 3000 660 3500 720 C 3750 840 3900 790 4000 760 L 4000 1200 L 0 1200 Z',
  'M 0 760 C 600 660 1100 860 1600 760 C 1820 660 1960 740 2000 760 C 2600 660 3100 860 3600 760 C 3820 660 3960 740 4000 760 L 4000 1200 L 0 1200 Z',
  'M 0 760 C 400 600 900 900 1400 780 C 1700 660 1900 730 2000 760 C 2400 600 2900 900 3400 780 C 3700 660 3900 730 4000 760 L 4000 1200 L 0 1200 Z',
];

const SPECTRUM = [
  '#5a0e0e',
  '#0e0e58',
  '#0e520e',
  '#524a0e',
  '#380e52',
  '#52103c',
  '#522208',
  '#0e4448',
  '#5a0e0e',
];

const COLOR_TRANSITION = {
  duration: 160,
  repeat: Infinity,
  ease: 'easeInOut' as const,
  times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1],
};

export function BackgroundMesh() {
  const { tier, isLow, reducedMotion } = usePerformanceTier();
  const [isVisible, setIsVisible] = useState(true);

  // Pause animations when tab is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 1. Low performance tier or reduced motion: lightweight static ambient gradient
  if (isLow || reducedMotion || !isVisible) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 25%, #0e4448 0%, #090B0C 70%)',
        }}
      >
        <div className="absolute inset-x-0 top-0 h-[18vh] bg-gradient-to-b from-black/60 to-transparent" />
      </div>
    );
  }

  // 2. Normal performance tier: 2 wave layers with CSS scroll, no JS path morphing
  if (tier === 'normal') {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ backgroundColor: '#060606' }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scroll-left {
            0%   { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-100vw, 0, 0); }
          }
          @keyframes scroll-right {
            0%   { transform: translate3d(-100vw, 0, 0); }
            100% { transform: translate3d(0, 0, 0); }
          }
          .wave-layer-1 { animation: scroll-left 90s linear infinite; }
          .wave-layer-2 { animation: scroll-right 120s linear infinite; }
        `}} />
        <div className="absolute inset-0 w-[200vw] h-full wave-layer-1" style={{ opacity: 0.4 }}>
          <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
            <path d={L1[0]} fill="#0e4448" />
          </svg>
        </div>
        <div className="absolute inset-0 w-[200vw] h-full wave-layer-2" style={{ opacity: 0.6 }}>
          <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
            <path d={L3[0]} fill="#380e52" />
          </svg>
        </div>
        <div className="absolute inset-x-0 top-0 h-[18vh] bg-gradient-to-b from-black/60 to-transparent" />
      </div>
    );
  }

  // 3. High performance tier: Full 4-layer spectrum morphing wave mesh
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundColor: '#060606' }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll-left {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100vw, 0, 0); }
        }
        @keyframes scroll-right {
          0%   { transform: translate3d(-100vw, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .wave-layer-1 { animation: scroll-left   60s linear infinite; }
        .wave-layer-2 { animation: scroll-right  75s linear infinite; }
        .wave-layer-3 { animation: scroll-left   88s linear infinite; }
        .wave-layer-4 { animation: scroll-right 105s linear infinite; }
      `}} />

      <div className="absolute inset-0 w-[200vw] h-full wave-layer-1" style={{ opacity: 0.30 }}>
        <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
          <motion.path
            animate={{ d: L1, fill: SPECTRUM }}
            transition={{
              d:    { duration: 28, repeat: Infinity, ease: 'easeInOut' },
              fill: COLOR_TRANSITION,
            }}
          />
        </svg>
      </div>

      <div className="absolute inset-0 w-[200vw] h-full wave-layer-2" style={{ opacity: 0.50 }}>
        <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
          <motion.path
            animate={{ d: L2, fill: SPECTRUM }}
            transition={{
              d:    { duration: 35, repeat: Infinity, ease: 'easeInOut' },
              fill: COLOR_TRANSITION,
            }}
          />
        </svg>
      </div>

      <div className="absolute inset-0 w-[200vw] h-full wave-layer-3" style={{ opacity: 0.68 }}>
        <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
          <motion.path
            animate={{ d: L3, fill: SPECTRUM }}
            transition={{
              d:    { duration: 26, repeat: Infinity, ease: 'easeInOut' },
              fill: COLOR_TRANSITION,
            }}
          />
        </svg>
      </div>

      <div className="absolute inset-0 w-[200vw] h-full wave-layer-4" style={{ opacity: 0.85 }}>
        <svg width="100%" height="100%" viewBox="0 0 4000 1200" preserveAspectRatio="none">
          <motion.path
            animate={{ d: L4, fill: SPECTRUM }}
            transition={{
              d:    { duration: 40, repeat: Infinity, ease: 'easeInOut' },
              fill: COLOR_TRANSITION,
            }}
          />
        </svg>
      </div>

      <div className="absolute inset-x-0 top-0 h-[18vh] bg-gradient-to-b from-black/60 to-transparent" />
    </div>
  );
}
