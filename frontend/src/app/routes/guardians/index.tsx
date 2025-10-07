/**
 * Módulo de Guardians (Acudientes)
 * 
 * Este módulo gestiona todas las funcionalidades relacionadas con los acudientes/guardians
 * en la plataforma de scouts. Los guardians tienen permisos limitados para gestionar
 * únicamente los miembros scouts que están bajo su responsabilidad.
 * 
 * Estructura del módulo:
 * - components/: Todos los componentes UI del módulo
 * - types/: Definiciones de tipos TypeScript
 * - schemas/: Schemas de validación (Zod)
 * - hooks/: Hooks personalizados
 * - services/: Llamadas a la API
 * - utils/: Utilidades y helpers
 * - constants/: Constantes del módulo
 * - config/: Configuraciones
 */

// Re-exportar componentes principales para uso externo
export { default as GuardianDashboard } from './components/GuardianDashboard';
export { default as GuardianLayout } from './components/layouts/GuardianLayout';
export { default as GuardianProfile } from './components/profile/GuardianProfile';
export { default as MembersInCharge } from './components/MembersInCharge';

// Re-exportar tipos
export type { Member, EmergencyContact } from './types/member.type';

// Re-exportar schemas
export { memberFormSchema, type MemberFormData } from './schemas/MemberForm.schema';
