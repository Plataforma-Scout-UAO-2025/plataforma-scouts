# 🧪 Guía de Pruebas - Dashboard Acudientes

## 🚀 Cómo acceder al Dashboard

1. **Inicia el servidor**:
   ```bash
   cd frontend
   npm run dev
   ```

2. **Accede a la URL**:
   ```
   http://localhost:5173/acudientes
   ```

## ✅ Lista de Verificación de Funcionalidades

### 📋 Layout General
- [ ] Sidebar verde (#1a4134) visible a la izquierda
- [ ] Header con usuario "Juan Esteban Torres - YAMAHA KUMA"
- [ ] Navegación: Inicio, Tropa, Eventos, Financiero
- [ ] Fondo beige (#fffaf3) en contenido principal
- [ ] Botón "Volver" arriba a la izquierda

### 📊 Vista Principal
- [ ] Título "Miembros a Cargo" visible
- [ ] Descripción completa del rol acudiente
- [ ] NO hay botones de "Crear nuevo integrante"
- [ ] NO hay barra de filtros/búsqueda

### 📋 Tabla de Miembros
- [ ] Se muestran 3 miembros de ejemplo
- [ ] Columnas: ID, NOMBRE, APELLIDOS, IDENTIFICACIÓN, CREADO, ESTADO, CIUDAD, RAMAS, ACCIONES
- [ ] Fechas formateadas: "13 ago 2025 4:30pm"
- [ ] Badges verdes "Activo" para estado
- [ ] Iconos de acciones: ojo (amarillo) y lápiz (azul)
- [ ] Paginación funcional ("Anterior" y "Siguiente")
- [ ] Hover effect en filas

### 👁️ Modal de Detalles
**Para probar: Click en icono de ojo de cualquier miembro**

- [ ] Sheet se abre desde la derecha
- [ ] Avatar circular con iniciales
- [ ] Nombre completo y badge de estado
- [ ] Secciones con iconos:
  - [ ] Información Personal (User icon)
  - [ ] Información Física (Activity icon)  
  - [ ] Intereses y Habilidades (Heart icon)
  - [ ] Dirección (MapPin icon)
  - [ ] Contactos de Emergencia (Phone icon)
- [ ] Contactos en cards separadas
- [ ] Botones "Cerrar" y "Editar Miembro"

### ✏️ Modal de Edición
**Para probar: Click en icono de lápiz O en "Editar Miembro" del modal de detalles**

- [ ] Dialog centrado se abre
- [ ] Formulario pre-llenado con datos del miembro
- [ ] Grid responsive (3 columnas en desktop)
- [ ] Todos los campos requeridos marcados con (*)
- [ ] Selects funcionando:
  - [ ] Tipo de documento (CC, TI, RC, etc.)
  - [ ] Género (Masculino, Femenino, Otro)
  - [ ] Estado (Activo/Inactivo)
- [ ] Campos de fecha funcionando
- [ ] Sección de contactos de emergencia:
  - [ ] Mínimo 1 contacto
  - [ ] Botón "Agregar contacto" (máximo 5)
  - [ ] Botón eliminar contacto (si hay más de 1)
  - [ ] Select de relación funcionando

### 🔧 Validaciones
**Para probar: Intenta guardar con datos inválidos**

- [ ] Campos vacíos muestran error
- [ ] Email debe ser válido
- [ ] Teléfono debe ser formato +57 seguido de 10 dígitos
- [ ] No permite guardar si hay errores
- [ ] Mensajes de error aparecen bajo cada campo

### 💾 Guardado
**Para probar: Edita un miembro y guarda**

- [ ] Toast verde "Miembro actualizado correctamente"
- [ ] Modal se cierra automáticamente  
- [ ] Tabla se actualiza con nuevos datos
- [ ] Cambios persisten al ver detalles nuevamente

### 📱 Responsividad
**Para probar: Cambia el tamaño de la ventana**

- [ ] Sidebar se adapta
- [ ] Tabla tiene scroll horizontal en móvil
- [ ] Formulario cambia a 1 columna en móvil
- [ ] Modal de edición se adapta correctamente

## 🎯 Casos de Prueba Específicos

### Caso 1: Ver detalles completos
1. Click en ojo del primer miembro (José Alberto)
2. Verificar que aparezcan todos los datos:
   - Edad: 15 años
   - Email: jose.gutierrez@email.com
   - Hobbies: Dibujar, Leer, Tocar Guitarra
   - 2 contactos de emergencia

### Caso 2: Editar información básica
1. Click en lápiz del segundo miembro (Ana María)
2. Cambiar email a "ana.nueva@email.com"
3. Cambiar teléfono a "+57 300 111 2222"
4. Guardar y verificar cambios

### Caso 3: Gestionar contactos de emergencia
1. Abrir edición de cualquier miembro
2. Eliminar un contacto existente (si hay más de 1)
3. Agregar un nuevo contacto
4. Llenar datos del nuevo contacto
5. Guardar y verificar

### Caso 4: Validación de errores
1. Abrir edición de cualquier miembro
2. Borrar el email
3. Cambiar teléfono a formato inválido (ej: "123")
4. Intentar guardar
5. Verificar que aparezcan mensajes de error

## 🐛 Problemas Conocidos a Verificar

- [ ] Fechas se muestran correctamente en español
- [ ] Iconos de Lucide cargan correctamente
- [ ] Componentes de shadcn/ui funcionan
- [ ] Validaciones de formulario en tiempo real
- [ ] Navegación del sidebar (actualmente son placeholders)

## 🎨 Verificación Visual

### Colores
- Sidebar: Verde oscuro #1a4134
- Hover sidebar: Verde claro #29765C
- Fondo principal: Beige #fffaf3
- Badges activos: Verde

### Tipografía
- Fuente principal: Poppins (si está configurada)
- Títulos: Bold, color verde oscuro
- Texto secundario: Gris

### Espaciado
- Padding interno: 32px en contenedores principales
- Separación entre elementos: 24px
- No espacios blancos grandes

## 📝 Notas para Testing

1. **Datos persistentes**: Los cambios solo se guardan en memoria local, se pierden al recargar
2. **Autenticación**: Actualmente bypassed para testing, en producción requiere Auth0
3. **API**: Todos los datos son mock, no hay llamadas a backend real
4. **Navegación**: Los links del sidebar son placeholders

## 🔄 Reset de Datos

Para resetear a los datos originales, simplemente recarga la página (F5 o Ctrl+R).

---

**✨ ¡El dashboard está listo para usar!** Navega a `http://localhost:5173/acudientes` y empieza a probar todas las funcionalidades.