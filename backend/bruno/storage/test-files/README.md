# Storage Testing Files

Esta carpeta contiene archivos de prueba para los tests de Bruno del módulo de storage.

## Archivos necesarios:

### Imágenes
- `sample-image.jpg` - Imagen pequeña válida para tests positivos
- `large-image.jpg` - Imagen grande (>5MB) para tests de límites

### Documentos  
- `sample-document.pdf` - Documento PDF válido para tests positivos
- `sample-document.docx` - Documento Word para tests de diferentes tipos

### Archivos especiales
- `empty-file.txt` - Archivo vacío para tests negativos

## Instrucciones para uso

1. **Agregar archivos reales**: Los archivos referenciados en los tests de Bruno deben ser agregados manualmente a esta carpeta.

2. **Tamaños recomendados**:
   - Imágenes pequeñas: < 1MB
   - Imágenes grandes: > 5MB  
   - Documentos: < 10MB

3. **Formatos soportados**:
   - Imágenes: JPG, PNG, GIF, WebP
   - Documentos: PDF, DOC, DOCX, TXT, etc.

## Nota importante

Los archivos de prueba no deben incluirse en el repositorio Git si contienen datos sensibles. Solo archivos de ejemplo seguros.