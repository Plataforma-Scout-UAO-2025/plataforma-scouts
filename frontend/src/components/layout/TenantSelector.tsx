/**
 * Componente para configuración dinámica de tenant y group
 * Permite cambiar organización sin editar archivos .env
 */

import React, { useState } from 'react';
import { useTenantConfig, useAvailableTenants } from '@/hooks/useTenantConfig';

interface TenantSelectorProps {
  onConfigChange?: (tenant: string, group: string) => void;
}

export const TenantSelector: React.FC<TenantSelectorProps> = ({ onConfigChange }) => {
  const config = useTenantConfig({ 
    allowManualOverride: true,
    allowUrlOverride: true 
  });
  
  const { tenants, loading, fetchTenants } = useAvailableTenants();
  const [isOpen, setIsOpen] = useState(false);
  const [tempTenant, setTempTenant] = useState(config.tenantSlug);
  const [tempGroup, setTempGroup] = useState(config.groupSlug);

  React.useEffect(() => {
    fetchTenants();
  }, []);

  const handleApplyConfig = () => {
    if (tempTenant && tempGroup) {
      config.setTenantSlug(tempTenant);
      config.setGroupSlug(tempGroup);
      onConfigChange?.(tempTenant, tempGroup);
      setIsOpen(false);
    }
  };

  const handleReset = () => {
    config.resetToEnv();
    setTempTenant(import.meta.env.VITE_TENANT_SLUG || '');
    setTempGroup(import.meta.env.VITE_GROUP_SLUG || '');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Indicador de configuración actual */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm
          ${config.isConfigured 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
          }
        `}
      >
        <div className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="font-medium">
          {config.isConfigured 
            ? `${config.tenantSlug} / ${config.groupSlug}`
            : 'Sin configurar'
          }
        </span>
        <span className="text-xs opacity-60">({config.source})</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Panel de configuración */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">
              Configuración de Organización
            </h3>
            
            {/* Selector de Tenant */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant/Organización
              </label>
              <select
                value={tempTenant}
                onChange={(e) => setTempTenant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                aria-label="Seleccionar tenant u organización"
                title="Seleccionar tenant u organización"
              >
                <option value="">Seleccionar tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.slug} value={tenant.slug}>
                    {tenant.name} ({tenant.slug})
                  </option>
                ))}
              </select>
            </div>

            {/* Input de Group */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grupo Scout
              </label>
              <input
                type="text"
                value={tempGroup}
                onChange={(e) => setTempGroup(e.target.value)}
                placeholder="ej: grupo-scout-centinelas-113"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                El slug del grupo debe existir en la base de datos
              </p>
            </div>

            {/* Información actual */}
            <div className="bg-gray-50 rounded-md p-3 mb-4">
              <p className="text-xs text-gray-600 mb-1">Configuración actual:</p>
              <p className="text-sm font-mono">
                <span className="text-blue-600">{config.tenantSlug}</span> / 
                <span className="text-green-600">{config.groupSlug}</span>
              </p>
              <p className="text-xs text-gray-500">Origen: {config.source}</p>
            </div>

            {/* Botones */}
            <div className="flex space-x-2">
              <button
                onClick={handleApplyConfig}
                disabled={!tempTenant || !tempGroup}
                className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Reset a .env
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Componente de información de configuración para developers
 */
export const ConfigInfo: React.FC = () => {
  const config = useTenantConfig();
  
  if (!config.isConfigured) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Configuración requerida:</strong> {config.configError}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Edita tu archivo .env con valores válidos para VITE_TENANT_SLUG y VITE_GROUP_SLUG
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700">
            <strong>Configuración válida:</strong> {config.tenantSlug} / {config.groupSlug}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Origen: {config.source} | Todas las APIs funcionarán correctamente
          </p>
        </div>
      </div>
    </div>
  );
};