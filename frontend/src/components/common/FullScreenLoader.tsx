import React from 'react';

interface FullScreenLoaderProps {
  message?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({ message = 'Cargando...' }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-4 animate-fade-in">
      <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground animate-pulse px-4 text-center">{message}</p>
    </div>
  );
};

export default FullScreenLoader;
