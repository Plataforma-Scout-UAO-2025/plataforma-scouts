// Re-exportar la instancia centralizada de axios
export { default as api } from './axios';

// Re-exportar todas las funciones del módulo organigrama
export * from './organigramaApi';

// Re-exportar funciones del módulo members
export * from './membersApi';

// Aquí otros equipos pueden agregar sus APIs, por ejemplo:
// export * from './financieroApi';
// etc.