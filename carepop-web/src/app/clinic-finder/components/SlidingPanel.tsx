'use client';

import React, { ReactNode, useEffect, useRef } from 'react';
import { motion, useAnimation, useMotionValue, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

export type PanelState = 'collapsed' | 'partial' | 'full';

interface SlidingPanelProps {
  children: ReactNode;
  panelState: PanelState;
  setPanelState: (state: PanelState) => void;
}

const PANEL_HEIGHTS = {
  full: typeof window !== 'undefined' ? window.innerHeight - 80 : 800,
  partial: typeof window !== 'undefined' ? window.innerHeight * 0.45 : 400,
  collapsed: 88,
};

export default function SlidingPanel({
  children,
  panelState,
  setPanelState,
}: SlidingPanelProps) {
  const controls = useAnimation();
  const y = useMotionValue(PANEL_HEIGHTS[panelState]);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newY = PANEL_HEIGHTS[panelState];
    if (newY !== undefined) {
      y.set(newY);
      controls.start({ height: newY });
    }
  }, [panelState, controls, y]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const currentHeight = y.get();

    if (velocity.y > 500 || (offset.y > 0 && currentHeight < PANEL_HEIGHTS.partial * 1.2)) {
      if (panelState === 'full') setPanelState('partial');
      else setPanelState('collapsed');
    } else if (velocity.y < -500 || (offset.y < 0 && currentHeight > PANEL_HEIGHTS.collapsed * 1.5)) {
      if (panelState === 'collapsed') setPanelState('partial');
      else setPanelState('full');
    } else {
      const { full, partial, collapsed } = PANEL_HEIGHTS;
      const distances = [
        { state: 'full', dist: Math.abs(currentHeight - full) },
        { state: 'partial', dist: Math.abs(currentHeight - partial) },
        { state: 'collapsed', dist: Math.abs(currentHeight - collapsed) },
      ];
      const closestState = distances.sort((a, b) => a.dist - b.dist)[0].state as PanelState;
      setPanelState(closestState);
    }
  };

  const handleTapDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newHeight = window.innerHeight - info.point.y;
    const clampedHeight = Math.max(PANEL_HEIGHTS.collapsed, Math.min(newHeight, PANEL_HEIGHTS.full));
    y.set(clampedHeight);
    controls.start({ height: clampedHeight }, { duration: 0 });
  };

  return (
    <motion.div
      ref={panelRef}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ height: y, bottom: 0, left: 0, right: 0 }}
      className="fixed z-40 bg-white dark:bg-gray-900 shadow-[0_-5px_25px_-5px_rgba(0,0,0,0.1)] rounded-t-2xl flex flex-col"
    >
      <motion.div
        onPan={handleTapDrag}
        onPanEnd={handleDragEnd}
        onClick={() => { if (panelState === 'collapsed') setPanelState('partial'); }}
        className="w-full h-8 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </motion.div>

      <div className={cn("flex-grow overflow-hidden", panelState === 'collapsed' && "opacity-0 transition-opacity duration-200")}>
        {children}
      </div>
    </motion.div>
  );
} 