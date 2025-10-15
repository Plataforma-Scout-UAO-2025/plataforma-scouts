import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Branch as Rama } from "../types/frontend";
import * as organigramaService from "../services";
import api from "@/api/axios";
import { sectionPath } from '@/api/organigramaApi';
import { extractObjectIdFromUrl, resolveGalleryItem } from "../services";
import useOrganigramaActions from "../hooks/useOrganigramaActions";
import { toast } from "sonner";
import { useTenantParams } from "../hooks/useTenantParams";
import FotoModal from "../components/FotoModal";


export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantSlug, groupSlug } = useTenantParams();
  const [rama, setRama] = useState<Rama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>("https://placehold.co/800x300");
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);

  // Estados para mostrar progreso de subida
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string | null>(null);
  const [uploadCompleteAnnounced, setUploadCompleteAnnounced] = useState(false);
  // Token para forzar recarga de imágenes (cache-busting)
  const [imageRefreshToken, setImageRefreshToken] = useState<number>(Date.now());
  // Previews locales (object URLs) para mostrar preview inmediato
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [galleryLocalPreviews, setGalleryLocalPreviews] = useState<string[]>([]);
  const uploadControllerRef = useRef<AbortController | null>(null);
  // fetchRama necesita estar disponible para las acciones; lo definimos con useCallback
  const fetchRama = useCallback(async () => {
    setLoading(true);
    try {
      if (!id) return;
      const data = await organigramaService.getRamaById(tenantSlug, groupSlug, String(id));
      if (data) {
        setRama(data as Rama);
        setImagenPrincipal(getMainImageUrl(data as Rama));
  let galleryUrls = ((data as unknown as Record<string, unknown>)?.['gallery'] ? ((data as unknown as Record<string, unknown>)['gallery'] as Array<Record<string, unknown>>).map(g => String(g.url)) : (data as unknown as Record<string, unknown>)['galleryObjectUrls'] ?? []) as string[];
        // If mapper didn't provide gallery URLs, try fetching raw backend record as fallback
        if (galleryUrls.length === 0) {
          try {
            const endpoint = sectionPath(id ?? '', tenantSlug, groupSlug);
            // fallback: solicitar registro raw al backend si el mapper no devolvió galleryUrls
            const response = await api.get<Record<string, unknown>>(endpoint);
            const backendRec = response.data;
            if (backendRec) {
              const fromBackendGallery = (backendRec['gallery'] as unknown[] | undefined) ?? [];
              if (Array.isArray(fromBackendGallery) && fromBackendGallery.length > 0) {
                galleryUrls = (fromBackendGallery as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean);
                // galleryUrls recuperadas desde backend.gallery
              } else {
                const maybeUrls = (backendRec['galleryObjectUrls'] as string[] | undefined) ?? (backendRec['galleryObjectIds'] as string[] | undefined) ?? (backendRec['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
                if (Array.isArray(maybeUrls) && maybeUrls.length > 0) {
                  galleryUrls = maybeUrls.map(String).filter(Boolean);
                  // galleryUrls recuperadas desde aliases del backend
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ [RamaDetail] Fallback GET backend para galería falló:', err);
          }
        }

  setGaleriaFotos(galleryUrls);
  // información: imagen principal y cantidad de imágenes de galería cargadas
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error cargando rama:', err);
    } finally {
      setLoading(false);
    }
  }, [id, tenantSlug, groupSlug]);

  // Hook de acciones (incluye acciones de galería)
  const { addGalleryImage, replaceGalleryImage, removeGalleryImage, isLoadingGallery } = useOrganigramaActions({
    tenantSlug,
    groupSlug,
    // loadRamas: en este componente recargamos la rama actual
    loadRamas: fetchRama,
    handleError: (err: unknown) => {
      console.error('Error en acción de organigrama:', err);
      toast.error('Error en operación de organigrama');
    }
  });
  // Helpers to safely read legacy alias fields from objects
  const getLegacyString = (obj: unknown, key: string): string | undefined => {
    if (!obj) return undefined;
    const rec = obj as unknown as Record<string, unknown>;
    const v = rec[key];
    return v === undefined || v === null ? undefined : String(v);
  };

  const getLegacyNumber = (obj: unknown, key: string): number | undefined => {
    const s = getLegacyString(obj, key);
    if (s === undefined) return undefined;
    const n = Number(s);
    return Number.isNaN(n) ? undefined : n;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

    // ===== Modal de fotos =====
  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string>("");
  const [fotoTipo, setFotoTipo] = useState<"icono" | "principal" | "galeria" | null>(null);
  const [galeriaObjetivo, setGaleriaObjetivo] = useState<string>("");
  const [galeriaObjetivoId, setGaleriaObjetivoId] = useState<string | null>(null);

  // Abrir modal según tipo de imagen
  const openIconModal = () => {
    if (!rama) return;
    const url = getIconUrl(rama);
    if (!url) return;
    setFotoTipo("icono");
    setFotoSeleccionada(url);
    setFotoModalOpen(true);
  };

  const openMainImageModal = () => {
    if (!imagenPrincipal) return;
    setFotoTipo("principal");
    setFotoSeleccionada(imagenPrincipal);
    setFotoModalOpen(true);
  };

  const openGalleryModal = (url: string) => {
    setFotoTipo("galeria");
    setFotoSeleccionada(url);
    setGaleriaObjetivo(url);
    // Try to resolve the gallery object's id (gallery[].id) from rama.gallery if available
    const maybeUuidInUrl = extractObjectIdFromUrl(url);
    const galleryItems = rama?.gallery ?? [];
    const galleryObj = maybeUuidInUrl
      ? galleryItems.find((item) => item.url.includes(maybeUuidInUrl))
      : undefined;
    setGaleriaObjetivoId(galleryObj?.id ?? null);
    setFotoModalOpen(true);
  };

  // Reemplazar o eliminar foto desde modal
  const handleReplaceFoto = async (file: File) => {
    if (!rama || !fotoTipo) return;
    try {
      setUploading(true);
      setUploadPercent(0);
      setCurrentUploadingFile(file.name);
      // Crear un AbortController por cada operación de reemplazo
      if (uploadControllerRef.current) {
          try { uploadControllerRef.current.abort(); } catch (_err) { console.warn('Could not abort previous upload controller', _err); }
        }
      const controller = new AbortController();
      uploadControllerRef.current = controller;
  if (fotoTipo === "icono") {
  const sectionId = String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id);
  await organigramaService.uploadSectionIcon(tenantSlug, groupSlug, sectionId, file, (fileName, percent) => {
          setCurrentUploadingFile(fileName);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        }, controller.signal);
    } else if (fotoTipo === "principal") {
  const sectionId = String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id);
  await organigramaService.uploadSectionMainImage(tenantSlug, groupSlug, sectionId, file, (fileName, percent) => {
          setCurrentUploadingFile(fileName);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        }, controller.signal);
      } else if (fotoTipo === "galeria") {
        // para reemplazos de galería preferimos usar el gallery[].id (galeriaObjetivoId)
        let targetId = galeriaObjetivoId ?? null;
        if (!targetId) {
          try {
            const resolved = await resolveGalleryItem(
              tenantSlug,
              groupSlug,
              String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id),
              galeriaObjetivo
            );
            if (resolved?.id) {
              targetId = resolved.id;
              setGaleriaObjetivoId(resolved.id);
            }
          } catch (_err) {
            console.error('❌ [RamaDetail] Error resolviendo id para reemplazo de galería:', _err);
          }
        }

        const targetIdOrUuid = targetId ?? extractObjectIdFromUrl(galeriaObjetivo);
        const sectionId = String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id);
        if (!targetIdOrUuid) {
          toast.error("No se pudo obtener el identificador de la imagen seleccionada");
          return;
        }
        if (!targetId) {
          console.warn('⚠️ [RamaDetail] Usando UUID extraído de la URL como fallback para reemplazo:', targetIdOrUuid);
        }
        await replaceGalleryImage(sectionId, targetIdOrUuid, file);
      }

      toast.success("Foto actualizada correctamente");
      setFotoModalOpen(false);
      await fetchRama();
    } catch (error) {
      console.error(error);
      if ((error as Error).message === 'UploadCanceled') {
        toast('Subida cancelada');
      } else {
        toast.error("Error al actualizar la foto");
      }
    }
    finally {
      setUploading(false);
      setUploadPercent(0);
      setCurrentUploadingFile(null);
      // limpiar controller
      if (uploadControllerRef.current) {
        uploadControllerRef.current = null;
      }
    }
  };

  const handleCancelUpload = () => {
    if (uploadControllerRef.current) {
      try {
        uploadControllerRef.current.abort();
        toast('Cancelando subida...');
      } catch (e) {
        console.warn('Error abortando upload', e);
      }
      setUploading(false);
      setUploadPercent(0);
      setCurrentUploadingFile(null);
      // si había un preview temporal, revertirlo
      if (fotoTipo === 'icono' && iconPreview && rama) {
        setIconPreview(getIconUrl(rama) || null);
      }
    }
  };

  const handleDeleteFoto = async () => {
    if (!rama || !fotoTipo) return;

    try {
      if (fotoTipo === "icono") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        await organigramaService.removeSectionIcon(tenantSlug, groupSlug, sectionId);
      } else if (fotoTipo === "principal") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        await organigramaService.removeSectionMainImage(tenantSlug, groupSlug, sectionId);
      } else if (fotoTipo === "galeria") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        let resolvedObjectId = galeriaObjetivoId ?? null;
        if (!resolvedObjectId) {
          try {
            const resolved = await resolveGalleryItem(tenantSlug, groupSlug, sectionId, galeriaObjetivo);
            if (resolved?.id) {
              resolvedObjectId = resolved.id;
              setGaleriaObjetivoId(resolved.id);
            }
          } catch (_err) {
            console.error('❌ [RamaDetail] Error resolviendo id para eliminación de galería:', _err);
          }
        }

        const finalTarget = resolvedObjectId ?? galeriaObjetivo;
        await removeGalleryImage(sectionId, finalTarget, false);
      }

      toast.success("Foto eliminada correctamente");
      setFotoModalOpen(false);
      await fetchRama();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la foto");
    }
  };

  const handleIconClick = () => fileInputRef.current?.click();
  const handleMainImageClick = () => mainImageInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  // Función optimizada para obtener la URL correcta del icono (prioriza URLs directas del backend)
  const getIconUrl = (rama: Rama): string => {
    // Prefer new fields then legacy
    const iconObjectId = rama.iconObjectId ?? rama.iconoObjectId;
    const iconUrl = rama.iconUrl ?? rama.icono;
    if (iconObjectId) return iconObjectId as string;
    if (iconUrl && !iconUrl.startsWith('data:') && iconUrl.includes('http')) return iconUrl as string;
    if (iconUrl && iconUrl.startsWith('data:')) return iconUrl as string;
    if (iconUrl) return iconUrl as string;
    console.log('⚠️ [RamaDetail] No hay icono disponible para rama:', rama.name ?? rama.nombre);
    return '';
  };

  // Función optimizada para obtener la URL correcta de la imagen principal
  const getMainImageUrl = (rama: Rama): string => {
    const mainImage = rama.mainImageUrl ?? rama.imagenPrincipal ?? '';
    if (mainImage && !mainImage.startsWith('data:') && mainImage.includes('http')) return mainImage as string;
    if (mainImage && mainImage.startsWith('data:')) return mainImage as string;
    return 'https://placehold.co/800x300/e2e8f0/94a3b8?text=Sin+imagen';
  };

  // Helper para display src (añade cache-bust si es URL remota)
  const makeDisplaySrc = (src: string | null | undefined) => {
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('data:')) return src;
    // Si la URL ya tiene query params (p.ej. placehold.co?text=...), usar &v= en lugar de ?v=
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}v=${imageRefreshToken}`;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;

    const preview = URL.createObjectURL(file);
    const previousIcon = getIconUrl(rama) || null;
    try {
      // Mostrar preview local inmediato
  setIconPreview(preview);
      setUploading(true);
  setUploadCompleteAnnounced(false);
      setCurrentUploadingFile(file.name);
      setUploadPercent(0);

      // Subir archivo usando el nuevo sistema y recibir progreso
  await organigramaService.uploadSectionIcon(
    tenantSlug,
    groupSlug,
  String((rama as unknown as Record<string, unknown>)['section_id'] ?? rama.sectionId ?? rama.id),
        file,
        (fileName: string, percent: number) => {
          setCurrentUploadingFile(fileName);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        }
      );

      // Pequeño delay para que el backend procese la asociación
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Recargar la rama para obtener la imagen actualizada
      const updatedRama = await organigramaService.getRamaById(tenantSlug, groupSlug, rama.id);
      if (updatedRama) {
        setRama(updatedRama);
        // marcar 100% visualmente cuando el backend confirma
        setUploadPercent(100);
        // icono actualizado correctamente
        toast.success('Ícono actualizado correctamente');
      } else {
        console.warn('⚠️ [RamaDetail] No se pudo recargar la rama');
        toast.error('Error recargando los datos de la rama');
      }
      // Forzar refresh visual de imágenes (cache-busting)
      setImageRefreshToken(Date.now());
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo ícono:', err);
      // Revertir preview en caso de error
      setIconPreview(previousIcon);
      toast.error('Error subiendo el ícono');
    } finally {
  try { URL.revokeObjectURL(preview); } catch (_err) { console.warn('Could not revoke object URL for icon preview', _err); }
      setUploading(false);
      setCurrentUploadingFile(null);
      setUploadPercent(0);
    }
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;
    const preview = URL.createObjectURL(file);
    const previousMain = imagenPrincipal;
    try {
      // subiendo imagen principal: información del archivo
  // mostrar preview inmediato
  setImagenPrincipal(preview);
  setUploading(true);
  setUploadCompleteAnnounced(false);
      setCurrentUploadingFile(file.name);
      setUploadPercent(0);

      // Subir archivo usando la función específica para imagen principal (con progreso)
  await organigramaService.uploadSectionMainImage(
    tenantSlug,
    groupSlug,
  String((rama as unknown as Record<string, unknown>)['section_id'] ?? rama.sectionId ?? rama.id),
        file,
        (fileName: string, percent: number) => {
          setCurrentUploadingFile(fileName);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        }
      );

      // Recargar la rama para obtener la imagen actualizada
      const updatedRama = await organigramaService.getRamaById(tenantSlug, groupSlug, rama.id);
        if (updatedRama) {
        setRama(updatedRama);
        // Actualizar también el estado local de imagen principal
        const mainImageUrl = getMainImageUrl(updatedRama);
        setImagenPrincipal(`${mainImageUrl}?v=${Date.now()}`);
        // marcar 100% visualmente cuando el backend confirma
        setUploadPercent(100);
        // imagen principal actualizada correctamente
        toast.success('Imagen principal actualizada correctamente');
      }
      setImageRefreshToken(Date.now());
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo imagen principal:', err);
      // revertir preview si falla
      setImagenPrincipal(previousMain || 'https://placehold.co/800x300');
      toast.error('Error subiendo la imagen principal');
    } finally {
  try { URL.revokeObjectURL(preview); } catch (_err) { console.warn('Could not revoke object URL for main image preview', _err); }
      setUploading(false);
      setCurrentUploadingFile(null);
      setUploadPercent(0);
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !rama) return;

    try {
      // subiendo galería: cantidad de archivos
  setUploading(true);
  setUploadCompleteAnnounced(false);
  setUploadPercent(0);
  setCurrentUploadingFile(null);

      // crear previews locales y agregarlas temporalmente
      const previews = files.map(f => URL.createObjectURL(f));
      setGalleryLocalPreviews(prev => [...prev, ...previews]);
      setGaleriaFotos(prev => [...prev, ...previews]);

      // Subir las imágenes usando las acciones del hook (uno a uno)
      const sectionId = String((rama as unknown as Record<string, unknown>)['section_id'] ?? rama.sectionId ?? rama.id);
      for (const f of files) {
        await addGalleryImage(sectionId, f);
      }

    // Refrescar todos los datos de la rama para obtener la galería actualizada
    await fetchRama();
      
  // galería actualizada correctamente
  // marcar 100% visualmente cuando el backend confirma
  setUploadPercent(100);
  toast.success('Galería actualizada correctamente');
      // Forzar refresh visual de imágenes (cache-busting)
      setImageRefreshToken(Date.now());

      // revocar previews locales
      for (const p of previews) {
  try { URL.revokeObjectURL(p); } catch (_err) { console.warn('Could not revoke object URL for gallery preview', _err); }
      }
      setGalleryLocalPreviews(prev => prev.filter(p => !previews.includes(p)));
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo galería:', err);
      // remover previews locales en caso de fallo
      const addedPreviews = galleryLocalPreviews.slice(-files.length);
      setGaleriaFotos(prev => prev.filter(src => !addedPreviews.includes(src)));
      for (const p of addedPreviews) {
  try { URL.revokeObjectURL(p); } catch (_err) { console.warn('Could not revoke object URL for gallery preview (error case)', _err); }
      }
      setGalleryLocalPreviews(prev => prev.slice(0, -files.length));
      toast.error('Error subiendo la galería');
    }
    finally {
      setUploading(false);
      setCurrentUploadingFile(null);
      setUploadPercent(0);
    }
  };

  useEffect(() => {
    const fetchRama = async () => {
      try {
        if (!id) return;
        const data = await organigramaService.getRamaById(tenantSlug, groupSlug, String(id));
        if (data) {
          setRama(data as Rama);
          setImagenPrincipal(getMainImageUrl(data as Rama));
          // Intentar extraer URLs de galería desde varias fuentes posibles que el mapper/backend puede usar
          const rec = data as unknown as Record<string, unknown>;
          let galleryUrls: string[] = [];
          if (Array.isArray(rec['gallery']) && (rec['gallery'] as unknown[]).length > 0) {
              try {
              galleryUrls = (rec['gallery'] as Array<Record<string, unknown>>).map(g => String(g.url)).filter(u => !!u);
              // extrayendo gallery.urls desde rec['gallery']
            } catch {
              galleryUrls = [];
            }
          }
          // Fallbacks: galleryObjectUrls, galleryObjectIds, sectionGalleryObjectIds
          if (galleryUrls.length === 0) {
            const maybe1 = (rec['galleryObjectUrls'] ?? rec['galleryObjectIds'] ?? rec['galleryObjectIds'] ?? rec['sectionGalleryObjectIds'] ?? []) as string[];
              if (Array.isArray(maybe1) && maybe1.length > 0) {
              galleryUrls = maybe1.map(String).filter(u => !!u);
              // extrayendo galleryUrls desde aliases (keys): mirar campos relacionados con 'gallery'
            }
          }

          setGaleriaFotos(galleryUrls);
          // imagen principal y galería cargadas (fallback)
        }
      } catch (_err) {
        console.error('❌ [RamaDetail] Error cargando rama:', _err);
      } finally {
        setLoading(false);
      }
    };

    fetchRama();
  }, [id, tenantSlug, groupSlug]);


  if (loading) return <p className="text-center mt-6 text-muted-foreground">Cargando detalles...</p>;
  if (!rama) return (
    <div className="text-center mt-6 space-y-4">
      <p className="text-foreground">No se encontró la rama con id: {id}</p>
      <p className="text-sm text-muted-foreground">Tenant: {tenantSlug} | Group: {groupSlug}</p>
      <Button variant="outline" onClick={() => navigate(-1)} className="border border-secondary text-secondary hover:bg-accent">Volver</Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {uploading && (
        <div className="fixed left-1/2 -translate-x-1/2 top-20 w-11/12 max-w-2xl z-50">
          <div className="bg-card border border-border p-3 rounded-md shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-primary">
                {currentUploadingFile ? `Subiendo: ${currentUploadingFile}` : 'Subiendo archivos...'}
              </div>
              <div className="text-sm text-muted-foreground">
                {uploadPercent}%
              </div>
            </div>
            <Progress value={uploadPercent} />
            {uploadPercent >= 100 && uploadCompleteAnnounced && (
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg>
                Procesando en servidor...
              </div>
            )}
          </div>
        </div>
      )}
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">Detalles de {rama?.name ?? getLegacyString(rama, 'nombre') ?? ''} – {String(rama?.year ?? getLegacyNumber(rama, 'año') ?? '')}</h1>
          <div className="relative">
            <div className="w-[200px] h-[124px] rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-accent transition-colors" onClick={openIconModal}>
              {rama && (iconPreview || getIconUrl(rama)) ? (
                <img 
                  src={iconPreview ? iconPreview : makeDisplaySrc(getIconUrl(rama))!} 
                  alt={`Ícono de ${rama?.name ?? rama?.nombre}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Error cargando icono de rama:', getIconUrl(rama));
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    // icono cargado correctamente
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground font-medium text-2xl">{(rama?.name ?? rama?.nombre)?.charAt?.(0) ?? ''}</span>
                  {rama.iconoObjectId && (
                    <div className="absolute bottom-1 left-1 text-xs text-red-500 bg-white px-1 rounded">
                      Debug: iconoObjectId={rama.iconoObjectId}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-colors" onClick={handleIconClick}><Camera className="w-4 h-4 text-primary-foreground"/></div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" aria-label="Subir ícono de rama" />
          </div>
        </div>
      </div>

      <div>
        <Button variant="outline" onClick={() => navigate(-1)} className="border border-secondary text-secondary hover:bg-accent">Anterior</Button>
      </div>

      <Card className="p-4 space-y-4 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Información Principal</h2>
          <Button size="sm" variant="outline" onClick={handleMainImageClick} className="border border-primary text-primary hover:bg-accent flex items-center gap-2">Añadir Foto <Upload className="w-4 h-4"/></Button>
        </div>
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gray-100" onClick={openMainImageModal}>
          <img src={makeDisplaySrc(imagenPrincipal) || undefined} alt={rama?.name ?? rama?.nombre} className="object-contain w-full h-full" />
        </div>
        <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" aria-label="Subir imagen principal" />
  <p className="text-sm text-muted-foreground">{rama.description ?? getLegacyString(rama, 'descripcion') ?? 'Sin descripción'}</p>

        {/* Subramas embebidas dentro de la Card de Información Principal (según Figma) */}
        {rama.subramas && rama.subramas.length > 0 && (
          <div className="pt-4">
            <h3 className="text-md font-semibold text-primary mb-2">Subramas</h3>
            <div className="flex flex-wrap gap-2">
              {rama.subramas.map((subrama) => (
                <Badge
                  key={subrama.id}
                  variant="outline"
                  asChild
                  className={"transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer w-[255px] h-[40px] rounded-[8px] flex items-center justify-center text-sm border-[1px] border-[var(--primary)]"}
                >
                  <button type="button" onClick={() => navigate(`/app/organigrama/subrama/${subrama.subgroup_id || subrama.id}`)}>
                    {subrama.name ?? subrama.nombre}
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
  <h2 className="text-lg font-semibold text-primary">Integrantes en {String(rama.year ?? getLegacyNumber(rama, 'año') ?? '')}</h2>
        <div className="flex flex-wrap gap-2">
            {["Roberto Restrepo","Carlos Camargo","Ana Aguillón","Mario Mora"].map((name, idx)=>(
            <Badge
              key={idx}
              variant="outline"
              className="w-[255px] h-[40px] rounded-[8px] flex items-center justify-center text-sm border-[1px] border-[var(--primary)]"
            >
              {name}
            </Badge>
          ))}
        </div>
      </Card>

      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Galería de fotos – {String(rama.year ?? getLegacyNumber(rama, 'año') ?? '')}</h2>
          <Button size="sm" variant="outline" onClick={handleGalleryClick} className="border border-primary text-primary hover:bg-accent flex items-center gap-2">Añadir Fotos <Upload className="w-4 h-4"/></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {isLoadingGallery && (
            <div className="col-span-3 text-center text-sm text-muted-foreground">Actualizando galería...</div>
          )}
          {galeriaFotos.map((src, idx) => (
            <div key={idx} className="relative cursor-pointer hover:opacity-80" onClick={() => openGalleryModal(src)}>
              <img
                src={makeDisplaySrc(src) || undefined}
                alt={`Foto ${idx+1}`}
                className="rounded-lg object-cover w-full h-[300px]"
              />
            </div>
          ))}
        </div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" aria-label="Subir fotos a la galería" />
      </Card>
      <FotoModal
        open={fotoModalOpen}
        onClose={() => {
          setFotoModalOpen(false);
          setGaleriaObjetivo("");
          setGaleriaObjetivoId(null);
        }}
        titulo={
          fotoTipo === "icono"
            ? `Ícono de ${rama?.nombre ?? ""}`
            : fotoTipo === "principal"
            ? `Foto principal de ${rama?.nombre ?? ""}`
            : `Foto de galeria - ${rama?.nombre ?? ""}`
        }
        imageUrl={fotoSeleccionada}
        onReplace={handleReplaceFoto}
        onDelete={handleDeleteFoto}
        onCancelUpload={handleCancelUpload}
      />
    </div>
  );
}

