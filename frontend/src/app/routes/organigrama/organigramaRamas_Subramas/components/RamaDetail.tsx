import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { Branch as Rama } from "../types/frontend";
import * as organigramaService from "../services";
import { getSection } from '@/api/organigramaApi';
import { fixSupabaseUrl } from '@/lib/imageUtils';
import useOrganigramaActions from "../hooks/useOrganigramaActions";
import { toast } from "sonner";
import { useTenantParams } from "../hooks/useTenantParams";
import FotoModal from "../components/FotoModal";
import { extractObjectIdFromUrl, resolveGalleryItem } from "../services";
import { useRamaMembers } from "@/hooks/useRamaMembers";
import { getMemberFullName } from "@/hooks/useSubgroupMembers";
import type { Member } from "@/types/member.type";


export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // usar isFetching para representar cualquier carga de tenant/group
  const { tenantId, groupSlug, isFetching } = useTenantParams();
  const [rama, setRama] = useState<Rama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>("https://placehold.co/800x300");
  const [displayMainImage, setDisplayMainImage] = useState<string>("https://placehold.co/800x300");
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);
  const [galleryDisplayFotos, setGalleryDisplayFotos] = useState<string[]>([]);

  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string | null>(null);
  const [uploadCompleteAnnounced, setUploadCompleteAnnounced] = useState(false);
  const [imageRefreshToken, setImageRefreshToken] = useState<number>(Date.now());
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [galleryLocalPreviews, setGalleryLocalPreviews] = useState<string[]>([]);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const mainImageObjectUrlRef = useRef<string | null>(null);
  const galleryObjectUrlsRef = useRef<string[]>([]);
  const fetchRama = useCallback(async () => {
    try {
      if (!id || !tenantId || !groupSlug) return;
      setLoading(true);
      const data = await organigramaService.getRamaById(tenantId, groupSlug, String(id));
      if (data) {
        let ramaData = data as Rama;
        // Si no hay iconObjectId, intentar obtenerlo de sessionStorage
        if (!ramaData.iconObjectId) {
          const storedIcon = sessionStorage.getItem(`icon_${ramaData.id}`);
          if (storedIcon) {
            ramaData = { ...ramaData, iconObjectId: storedIcon };
          }
        }
        setRama(ramaData);
        setImagenPrincipal(getMainImageUrl(data as Rama));
        const rec = data as unknown as Record<string, unknown>;
        const galleryFromRec = (rec['gallery'] as unknown[] | undefined) ?? [];
        let galleryUrls = [] as string[];
        if (Array.isArray(galleryFromRec) && galleryFromRec.length > 0) {
          galleryUrls = (galleryFromRec as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean);
        }
        if (galleryUrls.length === 0) {
          try {
            const backendRec = await getSection(id ?? '', tenantId, groupSlug) as Record<string, unknown>;
            if (backendRec) {
              const fromBackendGallery = (backendRec['gallery'] as unknown[] | undefined) ?? [];
              if (Array.isArray(fromBackendGallery) && fromBackendGallery.length > 0) {
                galleryUrls = (fromBackendGallery as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean);
              } else {
                const maybeUrls = (backendRec['galleryObjectUrls'] as string[] | undefined) ?? (backendRec['galleryObjectIds'] as string[] | undefined) ?? (backendRec['sectionGalleryObjectIds'] as string[] | undefined) ?? [];
                if (Array.isArray(maybeUrls) && maybeUrls.length > 0) {
                  galleryUrls = maybeUrls.map(String).filter(Boolean);
                }
              }
            }
          } catch (err) {
            console.warn('⚠️ [RamaDetail] Fallback GET backend para galería falló:', err);
          }
        }

  setGaleriaFotos(galleryUrls);
      }
    } catch (err) {
      console.error('[RamaDetail] Error cargando rama:', err);
    } finally {
      setLoading(false);
    }
  }, [id, tenantId, groupSlug]);

  // Hook de acciones (incluye acciones de galería y foto principal)
  const { addGalleryImage, replaceGalleryImage, isLoadingGallery, uploadPhotoPrincipal, deletePhotoPrincipal } = useOrganigramaActions({
    tenantId,
    groupSlug,
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

  // Hook para obtener miembros de todas las subramas
  const { subramasWithMembers, loading: membersLoading, error: membersError } = useRamaMembers(rama?.subramas);

  const openIconModal = () => {
    if (!rama) return;
    const url = iconPreview || getIconUrl(rama);
    if (!url) return;
    setFotoTipo("icono");
    setFotoSeleccionada(url);
    setFotoModalOpen(true);
  };

  const openMainImageModal = () => {
    if (!imagenPrincipal && !displayMainImage) return;
    setFotoTipo("principal");
    setFotoSeleccionada(displayMainImage || imagenPrincipal);
    setFotoModalOpen(true);
  };

  const openGalleryModal = (url: string, displayUrl?: string) => {
    setFotoTipo("galeria");
    setFotoSeleccionada(displayUrl ?? url);
    setGaleriaObjetivo(url);
    const maybeUuidInUrl = extractObjectIdFromUrl(url);
    const galleryItems = rama?.gallery ?? [];
    const galleryObj = maybeUuidInUrl
      ? galleryItems.find((item) => item.url.includes(maybeUuidInUrl))
      : undefined;
    setGaleriaObjetivoId(galleryObj?.id ?? null);
    setFotoModalOpen(true);
  };

  const handleReplaceFoto = async (file: File) => {
    if (!rama || !fotoTipo) return;
    try {
      setUploading(true);
      setUploadPercent(0);
      setCurrentUploadingFile(file.name);
      if (uploadControllerRef.current) {
          try { uploadControllerRef.current.abort(); } catch (_err) { console.warn('Could not abort previous upload controller', _err); }
        }
      const controller = new AbortController();
      uploadControllerRef.current = controller;
  if (!tenantId || !groupSlug) {
        throw new Error('Tenant o group no disponibles para manejar imágenes.');
      }
  if (fotoTipo === "icono") {
  const sectionId = String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id);
  await organigramaService.uploadSectionIcon(tenantId, groupSlug, sectionId, file, (fileName, percent) => {
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
  await uploadPhotoPrincipal(sectionId, file, (percent) => {
          setCurrentUploadingFile(file.name);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        });
      } else if (fotoTipo === "galeria") {
        let targetId = galeriaObjetivoId ?? null;
        if (!targetId) {
          try {
            const resolved = await resolveGalleryItem(
              tenantId,
              groupSlug,
              String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id),
              galeriaObjetivo
            );
            if (resolved?.id) {
              targetId = resolved.id;
              setGaleriaObjetivoId(resolved.id);
            }
          } catch (_err) {
            console.error('[RamaDetail] Error resolviendo id para reemplazo de galería:', _err);
          }
        }

        const targetIdOrUuid = targetId ?? extractObjectIdFromUrl(galeriaObjetivo);
        const sectionId = String(rama.sectionId ?? (rama as unknown as Record<string, unknown>)['section_id'] ?? rama.id);
        if (!targetIdOrUuid) {
          toast.error("No se pudo obtener el identificador de la imagen seleccionada");
          return;
        }
        if (!targetId) {
          console.warn(' [RamaDetail] Usando UUID extraído de la URL como fallback para reemplazo:', targetIdOrUuid);
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
      // iconPreview ya se limpió antes del refetch
    }
  };

  const handleDeleteFoto = async () => {
    if (!rama || !fotoTipo) return;
    if (!tenantId || !groupSlug) {
      toast.error('Tenant o grupo no disponibles.');
      return;
    }

    try {
      if (fotoTipo === "icono") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        await organigramaService.removeSectionIcon(tenantId, groupSlug, sectionId);
      } else if (fotoTipo === "principal") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        await deletePhotoPrincipal(sectionId);
      } else if (fotoTipo === "galeria") {
        const sectionId = String(rama.section_id ?? rama.sectionId ?? rama.id);
        let resolvedObjectId = galeriaObjetivoId ?? null;
        if (!resolvedObjectId) {
          try {
            const resolved = await resolveGalleryItem(tenantId, groupSlug, sectionId, galeriaObjetivo);
            if (resolved?.id) {
              resolvedObjectId = resolved.id;
              setGaleriaObjetivoId(resolved.id);
            }
          } catch (_err) {
            console.error('[RamaDetail] Error resolviendo id para eliminación de galería:', _err);
          }
        }

        const finalTarget = resolvedObjectId ?? galeriaObjetivo;
        
        try {
          const result = await organigramaService.deleteGalleryImageById(
            tenantId,
            groupSlug,
            sectionId,
            finalTarget,
            true // deleteFromStorage = true para eliminación física
          );
          
          if (result === null) {
            toast.success('La imagen ya no estaba presente o fue removida anteriormente.');
          } else {
            toast.success('Imagen eliminada físicamente del servidor.');
          }
        } catch (deleteErr) {
          console.error(' [RamaDetail] Error eliminando imagen físicamente:', deleteErr);
          toast.error('Error eliminando la imagen. Inténtalo de nuevo.');
        }
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

  const getIconUrl = (rama: Rama): string => {
    const iconUrl = rama.iconUrl ?? rama.icono;
    
    // DEBUG: Log temporal para diagnosticar el problema
    console.log('🔍 [DEBUG] getIconUrl called:', {
      ramaName: rama.name ?? rama.nombre,
      iconUrl: iconUrl,
      ramaIconUrl: rama.iconUrl,
      ramaIcono: rama.icono,
      hasIconUrl: !!iconUrl
    });
    
    if (iconUrl && iconUrl.startsWith('http')) return fixSupabaseUrl(iconUrl);
    if (iconUrl && iconUrl.startsWith('data:')) return iconUrl;
    console.log(' [RamaDetail] No hay icono disponible para rama:', rama.name ?? rama.nombre);
    return '';
  };

  const getMainImageUrl = (rama: Rama): string => {
    const mainImage = rama.mainImageUrl ?? rama.imagenPrincipal ?? '';
    if (mainImage && !mainImage.startsWith('data:') && mainImage.includes('http')) return mainImage as string;
    if (mainImage && mainImage.startsWith('data:')) return mainImage as string;
    return 'https://placehold.co/800x300/e2e8f0/94a3b8?text=Sin+imagen';
  };

  const makeDisplaySrc = useCallback((src: string | null | undefined) => {
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('data:')) return src;
    
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}v=${imageRefreshToken}`;
  }, [imageRefreshToken]);

  useEffect(() => {
    let cancelled = false;

    const cleanupPrevious = () => {
      if (mainImageObjectUrlRef.current) {
        try {
          URL.revokeObjectURL(mainImageObjectUrlRef.current);
        } catch (err) {
          console.warn('[RamaDetail] No se pudo liberar objectURL previo', err);
        }
        mainImageObjectUrlRef.current = null;
      }
    };

    const hydrateMainImage = async () => {
      const src = imagenPrincipal;

      if (!src) {
        cleanupPrevious();
        setDisplayMainImage('');
        return;
      }

      if (src.startsWith('blob:') || src.startsWith('data:')) {
        cleanupPrevious();
        setDisplayMainImage(src);
        return;
      }

      const requestUrl = makeDisplaySrc(src) ?? src;
      try {
        const response = await fetch(requestUrl, {
          mode: 'cors',
          credentials: 'omit',
          headers: { Accept: 'image/*' },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(blob);
        cleanupPrevious();
        mainImageObjectUrlRef.current = objectUrl;
        setDisplayMainImage(objectUrl);
      } catch (err) {
        console.warn('[RamaDetail] No se pudo hidratar imagen principal, usando URL directa', err);
        if (!cancelled) {
          cleanupPrevious();
          setDisplayMainImage(requestUrl);
        }
      }
    };

    void hydrateMainImage();

    return () => {
      cancelled = true;
      cleanupPrevious();
    };
  }, [imagenPrincipal, imageRefreshToken, makeDisplaySrc]);

  useEffect(() => {
    let cancelled = false;

    const cleanupGallery = () => {
      galleryObjectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (err) {
          console.warn('[RamaDetail] No se pudo liberar objectURL de galería', err);
        }
      });
      galleryObjectUrlsRef.current = [];
    };

    const hydrateGallery = async () => {
      if (galeriaFotos.length === 0) {
        cleanupGallery();
        setGalleryDisplayFotos([]);
        return;
      }

      const results: string[] = [];
      const newObjectUrls: string[] = [];

      for (const original of galeriaFotos) {
        if (!original) {
          results.push('');
          continue;
        }

        if (original.startsWith('blob:') || original.startsWith('data:')) {
          results.push(original);
          continue;
        }

        const requestUrl = makeDisplaySrc(original) ?? original;
        try {
          const response = await fetch(requestUrl, {
            mode: 'cors',
            credentials: 'omit',
            headers: { Accept: 'image/*' },
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const blob = await response.blob();
          if (cancelled) {
            continue;
          }
          const objectUrl = URL.createObjectURL(blob);
          newObjectUrls.push(objectUrl);
          results.push(objectUrl);
        } catch (err) {
          console.warn('[RamaDetail] No se pudo hidratar imagen de galería, usando URL original', err);
          results.push(requestUrl);
        }
      }

      if (!cancelled) {
        cleanupGallery();
        galleryObjectUrlsRef.current = newObjectUrls;
        setGalleryDisplayFotos(results);
      } else {
        newObjectUrls.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch {
            /* ignore */
          }
        });
      }
    };

    void hydrateGallery();

    return () => {
      cancelled = true;
      cleanupGallery();
    };
  }, [galeriaFotos, imageRefreshToken, makeDisplaySrc]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;

    const preview = URL.createObjectURL(file);
    const previousIcon = getIconUrl(rama) || null;
    try {
  setIconPreview(preview);
      setUploading(true);
  setUploadCompleteAnnounced(false);
      setCurrentUploadingFile(file.name);
      setUploadPercent(0);

    if (!tenantId || !groupSlug) {
      toast.error('Tenant o grupo no disponibles.');
      return;
    }

  const uploadResult = await organigramaService.uploadSectionIcon(
    tenantId,
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

  // Actualizar el estado local con el nuevo iconObjectId
  setRama({ ...rama, iconObjectId: uploadResult });
  // Guardar en sessionStorage como respaldo
  sessionStorage.setItem(`icon_${rama.id}`, uploadResult);
  setImageRefreshToken(Date.now());
  setUploadPercent(100);
  toast.success('Ícono actualizado correctamente');
      // Forzar refresh visual de imágenes (cache-busting)
      setImageRefreshToken(Date.now());
    } catch (err) {
      console.error(' [RamaDetail] Error subiendo ícono:', err);
      // Revertir preview en caso de error
      setIconPreview(previousIcon);
      toast.error('Error subiendo el ícono');
    } finally {
      // NO revocar el preview aquí - se revocará cuando se reemplace o al desmontar
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
  // mostrar preview inmediato
  setImagenPrincipal(preview);
  setUploading(true);
  setUploadCompleteAnnounced(false);
      setCurrentUploadingFile(file.name);
      setUploadPercent(0);

    if (!tenantId || !groupSlug) {
      toast.error('Tenant o grupo no disponibles.');
      return;
    }

  await uploadPhotoPrincipal(
    String((rama as unknown as Record<string, unknown>)['section_id'] ?? rama.sectionId ?? rama.id),
        file,
        (percent: number) => {
          setCurrentUploadingFile(file.name);
          const display = percent >= 100 ? 99 : Math.floor(percent);
          setUploadPercent(display);
          if (percent >= 100 && !uploadCompleteAnnounced) {
            setUploadCompleteAnnounced(true);
            toast('Subida completada. Procesando en servidor...');
          }
        }
      );

      if (iconPreview && iconPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(iconPreview);
        } catch (err) {
          console.warn('Could not revoke icon preview blob URL:', err);
        }
      }
      setIconPreview(null);

      console.log('🔍 [DEBUG] About to fetch updated rama...');
      const updatedRama = await organigramaService.getRamaById(tenantId, groupSlug, rama.id);
      console.log('🔍 [DEBUG] Received updatedRama:', {
        hasUpdatedRama: !!updatedRama,
        updatedRamaIconUrl: updatedRama?.iconUrl,
        updatedRamaName: updatedRama?.name
      });
      
      if (updatedRama) {
        console.log('🔍 [DEBUG] About to setRama with updated data...');
        setRama(updatedRama);
        const mainImageUrl = getMainImageUrl(updatedRama);
        setImagenPrincipal(`${mainImageUrl}?v=${Date.now()}`);
        setUploadPercent(100);
        toast.success('Imagen principal actualizada correctamente');
      }
      setImageRefreshToken(Date.now());
    } catch (err) {
      console.error(' [RamaDetail] Error subiendo imagen principal:', err);
      setImagenPrincipal(previousMain || 'https://placehold.co/800x300');
      toast.error('Error subiendo la imagen principal');
    } finally {
      // NO revocar el preview aquí - se revocará cuando se reemplace o al desmontar
      setUploading(false);
      setCurrentUploadingFile(null);
      setUploadPercent(0);
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !rama) return;

    try {
  setUploading(true);
  setUploadCompleteAnnounced(false);
  setUploadPercent(0);
  setCurrentUploadingFile(null);

      const previews = files.map(f => URL.createObjectURL(f));
      setGalleryLocalPreviews(prev => [...prev, ...previews]);
      setGaleriaFotos(prev => [...prev, ...previews]);

      const sectionId = String((rama as unknown as Record<string, unknown>)['section_id'] ?? rama.sectionId ?? rama.id);
      for (const f of files) {
        await addGalleryImage(sectionId, f);
      }

    await fetchRama();
      
  setUploadPercent(100);
  toast.success('Galería actualizada correctamente');
      setImageRefreshToken(Date.now());

      // NO revocar los previews aquí - se revocarán cuando se reemplacen o al desmontar
      setGalleryLocalPreviews(prev => prev.filter(p => !previews.includes(p)));
    } catch (err) {
      console.error(' [RamaDetail] Error subiendo galería:', err);
      const addedPreviews = galleryLocalPreviews.slice(-files.length);
      setGaleriaFotos(prev => prev.filter(src => !addedPreviews.includes(src)));
      // NO revocar los previews aquí - se revocarán cuando se reemplacen o al desmontar
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
    if (!tenantId || !groupSlug) return;
    void fetchRama();
  }, [tenantId, groupSlug, fetchRama]);

  
  useEffect(() => {
    return () => {
      if (imagenPrincipal && imagenPrincipal.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(imagenPrincipal);
        } catch (err) {
          console.warn('Could not revoke main image preview blob URL:', err);
        }
      }
    };
  }, [imagenPrincipal]);

  useEffect(() => {
    return () => {
      galleryLocalPreviews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(preview);
          } catch (err) {
            console.warn('Could not revoke gallery preview blob URL:', err);
          }
        }
      });
    };
  }, [galleryLocalPreviews]);


  if (isFetching) {
    return <p className="text-center mt-6 text-muted-foreground">Cargando contexto del tenant...</p>;
  }

  if (loading) return <p className="text-center mt-6 text-muted-foreground">Cargando detalles...</p>;
  if (!rama) return (
    <div className="text-center mt-6 space-y-4">
      <p className="text-foreground">No se encontró la rama con id: {id}</p>
  <p className="text-sm text-muted-foreground">Tenant: {tenantId ?? 'N/A'} | Group: {groupSlug ?? 'N/A'}</p>
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
          <h1 className="text-2xl font-bold text-primary">Detalles de {rama?.name ?? getLegacyString(rama, 'nombre') ?? ''}</h1>
          <div className="relative">
            <div className="w-[200px] h-[124px] rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-accent transition-colors" onClick={openIconModal}>
              {rama && (iconPreview || getIconUrl(rama)) ? (
                <img 
                  src={iconPreview ? iconPreview : makeDisplaySrc(getIconUrl(rama))!} 
                  alt={`Ícono de ${rama?.name ?? rama?.nombre}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(' Error cargando icono de rama:', getIconUrl(rama));
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
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
          {displayMainImage ? (
            <img src={displayMainImage} alt={rama?.name ?? rama?.nombre} className="object-contain w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <span className="text-muted-foreground">Sin imagen principal</span>
            </div>
          )}
        </div>
        <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" aria-label="Subir imagen principal" />
        
        <div className="pt-4">
          <h3 className="text-md font-semibold text-primary mb-2">Descripción</h3>
          <p className="text-sm text-muted-foreground">{rama.description ?? getLegacyString(rama, 'descripcion') ?? 'Sin descripción'}</p>
        </div>

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
        <h2 className="text-lg font-semibold text-primary">Integrantes</h2>
        
        {membersLoading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Cargando integrantes...</p>
          </div>
        ) : membersError ? (
          <div className="text-center py-4">
            <p className="text-destructive">{membersError}</p>
          </div>
        ) : subramasWithMembers.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No hay subramas disponibles</p>
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {subramasWithMembers.map((subrama) => (
              <AccordionItem key={subrama.subgroupId} value={`subrama-${subrama.subgroupId}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span className="font-medium">{subrama.name}</span>
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>{subrama.jefes.length} jefe{subrama.jefes.length !== 1 ? 's' : ''}</span>
                      <span>•</span>
                      <span>{subrama.scouts.length} scout{subrama.scouts.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {subrama.loading ? (
                    <p className="text-muted-foreground text-sm">Cargando miembros...</p>
                  ) : subrama.error ? (
                    <p className="text-destructive text-sm">{subrama.error}</p>
                  ) : (
                    <>
                      {/* Jefes de Rama - Scouters */}
                      <div>
                        <h4 className="font-medium text-sm text-primary mb-2">Jefe de rama - Scouter</h4>
                        {subrama.jefes.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {subrama.jefes.map((jefe, idx) => (
                              <Badge
                                key={`jefe-${subrama.subgroupId}-${idx}`}
                                variant="default"
                                className="bg-primary text-primary-foreground"
                              >
                                {getMemberFullName(jefe as Member & Record<string, unknown>)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Sin jefe asignado</p>
                        )}
                      </div>

                      {/* Integrantes Scouts Activos */}
                      <div>
                        <h4 className="font-medium text-sm text-primary mb-2">Integrantes scouts activos</h4>
                        {subrama.scouts.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {subrama.scouts.map((scout, idx) => (
                              <Badge
                                key={`scout-${subrama.subgroupId}-${idx}`}
                                variant="outline"
                                className="border-primary text-primary"
                              >
                                {getMemberFullName(scout as Member & Record<string, unknown>)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">Sin scouts activos</p>
                        )}
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
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
          {galeriaFotos.map((src, idx) => {
            const hydrated = galleryDisplayFotos[idx] ?? makeDisplaySrc(src) ?? undefined;
            return (
              <div key={idx} className="relative cursor-pointer hover:opacity-80" onClick={() => openGalleryModal(src, hydrated)}>
                {hydrated ? (
                  <img
                    src={hydrated}
                    alt={`Foto ${idx+1}`}
                    className="rounded-lg object-cover w-full h-[300px]"
                  />
                ) : (
                  <div className="rounded-lg bg-muted flex items-center justify-center w-full h-[300px] text-xs text-muted-foreground">
                    Sin vista previa
                  </div>
                )}
              </div>
            );
          })}
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