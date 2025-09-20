# Guía de Pruebas para QA (basada en criterios de aceptación)

Hola equipo,

Como QA, mi responsabilidad es asegurar que cada funcionalidad entregada **cumpla con los criterios de aceptación definidos por los POs** antes de ser considerada como lista para producción.

---

## Responsabilidades de QA

### 1. **Revisión de criterios de aceptación**

* Cada historia de usuario tiene criterios de aceptación definidos por el PO.
* QA traduce estos criterios en **casos de prueba** (manuales o automatizados).
* Ninguna funcionalidad se aprueba si no cumple al 100% con sus criterios.

---

### 2. **Diseño de casos de prueba**

* A partir de los criterios, QA define:

  * **Casos positivos** → validan que el sistema cumple lo esperado.
  * **Casos negativos** → validan que el sistema maneja errores correctamente.
  
* Estos casos pueden quedar documentados en:

  * Bruno (para endpoints de backend).
  * Cypress/Playwright/Selenium/Manuales (para flujos de frontend).
  * Checklists manuales (para validaciones exploratorias).

---

### 3. **Ejecución de pruebas por rama**

* **feature/**

  * QA revisa que los criterios de aceptación estén correctamente redactados y claros.
  * Dev valida funcionalidad con pruebas unitarias y funcionales mínimas.

* **develop**

  * QA valida la integración:

    * API con Bruno.
    * Flujos E2E básicos en frontend.
  * Se ejecutan los **casos de prueba derivados de los criterios del PO**.

* **release**

  * QA corre batería completa:

    * Pruebas de regresión (para no romper nada viejo).
    * Pruebas E2E completas.
    * Validación exhaustiva contra criterios de aceptación.
  * QA entrega un reporte al PO indicando:

    * Qué criterios pasaron.
    * Qué criterios no cumplen.

* **main**

  * QA realiza **smoke test post-deploy**.
  * Validación de flujos críticos (ej. login, compra, creación de entidad).
  * Confirmación de que la versión productiva cumple los criterios aceptados.

---

### 4. **Comunicación con POs**

* QA es el puente entre los POs y los devs:

  * Si una funcionalidad **no cumple con el criterio de aceptación**, QA bloquea la entrega.
  * Se genera feedback claro: "Falta X comportamiento definido en criterio Y".
  * El PO recibe evidencia (capturas, logs de Bruno, video corto de E2E).

---

## Checklist QA por historia de usuario

Antes de dar una funcionalidad como **DONE**, QA valida:

* [ ] Todos los criterios de aceptación definidos por el PO están cubiertos.
* [ ] Hay evidencia de ejecución (logs de Bruno, reportes de tests).
* [ ] Casos positivos y negativos ejecutados.
* [ ] Pruebas en ambiente develop correctas.
* [ ] En release, la funcionalidad no rompe flujos existentes.
* [ ] PO recibe feedback de cumplimiento/no cumplimiento.

---

## Herramientas QA

* **Bruno** → Para validar criterios en endpoints backend.
* **Cypress / Playwright/Selenium/Manuales** → Para validar criterios en flujos frontend.
* **Checklists manuales** → Para validaciones exploratorias o visuales.
* **GitHub Actions** → Corre pruebas automáticas en cada PR.
* **Reportes QA** → Resumen de criterios cumplidos/no cumplidos para los POs.

---

## Qué NO es responsabilidad de QA

* **No escribir pruebas unitarias** → responsabilidad de los devs de backend.
* **No validar código técnico** → los devs aseguran calidad técnica con unit tests.
* **No definir criterios de aceptación** → responsabilidad de los POs.
* **No hacer code review** → responsabilidad de los devs seniors/tech leads.

---

## Flujo en GitHub

* **feature/**
  * QA revisa claridad de criterios de aceptación.
  
* **develop**
  * QA ejecuta casos de prueba derivados de criterios de aceptación.
  * Validación de integración API + Frontend.
  
* **release**
  * QA ejecuta batería completa de regresión y E2E.
  * Reporte detallado a POs de cumplimiento de criterios.
  
* **main**
  * QA ejecuta smoke tests post-deploy.
  * Confirmación final de criterios en producción.

---

## En resumen

* Los **POs definen los criterios**.
* Los **Devs desarrollan y prueban a nivel técnico**.
* **QA valida funcionalidad contra los criterios de aceptación y bloquea lo que no cumple**.
* El **reporte de QA a los POs** es la confirmación de que la historia está lista.