// Re-exportar la instancia centralizada de axios
export { default as api } from './axios';

// Re-exportar todas las funciones del módulo organigrama
export * from './organigramaApi';

// Aquí otros equipos pueden agregar sus APIs, por ejemplo:
// export * from './membersApi';
// export * from './financieroApi';
// etc.