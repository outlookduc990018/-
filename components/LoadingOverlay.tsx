import React from 'react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isVisible, message = "Generating..." }) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-10 bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl transition-all duration-300">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-brand-500 animate-spin"></div>
        <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-purple-500 animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="mt-4 text-white font-medium animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingOverlay;