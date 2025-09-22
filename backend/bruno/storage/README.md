# 📁 Storage API Testing - Bruno Collection

Esta colección de Bruno contiene tests completos para la funcionalidad de subida de archivos (images y documents) a Supabase Storage.

## 🎯 Cobertura de Testing

### **Endpoints Cubiertos**
1. `GET /api/v1/test/health` - Health check del sistema
2. `POST /api/v1/test/upload/image` - Subida de imágenes 
3. `POST /api/v1/test/upload/document` - Subida de documentos
4. `GET /api/v1/test/file-url` - Obtener URL pública de archivos

### **Casos de Prueba Implementados**

#### ✅ **Casos Positivos (Happy Path)**
- **HealthCheck**: Verificar que el servidor esté funcionando
- **UploadImageSuccess**: Subir imagen válida al bucket 'images'  
- **UploadDocumentSuccess**: Subir documento válido al bucket 'files'
- **GetFileUrlImages**: Obtener URL de imagen existente
- **GetFileUrlFiles**: Obtener URL de documento existente

#### ❌ **Casos Negativos (Error Handling)**
- **UploadImageEmptyFile**: Intentar subir archivo vacío (imagen)
- **UploadDocumentEmptyFile**: Intentar subir archivo vacío (documento)

#### ⚠️ **Casos Límite (Edge Cases)**
- **UploadImageLargeFile**: Subir imagen muy grande (>5MB)
- **UploadDocumentDifferentTypes**: Probar diferentes tipos de documentos

---

## 🔧 Configuración Previa

### **1. Variables de Entorno**
Asegurar que el environment de Bruno tenga configurado:
```json
{
  "baseurl": "http://localhost:8080/"
}
```

### **2. Archivos de Prueba**
Los siguientes archivos deben estar en la carpeta `test-files/`:
- `sample-image.jpg` (imagen pequeña, <1MB)
- `sample-document.pdf` (documento válido)
- `sample-document.docx` (documento Word)
- `large-image.jpg` (imagen grande, >5MB)
- `empty-file.txt` (archivo vacío - ya incluido)

### **3. Servidor Backend**
```bash
cd backend
./mvnw spring-boot:run
```

---

## 🎬 Ejecución de Tests

### **Ejecutar Toda la Colección**
```bash
# En Bruno GUI: Click "Run Collection" en la carpeta storage
```

### **Ejecutar Tests Individuales**
1. Abrir Bruno
2. Navegar a `storage/` folder
3. Seleccionar test específico
4. Click "Send" o "Run"

### **Orden Recomendado de Ejecución**
1. **HealthCheck** - Verificar que el servidor esté activo
2. **UploadImageSuccess** - Test básico de funcionalidad
3. **UploadDocumentSuccess** - Test básico de documentos
4. **GetFileUrl** tests - Verificar URLs generadas
5. **Error cases** - Validar manejo de errores
6. **Edge cases** - Casos límite

---

## 📊 Validaciones Implementadas

### **Estructura de Respuesta Exitosa**
```json
{
  "message": "Archivo subido exitosamente",
  "fileName": "1234567890_sample.jpg",
  "originalName": "sample.jpg", 
  "fileUrl": "https://...supabase.co/storage/v1/object/public/images/1234567890_sample.jpg",
  "bucket": "images",
  "size": 123456,
  "contentType": "image/jpeg"
}
```

### **Estructura de Respuesta de Error**
```json
{
  "error": "El archivo está vacío",
  "statusCode": 400,
  "details": "No se puede procesar un archivo vacío",
  "timestamp": "2025-09-21T22:00:00.000Z"
}
```

### **Validaciones Automáticas**
- ✅ **Status codes** correctos (200, 400, 413, 500)
- ✅ **Estructura** de respuesta válida
- ✅ **Tipos de datos** correctos
- ✅ **URLs** válidas generadas
- ✅ **Buckets** correctos (images/files)
- ✅ **Content-types** apropiados
- ✅ **File sizes** positivos
- ✅ **Timestamps** en formato ISO

---

## 🐛 Casos de Error Esperados

### **400 Bad Request**
- Archivo vacío
- Multipart malformado  
- Parámetros faltantes

### **413 Payload Too Large**
- Archivos muy grandes (>límite configurado)

### **500 Internal Server Error**  
- Error de conexión con Supabase
- Problemas de configuración
- Errores de red

---

## 📈 Integración con CI/CD

### **Uso en Pipeline**
```bash
# Los tests pueden integrarse en GitHub Actions:
# 1. Levantar servidor de testing
# 2. Ejecutar colección Bruno via CLI
# 3. Validar que todos los tests pasen
```

### **Criterios de Aceptación**
- ✅ **Todos los tests positivos** deben pasar
- ✅ **Tests de error** deben retornar códigos correctos  
- ✅ **Performance** aceptable (<5s por request)

---

**Última actualización**: Septiembre 21, 2025  
**Autor**: Plataforma Scouts Team