interface BackdropProps {
  onClick: () => void;
  className?: string;
}

export function Backdrop({ onClick, className = '' }: BackdropProps) {
  return (
    <div
      className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-in fade-in duration-150 ${className}`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
