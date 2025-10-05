# Dashboard de Gestión para ACUDIENTES - Plataforma Scouts

## 📋 Descripción

Este módulo implementa un dashboard completo de gestión para **ACUDIENTES** en la plataforma de scouts. Los acudientes son un rol con permisos limitados que solo pueden gestionar los miembros scouts que están bajo su responsabilidad.

## 🔐 Permisos del Rol ACUDIENTE

### ✅ Permisos PERMITIDOS:
- **VER** la lista de sus miembros a cargo
- **VER** los detalles completos de cada miembro
- **EDITAR** la información de sus miembros

### ❌ Permisos RESTRINGIDOS:
- **NO** puede crear nuevos miembros
- **NO** puede eliminar miembros
- **NO** puede ver insignias/progresión
- **NO** tiene acceso a funcionalidades administrativas

## 🎨 Diseño y Estilo

- **Framework**: React + TypeScript + shadcn/ui + Vite + React Router
- **Colores institucionales**: 
  - Sidebar: Verde #1a4134
  - Hover: Verde #29765C
  - Fondo: Beige #fffaf3
- **Tipografía**: Poppins
- **Componentes**: shadcn/ui para UI consistency

## 📁 Estructura de Archivos

```
src/app/routes/acudientes/
├── types/
│   └── miembro.type.ts          # Tipos TypeScript para miembros
├── schemas/
│   └── MiembroForm.schema.ts    # Validaciones con Zod
├── components/
│   ├── MiembrosTable.tsx        # Tabla principal con paginación
│   ├── MiembrosTableColumns.tsx # Definición de columnas
│   ├── MiembroDetallesSheet.tsx # Sheet lateral con detalles
│   ├── EditarMiembroModal.tsx   # Modal de edición de miembros
│   └── Sidebar.tsx              # Sidebar con navegación
└── MiembrosACargo.tsx           # Vista principal
```

## 🚀 Funcionalidades Implementadas

### 1. Vista Principal: "Miembros a Cargo"
- Sidebar verde con navegación institucional
- Header con título y descripción clara
- Tabla responsive con información de miembros
- Paginación funcional
- Sin botones de crear/eliminar (según permisos)

### 2. Tabla de Miembros
**Columnas incluidas:**
- ID
- Nombre y Apellidos
- Identificación
- Fecha de creación (formato: "13 ago 2025 4:30pm")
- Estado (badge verde "Activo")
- Ciudad
- Ramas
- Acciones (Ver detalles + Editar)

### 3. Modal: "Detalles del Integrante" 
- Sheet lateral derecho (600-700px)
- Avatar placeholder
- Información personal completa
- Datos físicos (peso, altura)
- Intereses y habilidades
- Dirección
- Contactos de emergencia en cards
- Botón para abrir modal de edición

### 4. Modal: "Editar Miembro"
- Dialog centrado con formulario completo
- Grid responsive (3 columnas desktop, 1 móvil)
- Validación con react-hook-form + zod
- Gestión de contactos de emergencia (1-5 contactos)
- Pre-llenado automático de datos
- Toast notifications para éxito/error

## 🔧 Validaciones Implementadas

### Campos Obligatorios (*)
- Nombres, Apellidos, Email
- Tipo y número de identificación
- Género, fecha de nacimiento
- Teléfono, dirección
- Fecha de aceptación
- Al menos 1 contacto de emergencia

### Validaciones Específicas
- **Email**: Formato válido
- **Teléfono**: Formato internacional (+57 seguido de 10 dígitos)
- **Contactos**: Máximo 5, mínimo 1
- **Tipos de documento**: CC, TI, RC, CE, PA, PEP, PPT, NIT, NUIP

## 📊 Datos de Ejemplo

El sistema incluye 3 miembros de ejemplo con datos completos para testing:

1. **José Alberto Gutierrez Jimenez** (Lobatos)
2. **Ana María López Hernández** (Lobatos)  
3. **Luis Fernando Martínez Silva** (Scouts)

## 🛣️ Rutas Configuradas

- **Principal**: `/acudientes` - Dashboard completo con sidebar propio
- **Protegida**: Requiere autenticación Auth0
- **Independiente**: No usa AppLayout existente (tiene su propio layout)

## 🚀 Cómo usar

### 1. Acceso
- Navegar a `/acudientes`
- El sistema requiere autenticación Auth0
- El rol debe estar configurado como "acudiente"

### 2. Navegación
- **Sidebar**: Navegación entre secciones (Inicio, Tropa, Eventos, Financiero)
- **Tabla**: Ver lista de miembros a cargo
- **Acciones**: Iconos para ver detalles (amarillo) y editar (azul)

### 3. Ver Detalles
- Click en icono de ojo/usuario
- Se abre sheet lateral con información completa
- Botón "Editar Miembro" para modificar datos

### 4. Editar Miembro
- Click en icono de lápiz o botón "Editar Miembro"
- Formulario pre-llenado con datos actuales
- Validación en tiempo real
- Gestión de contactos de emergencia
- Guardado con confirmación

## 🔄 Estados y Manejo de Datos

### Estado Local
```typescript
const [miembros, setMiembros] = useState<Miembro[]>()
const [selectedMiembro, setSelectedMiembro] = useState<Miembro | null>()
const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false)
const [isEditModalOpen, setIsEditModalOpen] = useState(false)
```

### Flujo de Edición
1. Seleccionar miembro → Abrir modal de edición
2. Pre-llenar formulario con datos actuales
3. Validar cambios en tiempo real
4. Guardar → Actualizar estado local
5. Mostrar toast de confirmación
6. Cerrar modal y actualizar tabla

## 🎯 Próximos Pasos

Para completar la implementación se pueden agregar:

1. **Integración con API**: Conectar con backend real
2. **Estados de carga**: Skeletons y spinners
3. **Filtros**: Búsqueda por nombre, estado, rama
4. **Exportación**: PDF/Excel de la lista de miembros
5. **Notificaciones**: Sistema de alertas en tiempo real
6. **Responsive**: Optimización para móviles
7. **Accesibilidad**: Mejoras para screen readers

## 📱 Responsive Design

- **Desktop**: Grid de 3 columnas en formularios
- **Tablet**: Grid adaptativo
- **Móvil**: Formularios en 1 columna, tabla con scroll horizontal

## 🎨 Tokens de Diseño

```css
/* Colores principales */
--verde-institucional: #1a4134
--verde-hover: #29765C  
--fondo-beige: #fffaf3

/* Tipografía */
font-family: 'Poppins', sans-serif

/* Espaciado */
--padding-interno: 32px
--separacion-elementos: 24px
```

## 🧪 Testing

Los componentes incluyen:
- Datos de ejemplo para development
- Validaciones completas con Zod
- Manejo de errores con toast notifications
- Estados de carga y feedback visual

---

**Desarrollado para**: Plataforma Scout UAO 2025  
**Tecnologías**: React, TypeScript, shadcn/ui, React Hook Form, Zod  
**Última actualización**: Octubre 2025