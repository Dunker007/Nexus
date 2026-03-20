import { useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export default function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="h-full w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      {children}
    </div>
  );
}
