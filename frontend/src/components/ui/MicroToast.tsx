'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface MicroToastProps {
  message: string | null;
  type?: 'success' | 'error';
  onClose?: () => void;
}

export default function MicroToast({ message, type = 'success', onClose }: MicroToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: type === 'success' ? '#065f46' : '#991b1b',
            color: '#ffffff',
            padding: '0.65rem 1.25rem',
            borderRadius: '9999px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {type === 'success' ? (
            <motion.div initial={{ rotate: -45, scale: 0.5 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
              <CheckCircle2 size={18} />
            </motion.div>
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
