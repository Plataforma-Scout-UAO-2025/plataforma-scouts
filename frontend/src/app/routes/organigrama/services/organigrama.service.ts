import type { Rama, CreateRamaData, UpdateRamaData, CreateSubramaData, UpdateSubramaData, Subrama } from '../types/rama.type';
import { mockRamas } from '../constants/mockData';

// Simular delay de API
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Estado simulado en memoria
let ramas: Rama[] = [...mockRamas];

// CRUD para Ramas
export const getRamas = async (año?: number): Promise<Rama[]> => {
  await delay(500);
  console.log('✅ [OrganigramaService] Obteniendo ramas', { año });
  
  if (año) {
    return ramas.filter(rama => rama.año === año);
  }
  
  return ramas;
};

export const getRamaById = async (id: string): Promise<Rama | null> => {
  await delay(300);
  console.log('✅ [OrganigramaService] Obteniendo rama por ID', { id });
  
  return ramas.find(rama => rama.id === id) || null;
};

export const createRama = async (data: CreateRamaData): Promise<Rama> => {
  await delay(800);
  console.log('✅ [OrganigramaService] Creando nueva rama', data);
  
  const newRama: Rama = {
    id: `rama-${Date.now()}`,
    ...data,
    estado: 'activa',
    fechaCreacion: new Date().toISOString().split('T')[0],
    subramas: [],
  };
  
  ramas.push(newRama);
  return newRama;
};

export const updateRama = async (data: UpdateRamaData): Promise<Rama | null> => {
  await delay(600);
  console.log('✅ [OrganigramaService] Actualizando rama', data);
  
  const ramaIndex = ramas.findIndex(rama => rama.id === data.id);
  
  if (ramaIndex === -1) {
    return null;
  }
  
  const updatedRama = {
    ...ramas[ramaIndex],
    ...data,
  };
  
  ramas[ramaIndex] = updatedRama;
  return updatedRama;
};

export const deleteRama = async (id: string): Promise<boolean> => {
  await delay(500);
  console.log('🗑️ [OrganigramaService] Eliminando rama', { id });
  
  const ramaIndex = ramas.findIndex(rama => rama.id === id);
  
  if (ramaIndex === -1) {
    return false;
  }
  
  ramas.splice(ramaIndex, 1);
  return true;
};

// CRUD para Subramas
export const getSubramasByRamaId = async (ramaId: string): Promise<Subrama[]> => {
  await delay(300);
  console.log('✅ [OrganigramaService] Obteniendo subramas por rama ID', { ramaId });
  
  const rama = ramas.find(r => r.id === ramaId);
  return rama?.subramas || [];
};

export const createSubrama = async (data: CreateSubramaData): Promise<Subrama | null> => {
  await delay(700);
  console.log('✅ [OrganigramaService] Creando nueva subrama', data);
  
  const ramaIndex = ramas.findIndex(rama => rama.id === data.ramaId);
  
  if (ramaIndex === -1) {
    return null;
  }
  
  const newSubrama: Subrama = {
    id: `subrama-${Date.now()}`,
    ...data,
    estado: 'activa',
    fechaCreacion: new Date().toISOString().split('T')[0],
    numeroMiembros: 0,
  };
  
  ramas[ramaIndex].subramas.push(newSubrama);
  return newSubrama;
};

export const updateSubrama = async (data: UpdateSubramaData): Promise<Subrama | null> => {
  await delay(600);
  console.log('✅ [OrganigramaService] Actualizando subrama', data);
  
  for (const rama of ramas) {
    const subramaIndex = rama.subramas.findIndex(sub => sub.id === data.id);
    
    if (subramaIndex !== -1) {
      const updatedSubrama = {
        ...rama.subramas[subramaIndex],
        ...data,
      };
      
      rama.subramas[subramaIndex] = updatedSubrama;
      return updatedSubrama;
    }
  }
  
  return null;
};

export const deleteSubrama = async (id: string): Promise<boolean> => {
  await delay(500);
  console.log('🗑️ [OrganigramaService] Eliminando subrama', { id });
  
  for (const rama of ramas) {
    const subramaIndex = rama.subramas.findIndex(sub => sub.id === id);
    
    if (subramaIndex !== -1) {
      rama.subramas.splice(subramaIndex, 1);
      return true;
    }
  }
  
  return false;
};

// Utility functions
export const getAvailableYears = async (): Promise<number[]> => {
  await delay(200);
  console.log('✅ [OrganigramaService] Obteniendo años disponibles');
  
  const years = Array.from(new Set(ramas.map(rama => rama.año))).sort((a, b) => b - a);
  return years.length > 0 ? years : [new Date().getFullYear()];
};

// Obtener una subrama por su ID
export const getSubramaById = async (id: string): Promise<Subrama | null> => {
  await delay(300);
  console.log("✅ [OrganigramaService] Obteniendo subrama por ID", { id });

  for (const rama of ramas) {
    const subrama = rama.subramas.find((s) => s.id === id);
    if (subrama) return subrama;
  }

  return null;
};
