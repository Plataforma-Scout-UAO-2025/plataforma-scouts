import React from 'react';

interface FullScreenErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const FullScreenError: React.FC<FullScreenErrorProps> = ({ message = 'Ocurrió un error', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-4 text-center px-4 animate-fade-in">
      <div className="h-10 w-10 border-4 border-destructive/30 border-t-destructive rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90 transition"
        >
          Reintentar
        </button>
      )}
    </div>
  );
};

export default FullScreenError;
