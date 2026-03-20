import { motion } from 'motion/react';

interface BackdropProps {
  onClick: () => void;
  className?: string;
}

export function Backdrop({ onClick, className = '' }: BackdropProps) {
  return (
    <motion.div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
