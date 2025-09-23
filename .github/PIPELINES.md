# 🚀 Pipelines CI/CD - Validation & Quality

Este documento explica los pipelines de CI/CD configurados para validar la calidad del código, incluyendo tests automatizados y enforcement de estándares de calidad.

## 📋 Tabla de Contenidos

- [Backend CI Pipeline](#backend-ci-pipeline)
- [Frontend CI Pipeline](#frontend-ci-pipeline)
- [Configuración de Calidad de Código](#configuración-de-calidad-de-código)
- [Flujo de Trabajo Recomendado](#flujo-de-trabajo-recomendado)
- [Troubleshooting](#troubleshooting)

---

## 🔧 Backend CI Pipeline

**Archivo**: `.github/workflows/backend-ci.yml`

### 📌 Propósito
Valida la calidad del código backend (Spring Boot) en cada cambio, garantizando que:
- Los tests unitarios pasen
- Se mantenga al menos 80% de cobertura de código
- El código compile correctamente

### 🎯 Triggers (Cuándo se ejecuta)

#### Push Events
```yaml
branches: [ develop, release/* ]
paths: [ 'backend/**', '.github/workflows/backend-ci.yml' ]
```

#### Pull Request Events  
```yaml
branches: [ develop, release/* ]
paths: [ 'backend/**' ]
```

### 🔄 Jobs del Pipeline

#### 1. **Feature PR Validation** 
- **Cuándo**: Solo en Pull Requests
- **Propósito**: Validar cambios antes del merge
- **Pasos**:
  1. **Checkout código** con `actions/checkout@v4`
  2. **Setup JDK 17** usando Temurin distribution
  3. **Cache Maven dependencies** para acelerar builds
  4. **Ejecutar tests unitarios** con coverage usando H2 database
  5. **Verificar 80% coverage** - ⚠️ **BLOQUEA PR si no cumple**
  6. **Build aplicación** para validar compilación

```bash
# Comandos ejecutados:
./mvnw test                    # Tests con H2 in-memory DB
./mvnw jacoco:check@check     # Validación coverage 80%
./mvnw compile -DskipTests    # Compilación sin tests
```

#### 2. **Develop Validation**
- **Cuándo**: Push directo a rama `develop`
- **Propósito**: Validación continua en rama principal de desarrollo
- **Pasos**: Idénticos a Feature PR + generación de JAR

```bash
# Comandos adicionales:
./mvnw package -DskipTests    # Genera JAR para desarrollo
```

#### 3. **Release Validation**
- **Cuándo**: Push a ramas `release/*`
- **Propósito**: Validación exhaustiva para releases de producción
- **Pasos**: Validación completa + JAR de producción

```bash
# Suite completa de tests:
./mvnw test                   # Tests completos
./mvnw jacoco:check@check    # Coverage validation
./mvnw package -DskipTests   # JAR de producción
```

### 🎯 Configuración de Tests

#### Variables de Entorno
```yaml
env:
  CI: true                        # Indica ejecución en CI
  SPRING_PROFILES_ACTIVE: test    # Activa perfil de test
```

#### Base de Datos para Tests
- **Producción**: Supabase PostgreSQL
- **Tests**: H2 In-Memory Database
- **Ventajas**: 
  - Tests aislados y rápidos
  - Sin dependencias externas
  - Datos frescos en cada ejecución

#### Configuración H2 (`application-test.properties`)
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=create-drop
spring.flyway.enabled=false
```

---

## 🎨 Frontend CI Pipeline

**Archivo**: `.github/workflows/frontend-ci.yml`

### 📌 Propósito
Valida la calidad del código frontend (React + TypeScript) en cada cambio, garantizando que:
- El código pase validación de ESLint
- TypeScript compile sin errores
- La aplicación builde correctamente

### 🎯 Triggers (Cuándo se ejecuta)

#### Push Events
```yaml
branches: [ develop, release/* ]
paths: [ 'frontend/**', '.github/workflows/frontend-ci.yml' ]
```

#### Pull Request Events  
```yaml
branches: [ develop, release/* ]
paths: [ 'frontend/**' ]
```

### 🔄 Jobs del Pipeline

#### 1. **Feature PR Validation** 
- **Cuándo**: Solo en Pull Requests
- **Propósito**: Validar cambios de frontend antes del merge
- **Pasos**:
  1. **Setup Node.js 18** con cache de npm
  2. **Install dependencies** (`npm ci`)
  3. **ESLint validation** - Verifica estándares de código
  4. **TypeScript validation** - Verifica tipos sin generar archivos
  5. **Build validation** - Verifica que compile para producción
  6. **PR Comment** - Comenta resultado en el PR

```bash
# Comandos ejecutados:
npm ci                    # Install dependencies
npm run lint             # ESLint validation
npx tsc --noEmit        # TypeScript check
npm run build           # Production build
```

#### 2. **Develop Validation**
- **Cuándo**: Push directo a rama `develop`
- **Propósito**: Validación continua + artifacts para QA
- **Pasos**: Validación completa + upload de build artifacts

```bash
# Comandos + artifacts:
npm ci && npm run lint && npx tsc --noEmit
npm run build           # Build para QA
# Upload artifacts: frontend-develop-{sha}
```

#### 3. **Release Validation**
- **Cuándo**: Push a ramas `release/*`
- **Propósito**: Validación estricta para releases
- **Pasos**: Validación completa + build de producción

```bash
# Validación estricta:
npm run lint             # Strict linting
npx tsc --noEmit        # Strict type checking
npm run build           # Production build
# Upload artifacts: frontend-release-{sha}
```

---

## 🛡️ Configuración de Calidad de Código

### 📊 JaCoCo Coverage Plugin (Backend)

#### Configuración Maven
```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.10</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
        <execution>
            <id>check</id>
            <goals>
                <goal>check</goal>
            </goals>
            <configuration>
                <rules>
                    <rule>
                        <element>BUNDLE</element>
                        <limits>
                            <limit>
                                <counter>INSTRUCTION</counter>
                                <value>COVEREDRATIO</value>
                                <minimum>0.80</minimum> <!-- 80% mínimo -->
                            </limit>
                        </limits>
                    </rule>
                </rules>
            </configuration>
        </execution>
    </executions>
</plugin>
```

#### Validaciones Automáticas Backend
- **80% Coverage Mínimo**: Obligatorio para todos los PRs
- **Bloqueo Automático**: PRs con coverage < 80% son rechazados
- **Reportes Detallados**: Generados en `target/site/jacoco/index.html`

#### Validaciones Automáticas Frontend
- **ESLint Passing**: Código debe cumplir estándares de linting
- **TypeScript Compilation**: Sin errores de tipos
- **Build Success**: Aplicación debe compilar para producción
- **Artifacts Generation**: Builds disponibles para testing

### 🔒 Políticas de Merge

#### Pull Requests Backend
1. **Tests deben pasar** ✅
2. **Coverage ≥ 80%** ✅  
3. **Build exitoso** ✅
4. **Revisión de código** (recomendado)

#### Pull Requests Frontend  
1. **ESLint debe pasar** ✅
2. **TypeScript sin errores** ✅
3. **Build exitoso** ✅
4. **Revisión de código** (recomendado)

#### Protecciones de Rama
- `develop`: Requiere PR review + CI passing
- `release/*`: Requiere CI + full validation  
- `main`: Requiere approval + full validation

---

## 🔄 Flujo de Trabajo Recomendado

### 1. **Desarrollo de Features**
```bash
# 1. Crear feature branch desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-funcionalidad

# 2. Desarrollo Backend con TDD
cd backend
# - Escribir tests primero
# - Implementar funcionalidad  
# - Asegurar coverage ≥ 80%

# 3. Desarrollo Frontend con calidad
cd ../frontend
# - Seguir estándares ESLint
# - Mantener tipos TypeScript
# - Verificar build local

# 4. Validar localmente
cd ../backend
./mvnw clean test jacoco:check@check
cd ../frontend  
npm run lint && npx tsc --noEmit && npm run build

# 5. Push y crear PR
git push origin feature/nueva-funcionalidad
# Crear PR en GitHub → CI se ejecuta automáticamente
```

### 2. **Validación de PR**
```bash
# El pipeline automáticamente valida:
# Backend:
# - Ejecuta tests con H2 database
# - Valida coverage ≥ 80%
# - Compila el código

# Frontend:
# - Ejecuta ESLint
# - Valida TypeScript
# - Verifica build exitoso

# BLOQUEA merge si algo falla
```

### 3. **Merge a Develop**
```bash
# Después de approval y CI passing:
# - Merge manual o automático
# - CI ejecuta validación en develop (ambos pipelines)
# - Artifacts generados para testing
# - Código listo para siguiente feature
```

---

## 🆘 Troubleshooting

### ❌ Build Failures Comunes

#### 1. **Backend: Tests Fallan**
```bash
# Ejecutar localmente con profile test
cd backend
SPRING_PROFILES_ACTIVE=test ./mvnw test
```

#### 2. **Backend: Coverage Insuficiente**
```bash
# Ver reporte detallado
./mvnw test jacoco:report
# Abrir: target/site/jacoco/index.html
```

#### 3. **Backend: Database Connection Errors**
```bash
# Verificar configuración test profile
cat src/test/resources/application-test.properties
# Debe usar H2, no Supabase
```

#### 4. **Frontend: ESLint Errors**
```bash
# Ejecutar y arreglar linting
cd frontend
npm run lint
npm run lint -- --fix  # Auto-fix cuando posible
```

#### 5. **Frontend: TypeScript Errors**
```bash
# Verificar errores de tipos
cd frontend
npx tsc --noEmit
```

#### 6. **Frontend: Build Errors**
```bash
# Verificar build local
cd frontend  
npm run build
```

### 🔧 Comandos Útiles

#### Backend
```bash
# Ejecutar todos los checks localmente
./mvnw clean test jacoco:report jacoco:check@check

# Solo tests
./mvnw test -Dspring.profiles.active=test

# Solo coverage check
./mvnw jacoco:check@check

# Build completo
./mvnw clean package
```

#### Frontend
```bash
# Validación completa local
npm run lint && npx tsc --noEmit && npm run build

# Solo linting
npm run lint

# Solo TypeScript check
npx tsc --noEmit

# Solo build
npm run build
```

---

## 📞 Contacto y Soporte

Para dudas sobre los pipelines:
1. **Issues**: Crear issue en GitHub
2. **Documentación**: Este archivo + código comentado  
3. **Team Lead**: Revisar con tech lead del proyecto

**Última actualización**: Septiembre 21, 2025
**Versión**: 1.1.0