# Guía de Pruebas para Desarrolladores

Hola equipo,

Para mantener un flujo de trabajo ordenado, estas son sus responsabilidades como desarrolladores en cuanto a **pruebas y calidad del código**.

Recuerden que:

* **Devs** → garantizan la calidad técnica de lo que desarrollan.
* **QA** → valida la integración del sistema y cumplimiento de criterios de aceptación definidos por los POs.

---

## Qué deben hacer los Devs

### 1. **Pruebas Unitarias (Solo Backend)**

* **Backend (Spring Boot)**

  * Usar **JUnit + Mockito**.
  * Cobertura mínima: **80%** de la clase/servicio que implementaste.
  * Ejecutar con:

    ```bash
    ./mvnw test
    ```

**Frontend**: No requiere pruebas unitarias de componentes. Solo validaciones de calidad de código (lint).

---

### 2. **Validaciones Funcionales Mínimas en Local**

* **Backend**: Validar que el endpoint responde correctamente con los datos esperados.
* **Frontend**: Verificar que la pantalla/componente se renderiza sin errores visuales básicos.

Estas son validaciones **rápidas y visuales**, no pruebas automatizadas complejas.

---

### 3. **Calidad de Código (Lint y Build)**

* **Backend**:

    ```bash
    ./mvnw verify
    ```
    
* **Frontend**:

    ```bash
    npm run lint
    npm run build
    ```

**Frontend**: Solo se requiere que el código pase lint y compile correctamente. No hay pruebas unitarias obligatorias.

---

### 4. **Checklist antes del PR**

Antes de abrir un Pull Request desde tu rama feature/:

**Backend:**
* [ ] Pruebas unitarias ejecutadas y pasadas (≥80% cobertura).
* [ ] Validación funcional mínima local.
* [ ] Lint y build correctos.
* [ ] Evidencia en el PR (logs o reporte de tests).

**Frontend:**
* [ ] Código pasa lint (`npm run lint`).
* [ ] Build exitoso (`npm run build`).
* [ ] Componente/pantalla renderiza sin errores visuales.
* [ ] No hay errores en consola del navegador.

---

## Qué NO deben hacer los Devs

* **No ejecutar colecciones de Bruno** → esto es responsabilidad de QA.
* **No hacer pruebas unitarias de componentes React** → no son necesarias para este proyecto.
* **No hacer pruebas de integración completas** → QA se encarga en ramas develop, release y main.
* **No hacer pruebas E2E** → responsabilidad exclusiva de QA.

---

## Flujo en GitHub

* **feature/**
  * Solo se permite merge si tus unit tests y lint pasan.
  
* **develop**
  * QA corre pruebas de integración y E2E.
  
* **release**
  * QA valida regresión y criterios de aceptación.
  
* **main**
  * QA hace smoke test post-deploy.

---

## En resumen

**Backend Devs:**
* **Tú** escribes y ejecutas pruebas unitarias (≥80% cobertura).
* **Tú** validas que tus endpoints funcionen correctamente.

**Frontend Devs:**
* **Tú** aseguras que el código pase lint y compile.
* **Tú** verificas que no hay errores visuales básicos.

**QA:**
* Prueba la integración, regresión y criterios de aceptación.
* Ejecuta colecciones de Bruno y pruebas E2E.

**PO:**
* Define los criterios de aceptación que QA valida.
