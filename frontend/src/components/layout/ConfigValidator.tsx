/**
 * Componente de validación de configuración
 * Muestra errores si las variables de entorno no están configuradas correctamente
 */

import React from 'react';
import { useConfigValidation } from '@/hooks/useTenantConfig';

interface ConfigValidatorProps {
  children: React.ReactNode;
  showWarnings?: boolean;
}

export const ConfigValidator: React.FC<ConfigValidatorProps> = ({ 
  children, 
  showWarnings = true 
}) => {
  const { isValid, errors } = useConfigValidation();

  if (!isValid && showWarnings) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <div className="bg-red-100 rounded-full p-2 mr-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Configuración Requerida
            </h2>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-3">
              Para usar la aplicación, necesitas configurar las siguientes variables en tu archivo <code className="bg-gray-100 px-1 rounded">.env.local</code>:
            </p>
            
            <ul className="space-y-2">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-sm text-gray-700">{error}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
            <div className="text-sm">
              <p className="text-blue-700 font-medium mb-1">Pasos para configurar:</p>
              <ol className="text-blue-600 space-y-1 ml-4">
                <li>1. Copia el archivo <code>.env.local.template</code></li>
                <li>2. Renómbralo a <code>.env.local</code></li>
                <li>3. Configura tus valores reales</li>
                <li>4. Reinicia el servidor de desarrollo</li>
              </ol>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Recargar Página
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};