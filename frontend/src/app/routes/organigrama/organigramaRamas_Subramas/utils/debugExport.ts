// Utilidad para debugear y verificar los datos del backend
import { getRamasWithSubramas } from '../services';

export async function debugBackendData(tenantSlug: string, groupSlug: string) {
  console.log('🔍 [Debug] Verificando datos del backend...');
  
  try {
    const ramas = await getRamasWithSubramas(tenantSlug, groupSlug);
    
    console.log('📊 [Debug] Datos obtenidos del backend:');
    console.log('📊 [Debug] Total de ramas:', ramas.length);
    
    ramas.forEach((rama, index) => {
      console.log(`📝 [Debug] Rama ${index + 1}:`, {
        id: rama.id,
        name: rama.name ?? rama.nombre,
        description: rama.description,
        descripcionLegacy: (rama as { descripcion?: string }).descripcion,
        minAge: rama.minAge,
        maxAge: rama.maxAge,
        hasDescription: Boolean(rama.description ?? (rama as { descripcion?: string }).descripcion),
        subramasCount: rama.subramas?.length ?? 0
      });
      
      // También revisar subramas
      if (rama.subramas && rama.subramas.length > 0) {
        rama.subramas.forEach((subrama, sIndex) => {
          console.log(`  🔸 [Debug] Subrama ${sIndex + 1}:`, {
            id: subrama.id,
            name: subrama.name ?? subrama.nombre,
            description: subrama.description,
            descripcionLegacy: (subrama as { descripcion?: string }).descripcion,
            hasDescription: Boolean(subrama.description ?? (subrama as { descripcion?: string }).descripcion)
          });
        });
      }
    });
    
    // Resumen
    const ramasConDescripcion = ramas.filter(r => Boolean(r.description ?? (r as { descripcion?: string }).descripcion));
    const subramasConDescripcion = ramas.flatMap(r => r.subramas ?? [])
      .filter(s => Boolean(s.description ?? (s as { descripcion?: string }).descripcion));
    
    console.log('📈 [Debug] Resumen:');
    console.log(`  - Ramas con descripción: ${ramasConDescripcion.length}/${ramas.length}`);
    console.log(`  - Subramas con descripción: ${subramasConDescripcion.length}/${ramas.flatMap(r => r.subramas ?? []).length}`);
    
    return {
      ramas,
      estadisticas: {
        totalRamas: ramas.length,
        ramasConDescripcion: ramasConDescripcion.length,
        totalSubramas: ramas.flatMap(r => r.subramas ?? []).length,
        subramasConDescripcion: subramasConDescripcion.length
      }
    };
  } catch (error) {
    console.error('❌ [Debug] Error obteniendo datos del backend:', error);
    throw error;
  }
}

// Función para mostrar qué se exportaría sin realmente exportar
export function previewExportData(tenantSlug: string, groupSlug: string) {
  return debugBackendData(tenantSlug, groupSlug).then(({ ramas, estadisticas }) => {
    console.log('🔍 [Preview] Vista previa de exportación:');
    
    const filasPreview = ramas.map(rama => {
      const descripcionRama = (rama.description ?? (rama as { descripcion?: string }).descripcion ?? '').toString().trim() || 
                             `${rama.minAge}-${rama.maxAge} años`;
                             
      if (rama.subramas && rama.subramas.length > 0) {
        return rama.subramas.map(subrama => [
          rama.name ?? rama.nombre,
          descripcionRama,
          'TipoSubrama', // Se extraería dinámicamente
          subrama.name ?? subrama.nombre,
          'Estado', // Se extraería dinámicamente
          'Integrantes', // Se extraería dinámicamente
          'JefeRama' // Se extraería dinámicamente
        ]);
      } else {
        return [[
          rama.name ?? rama.nombre,
          descripcionRama,
          '',
          '— (Sin subramas)',
          'activa',
          '',
          ''
        ]];
      }
    }).flat();
    
    console.table(filasPreview);
    return { filasPreview, estadisticas };
  });
}