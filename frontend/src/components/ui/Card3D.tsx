'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Card3DProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  depth?: number;
}

export default function Card3D({ children, style, depth = 30 }: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw Motion Values for cursor position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth Springs for fluid 3D physics
  const mouseX = useSpring(x, { stiffness: 400, damping: 25 });
  const mouseY = useSpring(y, { stiffness: 400, damping: 25 });

  // Map mouse movement to 3D rotation angles
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]);

  // Dynamic light glare position
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to center of card (-0.5 to 0.5)
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;

    x.set(relativeX);
    y.set(relativeY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        width: '100%'
      }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          backgroundColor: 'var(--bg-card)',
          border: isHovered
            ? '1px solid rgba(16, 185, 129, 0.45)'
            : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: isHovered
            ? '0 20px 35px -10px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.2)'
            : 'var(--shadow-md)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          ...style
        }}
      >
        {/* Dynamic Specular Light Glare Overlay */}
        {isHovered && (
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              background: `radial-gradient(circle at ${glareX.get()} ${glareY.get()}, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 70%)`,
              zIndex: 10
            }}
          />
        )}

        {/* 3D Content Container with Z-Axis Depth */}
        <div style={{ transform: `translateZ(${depth}px)`, transformStyle: 'preserve-3d' }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
