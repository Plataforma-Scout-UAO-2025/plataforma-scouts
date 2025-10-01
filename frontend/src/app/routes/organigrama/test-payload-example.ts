// EJEMPLO: Demostración del payload correcto que ahora se envía al backend

import { mapFrontendCreateRamaToBackend } from './utils/mappers';
import type { CreateRamaData } from './types/rama.type';

// Ejemplo de datos del frontend (formulario)
const ejemploDataFrontend: CreateRamaData = {
  nombre: "Rama prueba 4",
  descripcion: "Rama de pruebas4",
  edadMinima: 8,
  edadMaxima: 12,
  año: 2025
};

// Lo que ANTES se enviaba al backend (INCORRECTO) ❌:
const payloadAnteriorIncorrecto = {
  "sectionName": "Rama prueba 4",
  "sectionDescription": "Rama de pruebas4", 
  "sectionGalleryObjectIds": []
  // ❌ Faltaba: iconObjectId
  // ❌ Nombres incorrectos de campos
};

// Lo que AHORA se envía al backend (CORRECTO) ✅:
const payloadCorregido = mapFrontendCreateRamaToBackend(ejemploDataFrontend);

console.log('✅ Payload corregido que se envía al backend:', payloadCorregido);

// Resultado esperado:
// {
//   "name": "Rama prueba 4",
//   "description": "Rama de pruebas4",
//   "iconObjectId": null,
//   "galleryObjectIds": []
// }

export { payloadAnteriorIncorrecto, payloadCorregido };