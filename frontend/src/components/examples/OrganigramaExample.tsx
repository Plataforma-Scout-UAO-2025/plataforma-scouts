import React, { useEffect, useState } from 'react';
import { getOrganigrama, getAllSections, createSection, updateSection, deleteSection, getAllSubgroups, createSubgroup, updateSubgroup, deleteSubgroup, uploadFile, checkHealth } from '@/api/organigramaApi';
import type { Section, Subgroup, CreateSectionRequest, CreateSubgroupRequest } from '@/api/organigramaApi';

/**
 * Componente de ejemplo que demuestra el uso de la API centralizada de organigrama
 * Sigue el patrón de la guía: usar directamente las funciones importadas de organigramaApi
 */
const OrganigramaExample: React.FC = () => {
  const [data, setData] = useState(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [subgroups, setSubgroups] = useState<Subgroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configuración del tenant y group (en un app real, vendrían de context/props)
  const tenantSlug = 'region-valle';
  const groupSlug = 'grupo-1';

  // ==================== OBTENER DATOS ====================

  const fetchOrganigrama = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📋 Obteniendo organigrama completo...');
      const organigrama = await getOrganigrama();
      setData(organigrama);
      console.log('✅ Organigrama obtenido:', organigrama);
    } catch (error) {
      console.error('❌ Error obteniendo organigrama:', error);
      setError('Error obteniendo organigrama');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📋 Obteniendo secciones...');
      const sectionsData = await getAllSections(tenantSlug, groupSlug);
      setSections(sectionsData);
      console.log('✅ Secciones obtenidas:', sectionsData.length);
    } catch (error) {
      console.error('❌ Error obteniendo secciones:', error);
      setError('Error obteniendo secciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubgroups = async (sectionId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`📋 Obteniendo subgrupos de la sección ${sectionId}...`);
      const subgroupsData = await getAllSubgroups(tenantSlug, groupSlug, sectionId);
      setSubgroups(subgroupsData);
      console.log('✅ Subgrupos obtenidos:', subgroupsData.length);
    } catch (error) {
      console.error('❌ Error obteniendo subgrupos:', error);
      setError('Error obteniendo subgrupos');
    } finally {
      setLoading(false);
    }
  };

  const testHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🏥 Probando health check...');
      const health = await checkHealth();
      console.log('✅ Health check exitoso:', health);
      alert(`Health Check: ${health.status} - ${health.message}`);
    } catch (error) {
      console.error('❌ Error en health check:', error);
      setError('Error en health check');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREAR DATOS ====================

  const handleCreateSection = async () => {
    if (!confirm('¿Crear una nueva sección de ejemplo?')) return;

    setLoading(true);
    setError(null);
    try {
      const newSection: CreateSectionRequest = {
        sectionId: 0, // Auto-generado por el backend
        tenantId: tenantSlug,
        groupId: 1, // En un app real, obtener del context
        name: `Nueva Sección ${Date.now()}`,
        description: 'Descripción de ejemplo creada con API centralizada',
        iconObjectId: '',
        photoPrincipal: '',
        galleryObjectIds: []
      };

      console.log('➕ Creando nueva sección...');
      const created = await createSection(tenantSlug, groupSlug, newSection);
      setSections(prev => [...prev, created]);
      console.log('✅ Sección creada:', created);
      alert(`Sección "${created.name}" creada exitosamente`);
    } catch (error) {
      console.error('❌ Error creando sección:', error);
      setError('Error creando sección');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubgroup = async (sectionId: number) => {
    if (!confirm('¿Crear un nuevo subgrupo de ejemplo?')) return;

    setLoading(true);
    setError(null);
    try {
      const newSubgroup: CreateSubgroupRequest = {
        subgroupId: 0,
        tenantId: tenantSlug,
        groupId: 1,
        sectionId: sectionId,
        name: `Nuevo Subgrupo ${Date.now()}`,
        description: 'Subgrupo de ejemplo creado con API centralizada',
        photoPrincipal: '',
        isActive: true
      };

      console.log(`➕ Creando nuevo subgrupo en sección ${sectionId}...`);
      const created = await createSubgroup(tenantSlug, groupSlug, sectionId, newSubgroup);
      setSubgroups(prev => [...prev, created]);
      console.log('✅ Subgrupo creado:', created);
      alert(`Subgrupo "${created.name}" creado exitosamente`);
    } catch (error) {
      console.error('❌ Error creando subgrupo:', error);
      setError('Error creando subgrupo');
    } finally {
      setLoading(false);
    }
  };

  // ==================== ACTUALIZAR DATOS ====================

  const handleUpdateSection = async (section: Section) => {
    const newName = prompt('Nuevo nombre para la sección:', section.name);
    if (!newName || newName === section.name) return;

    setLoading(true);
    setError(null);
    try {
      const updates: CreateSectionRequest = {
        ...section,
        name: newName,
        description: section.description + ' (Actualizada con API centralizada)'
      };

      console.log(`✏️ Actualizando sección ${section.sectionId}...`);
      const updated = await updateSection(tenantSlug, groupSlug, section.sectionId, updates);
      setSections(prev => prev.map(s => s.sectionId === section.sectionId ? updated : s));
      console.log('✅ Sección actualizada:', updated);
      alert(`Sección actualizada a "${updated.name}"`);
    } catch (error) {
      console.error('❌ Error actualizando sección:', error);
      setError('Error actualizando sección');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubgroup = async (subgroup: Subgroup) => {
    const newName = prompt('Nuevo nombre para el subgrupo:', subgroup.name);
    if (!newName || newName === subgroup.name) return;

    setLoading(true);
    setError(null);
    try {
      const updates: CreateSubgroupRequest = {
        ...subgroup,
        name: newName,
        description: subgroup.description + ' (Actualizado con API centralizada)'
      };

      console.log(`✏️ Actualizando subgrupo ${subgroup.subgroupId}...`);
      const updated = await updateSubgroup(tenantSlug, groupSlug, subgroup.sectionId, subgroup.subgroupId, updates);
      setSubgroups(prev => prev.map(sg => sg.subgroupId === subgroup.subgroupId ? updated : sg));
      console.log('✅ Subgrupo actualizado:', updated);
      alert(`Subgrupo actualizado a "${updated.name}"`);
    } catch (error) {
      console.error('❌ Error actualizando subgrupo:', error);
      setError('Error actualizando subgrupo');
    } finally {
      setLoading(false);
    }
  };

  // ==================== ELIMINAR DATOS ====================

  const handleDeleteSection = async (section: Section) => {
    if (!confirm(`¿Eliminar la sección "${section.name}"?`)) return;

    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Eliminando sección ${section.sectionId}...`);
      await deleteSection(tenantSlug, groupSlug, section.sectionId);
      setSections(prev => prev.filter(s => s.sectionId !== section.sectionId));
      console.log('✅ Sección eliminada');
      alert(`Sección "${section.name}" eliminada exitosamente`);
    } catch (error) {
      console.error('❌ Error eliminando sección:', error);
      setError('Error eliminando sección');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubgroup = async (subgroup: Subgroup) => {
    if (!confirm(`¿Eliminar el subgrupo "${subgroup.name}"?`)) return;

    setLoading(true);
    setError(null);
    try {
      console.log(`🗑️ Eliminando subgrupo ${subgroup.subgroupId}...`);
      await deleteSubgroup(tenantSlug, groupSlug, subgroup.sectionId, subgroup.subgroupId);
      setSubgroups(prev => prev.filter(sg => sg.subgroupId !== subgroup.subgroupId));
      console.log('✅ Subgrupo eliminado');
      alert(`Subgrupo "${subgroup.name}" eliminado exitosamente`);
    } catch (error) {
      console.error('❌ Error eliminando subgrupo:', error);
      setError('Error eliminando subgrupo');
    } finally {
      setLoading(false);
    }
  };

  // ==================== MANEJO DE ARCHIVOS ====================

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setLoading(true);
      setError(null);
      try {
        console.log('📤 Subiendo archivo...');
        const result = await uploadFile(file);
        console.log('✅ Archivo subido:', result);
        alert(`Archivo subido exitosamente. Object ID: ${result.objectId}`);
      } catch (error) {
        console.error('❌ Error subiendo archivo:', error);
        setError('Error subiendo archivo');
      } finally {
        setLoading(false);
      }
    };
    input.click();
  };

  // ==================== EFECTOS ====================

  useEffect(() => {
    fetchSections();
  }, []);

  // ==================== RENDER ====================

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Ejemplo de API Centralizada - Organigrama</h1>
      
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Cargando...
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      {/* Controles principales */}
      <div className="mb-6 space-x-2 flex flex-wrap gap-2">
        <button
          onClick={fetchOrganigrama}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          disabled={loading}
        >
          📋 Obtener Organigrama
        </button>
        <button
          onClick={fetchSections}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          🔄 Actualizar Secciones
        </button>
        <button
          onClick={handleCreateSection}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={loading}
        >
          ➕ Nueva Sección
        </button>
        <button
          onClick={handleFileUpload}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          disabled={loading}
        >
          📤 Subir Archivo
        </button>
        <button
          onClick={testHealth}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          disabled={loading}
        >
          🏥 Test Health
        </button>
      </div>

      {/* Mostrar datos del organigrama si existen */}
      {data && (
        <div className="mb-6 bg-purple-50 border border-purple-200 rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Datos del Organigrama Completo</h2>
          <pre className="text-sm overflow-auto max-h-40 bg-white p-2 rounded border">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      {/* Panel principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel de secciones */}
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Secciones ({sections.length})</h2>
          
          {sections.length === 0 ? (
            <p className="text-gray-500">No hay secciones disponibles</p>
          ) : (
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.sectionId} className="border rounded p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{section.name}</h3>
                      <p className="text-sm text-gray-600">{section.description}</p>
                      <p className="text-xs text-gray-400">ID: {section.sectionId}</p>
                      {section.galleryObjectIds.length > 0 && (
                        <span className="text-xs text-purple-600">
                          Galería: {section.galleryObjectIds.length} imagen(es)
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedSection(section);
                          fetchSubgroups(section.sectionId);
                        }}
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded text-sm"
                        title="Ver subgrupos"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleUpdateSection(section)}
                        className="text-green-500 hover:bg-green-50 p-1 rounded text-sm"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteSection(section)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded text-sm"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de subgrupos */}
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Subgrupos ({subgroups.length})
            </h2>
            {selectedSection && (
              <button
                onClick={() => handleCreateSubgroup(selectedSection.sectionId)}
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                disabled={loading}
              >
                ➕ Nuevo
              </button>
            )}
          </div>
          
          {selectedSection ? (
            <div>
              <p className="text-sm text-gray-600 mb-3">
                Sección: <strong>{selectedSection.name}</strong>
              </p>
              
              {subgroups.length === 0 ? (
                <p className="text-gray-500">No hay subgrupos en esta sección</p>
              ) : (
                <div className="space-y-2">
                  {subgroups.map((subgroup) => (
                    <div key={subgroup.subgroupId} className="border rounded p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{subgroup.name}</h4>
                          <p className="text-sm text-gray-600">{subgroup.description}</p>
                          <p className="text-xs text-gray-400">ID: {subgroup.subgroupId}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            subgroup.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {subgroup.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateSubgroup(subgroup)}
                            className="text-green-500 hover:bg-green-50 p-1 rounded text-sm"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSubgroup(subgroup)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded text-sm"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Selecciona una sección para ver sus subgrupos</p>
          )}
        </div>
      </div>

      {/* Información de depuración */}
      <div className="mt-6 bg-gray-100 rounded p-4">
        <h3 className="font-semibold mb-2">Información de Depuración</h3>
        <p className="text-sm text-gray-600">
          <strong>Tenant:</strong> {tenantSlug} | <strong>Group:</strong> {groupSlug}
        </p>
        <p className="text-sm text-gray-600">
          Abre la consola del navegador para ver los logs detallados de las llamadas API.
        </p>
        <p className="text-sm text-gray-600">
          Este componente demuestra el uso directo de las funciones de la API centralizada.
        </p>
      </div>
    </div>
  );
};

export default OrganigramaExample;