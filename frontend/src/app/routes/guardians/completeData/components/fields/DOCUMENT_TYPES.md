# Tipos de Documentos Soportados

Este documento describe todos los tipos de documentos de identidad válidos en el sistema.

## Tipos Disponibles

### Documentos Nacionales

#### CC - Cédula de Ciudadanía
- **Uso**: Nacionales colombianos mayores de 18 años
- **Descripción**: Documento principal de identificación para ciudadanos colombianos adultos
- **Formato**: Numérico, típicamente 8-10 dígitos

#### TI - Tarjeta de Identidad
- **Uso**: Nacionales colombianos menores de 18 años
- **Descripción**: Documento de identificación para menores de edad
- **Formato**: Numérico, típicamente 10 dígitos

#### RC - Registro Civil
- **Uso**: Menores recién nacidos hasta antes de obtener TI
- **Descripción**: Primer documento de identificación al nacer
- **Formato**: Numérico, varía según la fecha de expedición

#### NUIP - Número Único de Identificación Personal
- **Uso**: Sistema unificado que reemplaza CC, TI y RC
- **Descripción**: Número único asignado al nacer que permanece toda la vida
- **Formato**: Numérico, 10 dígitos

### Documentos para Extranjeros

#### CE - Cédula de Extranjería
- **Uso**: Extranjeros con residencia en Colombia
- **Descripción**: Documento expedido por Migración Colombia a extranjeros residentes
- **Formato**: Numérico, típicamente 6-7 dígitos

#### PA - Pasaporte
- **Uso**: Nacionales y extranjeros en trámites internacionales
- **Descripción**: Documento de viaje internacional
- **Formato**: Alfanumérico

#### PEP - Permiso Especial de Permanencia
- **Uso**: Ciertos extranjeros, principalmente venezolanos
- **Descripción**: Permiso temporal otorgado por Migración Colombia
- **Formato**: Alfanumérico con formato específico
- **Nota**: Siendo reemplazado gradualmente por el PPT

#### PPT - Permiso por Protección Temporal
- **Uso**: Ciudadanos venezolanos en Colombia
- **Descripción**: Documento que reemplaza al PEP para venezolanos
- **Formato**: Alfanumérico con formato específico
- **Vigencia**: 10 años desde su expedición

### Documentos Tributarios

#### NIT - Número de Identificación Tributaria
- **Uso**: Personas jurídicas y en algunos casos personas naturales
- **Descripción**: Identificador único ante la DIAN
- **Formato**: Numérico, típicamente 9 dígitos + 1 dígito de verificación
- **Nota**: Principalmente para empresas, pero puede aplicar a acudientes en casos específicos

## Uso en el Sistema

Estos tipos de documentos están disponibles en:
- Formulario de completar datos de acudientes
- Registro de nuevos acudientes
- Actualización de información personal

## Validación

El sistema valida:
- ✅ Tipo de documento seleccionado de la lista
- ✅ Número de identificación (6-10 dígitos)
- ✅ Formato numérico para la mayoría de documentos

## Notas Importantes

1. **NUIP**: En el futuro, todos los documentos (CC, TI, RC) se unificarán bajo el NUIP
2. **PEP vs PPT**: El PPT está reemplazando al PEP desde 2021
3. **Validación específica**: Cada tipo de documento podría tener reglas de validación diferentes en el futuro

## Referencias

- [Registraduría Nacional](https://www.registraduria.gov.co/)
- [Migración Colombia](https://www.migracioncolombia.gov.co/)
- [DIAN](https://www.dian.gov.co/)
