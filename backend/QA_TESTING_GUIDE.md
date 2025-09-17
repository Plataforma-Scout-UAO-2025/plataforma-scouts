# 🧪 QA Testing Guide - Supabase Storage Integration

## 📋 Resumen

Este documento describe cómo probar la integración de Supabase Storage en el entorno de QA.

## ⚠️ IMPORTANTE

Los endpoints de QA **SOLO están disponibles** en los perfiles:
- `development`
- `qa` 
- `testing`

**NO están disponibles en producción** por seguridad.

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

**Windows:**
```powershell
.\qa-testing.ps1
```

**Linux/Mac:**
```bash
chmod +x qa-testing.sh
./qa-testing.sh
```

### Opción 2: Manual

```bash
# Configurar perfil QA
export SPRING_PROFILES_ACTIVE=qa
export APP_QA_ENDPOINTS_ENABLED=true

# Ejecutar aplicación
./mvnw spring-boot:run -Dspring-boot.run.profiles=qa
```

## 🔗 Endpoints de QA

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/qa/test/health` | GET | Health check del servidor |
| `/api/v1/qa/test/upload/image` | POST | Subir imagen al bucket 'images' |
| `/api/v1/qa/test/upload/document` | POST | Subir documento al bucket 'files' |
| `/api/v1/qa/test/file-url` | GET | Obtener URL pública de archivo |

## 🛠️ Herramientas de Testing

### 1. Swagger UI
- **URL**: http://localhost:8080/swagger-ui/index.html
- **Permite**: Upload real de archivos desde el navegador
- **Documentación**: Completa con ejemplos

### 2. Postman Collection
- **Archivo**: `./postman/Scouts_Platform_QA_Testing.postman_collection.json`
- **Incluye**: Tests automatizados y validaciones
- **Importar**: En Postman → Import → Seleccionar archivo

## 📝 Casos de Prueba

### ✅ Caso 1: Health Check
```bash
curl http://localhost:8080/api/v1/qa/test/health
```
**Resultado esperado**: Status 200, response con "UP"

### ✅ Caso 2: Upload de Imagen
```bash
curl -X POST http://localhost:8080/api/v1/qa/test/upload/image \
  -F "file=@test-image.jpg"
```
**Resultado esperado**: 
- Status 200
- URL de Supabase en response
- Archivo visible en bucket 'images'

### ✅ Caso 3: Upload de Documento
```bash
curl -X POST http://localhost:8080/api/v1/qa/test/upload/document \
  -F "file=@test-document.pdf"
```
**Resultado esperado**:
- Status 200
- URL de Supabase en response  
- Archivo visible en bucket 'files'

### ✅ Caso 4: Obtener URL
```bash
curl "http://localhost:8080/api/v1/qa/test/file-url?fileName=test.jpg&bucket=images"
```
**Resultado esperado**: URL pública válida

## 🔍 Validaciones de QA

### ✅ Funcionalidad
- [ ] Upload de imágenes funciona
- [ ] Upload de documentos funciona
- [ ] URLs generadas son accesibles
- [ ] Archivos se almacenan en buckets correctos
- [ ] Archivos mantienen su integridad

### ✅ Seguridad
- [ ] Endpoints NO disponibles en perfil production
- [ ] Solo archivos válidos son aceptados
- [ ] URLs públicas funcionan correctamente

### ✅ Performance
- [ ] Upload de archivos < 5MB es rápido
- [ ] URLs se generan instantáneamente
- [ ] No hay memory leaks en uploads múltiples

## 📊 Estructura de Response

### Upload exitoso:
```json
{
  "message": "Imagen subida exitosamente",
  "fileName": "1726567890123_test.jpg",
  "fileUrl": "https://psafdlxbpiqwzucwsezw.supabase.co/storage/v1/object/public/images/1726567890123_test.jpg",
  "bucket": "images",
  "originalName": "test.jpg",
  "size": "1024",
  "contentType": "image/jpeg"
}
```

### Error:
```json
{
  "error": "Error al subir imagen: [detalle del error]"
}
```

## 🔧 Configuración

### Buckets configurados:
- **`images`**: Para fotos, avatares, logos
- **`files`**: Para documentos, PDFs, archivos generales

### Variables de entorno:
Ver archivo `application-qa.properties` para configuración completa.

## 📞 Soporte

Si encuentras problemas durante el testing:

1. **Verificar logs** en la consola de la aplicación
2. **Revisar conexión** a Supabase en dashboard
3. **Validar perfiles** activos con `/actuator/env`
4. **Contactar equipo** de desarrollo con detalles del error

---

**⚠️ Recordatorio**: Estos endpoints serán **eliminados** una vez completado el testing de QA y la integración sea aprobada para producción.