# 🧪 Guía de Testing - Plataforma Scouts

Guía práctica para testing en el proyecto, alineada con los pipelines CI/CD configurados.

---

## 🎯 Resumen

**Objetivo**: Validar que cada funcionalidad cumple con los criterios de aceptación del PO antes de ser liberada.

**Herramientas**:
- ✅ **Backend**: Tests automáticos con JaCoCo (80% coverage)
- ✅ **Frontend**: ESLint + TypeScript validation
- ✅ **API**: Bruno collections 
- ✅ **Manual**: Testing exploratorio

---

## 🔄 Flujo de Trabajo

### 1. **Desarrollo** 
```bash
# Backend: Escribir tests que cubran ≥80%
cd backend && ./mvnw test jacoco:check@check

# Frontend: Validar calidad de código
cd frontend && npm run lint && npx tsc --noEmit && npm run build

# API: Probar endpoints con Bruno
# Manual: Testing exploratorio básico
```

### 2. **Pull Request**
- **CI automático** valida todo
- **Code review** de otro desarrollador
- **Testing manual** si es funcionalidad crítica

### 3. **Merge a Develop**
- **Deploy automático** a entorno de testing
- **Validación QA** si es necesario
- **Pruebas de regresión** básicas

---

## 📋 Casos de Prueba por Módulo - Ejemplo

### 🔐 **Autenticación**

#### **Happy Path**
1. **Login exitoso**: Email válido + contraseña correcta → Dashboard
2. **Registro exitoso**: Datos válidos → Cuenta creada + Login automático
3. **Logout**: Sesión cerrada → Redirect al login

#### **Error Cases**  
1. **Login fallido**: Credenciales incorrectas → Mensaje de error
2. **Registro fallido**: Email duplicado → Error específico
3. **Sesión expirada**: Token vencido → Redirect al login

#### **Edge Cases**
1. **Email con formato límite**: Caracteres especiales válidos
2. **Contraseña mínima**: Validación de longitud
3. **Múltiples intentos**: Bloqueo temporal

---

## 🔧 Templates Prácticos

### **Para Desarrolladores**

#### **Checklist antes de PR**
```bash
# Backend
✅ Tests unitarios pasan
✅ Coverage ≥ 80% 
✅ No errores de compilación
✅ Endpoints funcionan en Bruno

# Frontend  
✅ ESLint sin errores
✅ TypeScript compila
✅ Build exitoso
✅ Funcionalidad probada manualmente
```

### **Para QA/Validación Manual**

#### **Template de Caso de Prueba**
```markdown
## 🧪 Caso: [MÓDULO]-[FUNCIÓN]-[TIPO]

**Criterio PO**: [Descripción del PO]
**Tipo**: ✅ Happy / ❌ Error / ⚠️ Edge

### Pre-condiciones
- Usuario: [rol específico]
- Datos: [status inicial necesario]

### Pasos
1. [Acción específica] → [Resultado esperado]
2. [Siguiente acción] → [Resultado esperado]

### Validación Final
✅ [Criterio cumplido]
```

---

## 🐛 Reporte de Bugs

### **Formato Standard**
```markdown
## 🐛 Bug: [Título descriptivo]

**Módulo**: [Frontend/Backend/API]
**Severidad**: 🔴 Crítico / 🟡 Medio / 🟢 Menor
**Reproduce**: Siempre / A veces / Raro

### Pasos para Reproducir
1. [Paso específico]
2. [Paso específico]

### Resultado Actual
[Qué pasa ahora]

### Resultado Esperado  
[Qué debería pasar]

### Información Adicional
- **Browser**: [si aplica]
- **Console errors**: [si aplica]
- **Screenshots**: [adjuntar si ayuda]
```

---

## 🚀 Testing con CI/CD

### **Backend (Automático)**
```yaml
# En cada PR:
- Tests unitarios ejecutados
- Coverage validado (≥80%)
- Build verificado
- Database tests con H2
```

### **Frontend (Automático)**  
```yaml
# En cada PR:
- ESLint validation
- TypeScript compilation
- Production build test
- Code quality checks
```

### **Manual (Cuando sea necesario)**
- Funcionalidades críticas nuevas
- Cambios de UI/UX significativos  
- Integraciones complejas
- Pre-release validation

---

## 📊 Métricas de Calidad

### **Objetivos**
- **Backend Coverage**: ≥ 80% (enforced)
- **Build Success**: ≥ 95%
- **Bug Leakage**: < 5% a producción
- **Time to Fix**: < 1 día bugs críticos

### **Tracking**
- **Coverage Reports**: `backend/target/site/jacoco/index.html`
- **CI Status**: GitHub Actions dashboard
- **Bug Tracking**: GitHub Issues con labels

---

## ❓ FAQ

### **¿Cuándo escribir tests manuales?**
Solo para casos complejos que no cubren los tests automáticos.

### **¿Qué hacer si el coverage baja del 80%?**
El CI bloqueará el PR. Agregar tests o revisar qué código no está cubierto.

### **¿Cómo probar integraciones API?**
Usar las colecciones de Bruno en `backend/bruno/`.

### **¿Quién aprueba las funcionalidades?**
PO para aceptación de criterios + Tech Lead para calidad técnica.

---

**Última actualización**: Septiembre 21, 2025  
**Contacto**: Tech Lead del proyecto