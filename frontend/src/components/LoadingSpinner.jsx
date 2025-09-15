import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ 
  size = 'default', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    default: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
      {showText && text && (
        <p className={`mt-2 text-slate-400 ${textSizeClasses[size]}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export function LoadingOverlay({ 
  isVisible, 
  text = 'Loading...', 
  className = '' 
}) {
  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center ${className}`}>
      <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingButton({ 
  isLoading, 
  children, 
  loadingText = 'Loading...',
  ...props 
}) {
  return (
    <button 
      {...props}
      disabled={isLoading || props.disabled}
      className={`${props.className} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
}
