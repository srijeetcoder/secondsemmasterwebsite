'use client';

import { useEffect, useState } from 'react';

export type PerformanceTier = 'high' | 'normal' | 'low';

export function usePerformanceTier(): {
  tier: PerformanceTier;
  isLow: boolean;
  reducedMotion: boolean;
} {
  const [tier, setTier] = useState<PerformanceTier>('high');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hasReducedMotion = mediaQuery.matches;
    setReducedMotion(hasReducedMotion);

    // 2. Hardware Capabilities Detection
    const concurrency = navigator.hardwareConcurrency || 4;
    // deviceMemory is supported in Chromium-based browsers
    const memory = (navigator as any).deviceMemory || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const dpr = window.devicePixelRatio || 1;

    let initialTier: PerformanceTier = 'high';

    if (hasReducedMotion || concurrency <= 2 || memory <= 2) {
      initialTier = 'low';
    } else if (concurrency <= 4 || memory <= 4 || (isMobile && dpr > 2)) {
      initialTier = 'normal';
    }

    setTier(initialTier);

    // Add CSS helper classes for immediate hardware fallback styling
    document.documentElement.classList.remove('perf-high', 'perf-normal', 'perf-low');
    document.documentElement.classList.add(`perf-${initialTier}`);

    // 3. Lightweight 1.5s FPS Sampling window
    if (initialTier !== 'low') {
      let frameCount = 0;
      let startTime = performance.now();
      let animId: number;

      const sampleFPS = (now: number) => {
        frameCount++;
        const elapsed = now - startTime;

        if (elapsed >= 1500) {
          const fps = (frameCount * 1000) / elapsed;
          if (fps < 35) {
            setTier('low');
            document.documentElement.classList.remove('perf-high', 'perf-normal');
            document.documentElement.classList.add('perf-low');
          } else if (fps < 50 && initialTier === 'high') {
            setTier('normal');
            document.documentElement.classList.remove('perf-high');
            document.documentElement.classList.add('perf-normal');
          }
        } else {
          animId = requestAnimationFrame(sampleFPS);
        }
      };

      animId = requestAnimationFrame(sampleFPS);

      return () => {
        if (animId) cancelAnimationFrame(animId);
      };
    }
  }, []);

  return {
    tier,
    isLow: tier === 'low',
    reducedMotion,
  };
}
