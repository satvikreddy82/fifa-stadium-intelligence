'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CustomCursor() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring config for smooth follow
  const springConfig = { damping: 25, stiffness: 400, mass: 0.2 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);
  
  // Trailing ring with softer spring
  const trailingX = useSpring(cursorX, { damping: 30, stiffness: 200, mass: 0.8 });
  const trailingY = useSpring(cursorY, { damping: 30, stiffness: 200, mass: 0.8 });

  useEffect(() => {
    // Only enable on devices with a fine pointer (mouse)
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const clickable = target.closest('a') || target.closest('button') || target.closest('input') || target.closest('[role="button"]') || target.closest('select') || window.getComputedStyle(target).cursor === 'pointer';
      setIsHovering(!!clickable);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @media (pointer: fine) {
          body, a, button, input, select, textarea, label, [role="button"] {
            cursor: none !important;
          }
        }
      `}} />
      
      {/* The Soccer Ball */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden sm:flex items-center justify-center text-3xl"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.3 : 1,
          rotate: isHovering ? 360 : 0,
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 20 },
          rotate: { type: 'spring', stiffness: 100, damping: 10 }
        }}
      >
        <span className="drop-shadow-lg filter">⚽</span>
      </motion.div>
      
      {/* Outer Trailing Ring */}
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 rounded-full border-2 pointer-events-none z-[9998] hidden sm:block"
        style={{
          x: trailingX,
          y: trailingY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? (isHovering ? 0.8 : 0.4) : 0,
        }}
        animate={{
          scale: isClicking ? 0.9 : isHovering ? 1.4 : 1,
          borderColor: isHovering ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.3)',
          backgroundColor: isHovering ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300, damping: 20 },
        }}
      />
    </>
  );
}
