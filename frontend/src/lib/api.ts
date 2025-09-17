import type { Rama, Subrama } from '../_mocks/organigramaData';
import { ramasData, subramasData } from '../_mocks/organigramaData';

// Simulación de delay para operaciones asíncronas
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== OPERACIONES CRUD PARA RAMAS =====

export const getRamas = async (año?: number): Promise<Rama[]> => {
  await delay(300);
  console.log('[API] Obteniendo ramas', { año });
  
  const filteredRamas = año 
    ? ramasData.filter(rama => rama.año === año)
    : ramasData;
  
  console.log('[API] Ramas obtenidas:', filteredRamas);
  return filteredRamas;
};

export const getRamaById = async (id: string): Promise<Rama | null> => {
  await delay(200);
  console.log('[API] Obteniendo rama por ID:', id);
  
  const rama = ramasData.find(r => r.id === id) || null;
  console.log('[API] Rama encontrada:', rama);
  return rama;
};

export const createRama = async (ramaData: Omit<Rama, 'id'>): Promise<Rama> => {
  await delay(500);
  console.log('[API] Creando nueva rama:', ramaData);
  
  const newRama: Rama = {
    ...ramaData,
    id: Date.now().toString() // Simulación de ID generado
  };
  
  console.log('[API] Rama creada exitosamente:', newRama);
  return newRama;
};

export const updateRama = async (id: string, ramaData: Partial<Rama>): Promise<Rama> => {
  await delay(500);
  console.log('[API] Actualizando rama:', { id, data: ramaData });
  
  const existingRama = ramasData.find(r => r.id === id);
  if (!existingRama) {
    throw new Error(`Rama con ID ${id} no encontrada`);
  }
  
  const updatedRama = { ...existingRama, ...ramaData };
  console.log('[API] Rama actualizada exitosamente:', updatedRama);
  return updatedRama;
};

export const deleteRama = async (id: string): Promise<void> => {
  await delay(400);
  console.log('[API] Eliminando rama con ID:', id);
  
  // Verificar si existen subramas asociadas
  const subramasAsociadas = subramasData.filter(s => s.ramaId === id);
  if (subramasAsociadas.length > 0) {
    console.warn('[API] ¡Atención! Se eliminarán también las subramas asociadas:', subramasAsociadas);
  }
  
  console.log('[API] Rama eliminada exitosamente');
};

// ===== OPERACIONES CRUD PARA SUBRAMAS =====

export const getSubramas = async (ramaId?: string, año?: number): Promise<Subrama[]> => {
  await delay(300);
  console.log('[API] Obteniendo subramas', { ramaId, año });
  
  let filteredSubramas = subramasData;
  
  if (ramaId) {
    filteredSubramas = filteredSubramas.filter(subrama => subrama.ramaId === ramaId);
  }
  
  if (año) {
    filteredSubramas = filteredSubramas.filter(subrama => subrama.año === año);
  }
  
  console.log('[API] Subramas obtenidas:', filteredSubramas);
  return filteredSubramas;
};

export const getSubramaById = async (id: string): Promise<Subrama | null> => {
  await delay(200);
  console.log('[API] Obteniendo subrama por ID:', id);
  
  const subrama = subramasData.find(s => s.id === id) || null;
  console.log('[API] Subrama encontrada:', subrama);
  return subrama;
};

export const createSubrama = async (subramaData: Omit<Subrama, 'id'>): Promise<Subrama> => {
  await delay(500);
  console.log('[API] Creando nueva subrama:', subramaData);
  
  const newSubrama: Subrama = {
    ...subramaData,
    id: Date.now().toString() // Simulación de ID generado
  };
  
  console.log('[API] Subrama creada exitosamente:', newSubrama);
  return newSubrama;
};

export const updateSubrama = async (id: string, subramaData: Partial<Subrama>): Promise<Subrama> => {
  await delay(500);
  console.log('[API] Actualizando subrama:', { id, data: subramaData });
  
  const existingSubrama = subramasData.find(s => s.id === id);
  if (!existingSubrama) {
    throw new Error(`Subrama con ID ${id} no encontrada`);
  }
  
  const updatedSubrama = { ...existingSubrama, ...subramaData };
  console.log('[API] Subrama actualizada exitosamente:', updatedSubrama);
  return updatedSubrama;
};

export const deleteSubrama = async (id: string): Promise<void> => {
  await delay(400);
  console.log('[API] Eliminando subrama con ID:', id);
  console.log('[API] Subrama eliminada exitosamente');
};