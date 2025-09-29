Implementación de subida de imágenes a Supabase Storage (aislada)

Resumen

- Se agregó la configuración de Supabase en `config/supabase.config.ts`.
- Se agregó `services/storage.service.ts` con la función `subirImagen(file: File): Promise<string>` que sube a la carpeta `organigrama` en el bucket `media` y devuelve la URL pública.
- Se modificaron `CreateRamaModal.tsx` y `EditRamaModal.tsx` para incluir un input de tipo file, mostrar estado de carga y guardar la URL resultante en el estado local del formulario.

Cómo instalar dependencias

1. Asegúrate de tener las variables de entorno en `.env.local`:

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

2. Instala dependencias:

```bash
npm install
```

Nota: `@supabase/supabase-js` fue añadida como `optionalDependency` en el `package.json`. Si prefieres moverla a `dependencies`, edita el archivo antes de instalar.

Cómo probar localmente

- Ejecuta el proyecto en modo desarrollo:

```bash
npm run dev
```

- Abre la UI y navega a la sección Organigrama. En los modales de crear/editar rama encontrarás un input para seleccionar imagen. Al seleccionar, la imagen se subirá a Supabase Storage y su URL se mostrará en miniatura.

Consideraciones y mejoras

- Esta implementación usa el bucket `media`. Asegúrate de que el bucket exista y tenga reglas públicas (o ajusta `getPublicUrl`/revalidación según tu caso).
- Manejo de errores y notificaciones puede mejorarse para mostrar mensajes al usuario en lugar de solo console.error.
- Si quieres evitar `optionalDependencies`, mueve `@supabase/supabase-js` a `dependencies`.
