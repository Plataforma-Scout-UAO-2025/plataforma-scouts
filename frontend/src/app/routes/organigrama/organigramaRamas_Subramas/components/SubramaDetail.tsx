import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subgroup as Subrama } from "../types/frontend";
import * as organigramaService from "../services";
import api from '@/api/axios';
import { useTenantParams } from "../hooks/useTenantParams";
import { toast } from "sonner";
import FotoModal from "../components/FotoModal";


export default function SubramaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantId, groupSlug, isFetching } = useTenantParams();
  const tenantContext = tenantId && groupSlug ? { tenantId, groupSlug } : null;
  const [subrama, setSubrama] = useState<Subrama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [imageRefreshToken, setImageRefreshToken] = useState<number>(Date.now());
  const makeDisplaySrc = (src: string | null | undefined) => {
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('data:')) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}v=${imageRefreshToken}`;
  };
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [currentUploadingFile, setCurrentUploadingFile] = useState<string | null>(null);
  const [uploadCompleteAnnounced, setUploadCompleteAnnounced] = useState(false);
  const uploadControllerRef = useRef<AbortController | null>(null);
  const deleteIntervalRef = useRef<number | null>(null);
  const uploadIntervalRef = useRef<number | null>(null);
  const uploadProgressReceivedRef = useRef<boolean>(false);
  const uploadAnimateRef = useRef<number | null>(null);
  const previousImagenPrincipalRef = useRef<string | null>(null);
  // Miembros (lista por subgrupo)
  const [members, setMembers] = useState<Array<{ member_id?: number; first_name?: string; last_name?: string; memberId?: number; firstName?: string; lastName?: string }>>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const animatePercentTo = (target: number) => {
    if (uploadAnimateRef.current) {
      clearInterval(uploadAnimateRef.current);
      uploadAnimateRef.current = null;
    }
    uploadAnimateRef.current = window.setInterval(() => {
      setUploadPercent(prev => {
        if (prev >= target) {
          if (uploadAnimateRef.current) {
            clearInterval(uploadAnimateRef.current);
            uploadAnimateRef.current = null;
          }
          return prev;
        }
        const remaining = target - prev;
        const step = remaining > 20 ? Math.ceil(remaining * 0.2) : Math.ceil(Math.max(1, remaining * 0.25));
        const next = prev + step;
        return next > target ? target : next;
      });
    }, 120);
  };
  // ===== Modal de fotos =====
  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string>("");
  const [fotoTipo, setFotoTipo] = useState<"principal" | "galeria" | null>(null);


  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const hasTenantContext = Boolean(tenantContext);
  const resolvedTenantId = tenantId ?? '';
  const resolvedGroupSlug = groupSlug ?? '';

  const handleMainImageClick = () => {
    mainImageInputRef.current?.click();
  };

 
  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && subrama) {
      try {
      console.log(' [SubramaDetail] Subiendo imagen principal:', file.name);
  const preview = URL.createObjectURL(file);
  previousImagenPrincipalRef.current = imagenPrincipal || '';
  setImagenPrincipal(preview);

        if (uploadControllerRef.current) {
          try { uploadControllerRef.current.abort(); } catch (e) { console.warn('Could not abort previous upload controller', e); }
        }
        const controller = new AbortController();
        uploadControllerRef.current = controller;

        setUploading(true);
        setUploadPercent(0);
        setUploadCompleteAnnounced(false);
        setCurrentUploadingFile(file.name);

        uploadProgressReceivedRef.current = false;
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
        }
        uploadIntervalRef.current = window.setInterval(() => {
          setUploadPercent(prev => {
            const next = prev + Math.ceil(Math.random() * 5);
            return next >= 95 ? 95 : next;
          });
        }, 250);

  const sectionId = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
  const subgroupId = subrama.subgroup_id ?? subrama.id ?? '';
        const updatedUrl = await organigramaService.updateSubramaMainImage(
          resolvedTenantId,
          resolvedGroupSlug,
          String(sectionId),
          String(subgroupId),
          file,
          (fileName, percent) => {
            uploadProgressReceivedRef.current = true;
            if (uploadIntervalRef.current) {
              clearInterval(uploadIntervalRef.current);
              uploadIntervalRef.current = null;
            }
            setCurrentUploadingFile(fileName);
            const display = percent >= 100 ? 99 : Math.floor(percent);
            animatePercentTo(display);
            if (percent >= 100 && !uploadCompleteAnnounced) {
              setUploadCompleteAnnounced(true);
              toast('Subida completada. Procesando en servidor...');
            }
          },
          controller.signal
        );
  
  if (uploadControllerRef.current && uploadControllerRef.current.signal.aborted) {
    console.warn('[SubramaDetail] Upload fue abortado - evitando refresh y restaurando preview si aplica');
    throw new Error('UploadCanceled');
  }

  console.log(' [SubramaDetail] Refrescando datos de la subrama...');
  if (updatedUrl) {
    setImagenPrincipal(updatedUrl);
    setImageRefreshToken(Date.now());
    setUploadPercent(100);
    toast.success('Imagen principal actualizada correctamente');
    console.log(' [SubramaDetail] Imagen principal actualizada y persistida');
  } else {
    setUploadPercent(100);
    setImageRefreshToken(Date.now());
    console.log(' [SubramaDetail] Imagen principal actualizada (sin URL devuelta)');
  }
  await fetchSubrama();
      } catch (error) {
        console.error(' [SubramaDetail] Error subiendo imagen principal:', error);
    const msg = error instanceof Error ? error.message : ((error && typeof error === 'object') ? (error as unknown as Record<string, unknown>)['message'] as string ?? String(error) : String(error));
        if (msg === 'UploadCanceled' || msg === 'canceled') {
          console.debug('[SubramaDetail] upload canceled catch: previous=', previousImagenPrincipalRef.current, 'imagenPrincipal=', imagenPrincipal);
          toast('Subida cancelada');
          previousImagenPrincipalRef.current = null;
        } else {
          toast.error('Error subiendo la imagen principal');
          setImagenPrincipal('');
        }
        } finally {
          try { /* no-op cleanup */ } catch (errCleanup) { console.debug('cleanup error', errCleanup); }
          if (uploadIntervalRef.current) {
            clearInterval(uploadIntervalRef.current);
            uploadIntervalRef.current = null;
          }
          if (uploadAnimateRef.current) {
            clearInterval(uploadAnimateRef.current);
            uploadAnimateRef.current = null;
          }
          uploadProgressReceivedRef.current = false;
          setUploading(false);
          setUploadPercent(0);
          setCurrentUploadingFile(null);
          if (uploadControllerRef.current) {
            uploadControllerRef.current = null;
          }
      }
    }
  };

 

  // Abrir modal según tipo de imagen
  const openMainImageModal = () => {
    if (!imagenPrincipal) return;
    setFotoTipo("principal");
    setFotoSeleccionada(imagenPrincipal);
    setFotoModalOpen(true);
  };

  const handleReplaceFoto = async (file: File) => {
    if (!subrama || !fotoTipo) return;
    if (fotoTipo === 'principal') {
  const preview = URL.createObjectURL(file);
  previousImagenPrincipalRef.current = imagenPrincipal || '';
      if (uploadControllerRef.current) {
        try { uploadControllerRef.current.abort(); } catch (e) { console.warn('Could not abort previous upload controller', e); }
      }
      const controller = new AbortController();
      uploadControllerRef.current = controller;

      try {
        setImagenPrincipal(preview);
        setUploading(true);
        setUploadPercent(0);
        setUploadCompleteAnnounced(false);
        setCurrentUploadingFile(file.name);

        uploadProgressReceivedRef.current = false;
        if (uploadIntervalRef.current) {
          clearInterval(uploadIntervalRef.current);
          uploadIntervalRef.current = null;
        }
        uploadIntervalRef.current = window.setInterval(() => {
          setUploadPercent(prev => {
            const next = prev + Math.ceil(Math.random() * 5);
            return next >= 95 ? 95 : next;
          });
        }, 250);

        const sectionId2 = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
        const subgroupId2 = subrama.subgroup_id ?? subrama.id ?? '';
        const updatedUrl = await organigramaService.updateSubramaMainImage(
          resolvedTenantId,
          resolvedGroupSlug,
          String(sectionId2),
          String(subgroupId2),
          file,
          (fileName, percent) => {
            uploadProgressReceivedRef.current = true;
            if (uploadIntervalRef.current) {
              clearInterval(uploadIntervalRef.current);
              uploadIntervalRef.current = null;
            }
            setCurrentUploadingFile(fileName);
            const display = percent >= 100 ? 99 : Math.floor(percent);
            animatePercentTo(display);
            if (percent >= 100 && !uploadCompleteAnnounced) {
              setUploadCompleteAnnounced(true);
              toast('Subida completada. Procesando en servidor...');
            }
          },
          controller.signal
        );

        if (uploadControllerRef.current && uploadControllerRef.current.signal.aborted) {
          console.warn('[SubramaDetail] modal upload fue abortado - evitando refresh y restaurando preview');
          throw new Error('UploadCanceled');
        }

        if (updatedUrl) {
          setImagenPrincipal(updatedUrl);
          setImageRefreshToken(Date.now());
          setUploadPercent(100);
          toast.success('Imagen principal actualizada correctamente');
        } else {
          setUploadPercent(100);
          setImageRefreshToken(Date.now());
          console.log(' [SubramaDetail] Imagen principal actualizada (sin URL devuelta)');
        }
        await fetchSubrama();

        setFotoModalOpen(false);
      } catch (error) {
        console.error(' [SubramaDetail] Error reemplazando imagen principal desde modal:', error);
    const msg = error instanceof Error ? error.message : ((error && typeof error === 'object') ? (error as unknown as Record<string, unknown>)['message'] as string ?? String(error) : String(error));
        if (msg === 'UploadCanceled' || msg === 'canceled') {
          console.debug('[SubramaDetail] modal upload canceled catch: previous=', previousImagenPrincipalRef.current, 'imagenPrincipal=', imagenPrincipal);
          toast('Subida cancelada');
          previousImagenPrincipalRef.current = null;
        } else {
          toast.error('Error actualizando la imagen');
          setImagenPrincipal('');
        }
      } finally {
        try { URL.revokeObjectURL(preview); } catch { /* ignore */ }
        if (uploadIntervalRef.current) { clearInterval(uploadIntervalRef.current); uploadIntervalRef.current = null; }
        if (uploadAnimateRef.current) { clearInterval(uploadAnimateRef.current); uploadAnimateRef.current = null; }
        uploadProgressReceivedRef.current = false;
        setUploading(false);
        setUploadPercent(0);
        setCurrentUploadingFile(null);
        if (uploadControllerRef.current) { uploadControllerRef.current = null; }
      }
      return;
    }

        
    try {
  const cleanUuid = ''.match(/[0-9a-fA-F-]{36}/)?.[0] || '';
  const sectionIdReplace = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
  const subgroupIdReplace = subrama.subgroup_id ?? subrama.id ?? '';
      await organigramaService.replaceSubramaGalleryImage(
        resolvedTenantId,
        resolvedGroupSlug,
        String(sectionIdReplace),
        String(subgroupIdReplace),
        cleanUuid,
        file
      );
      toast.success("Foto actualizada correctamente");
      setFotoModalOpen(false);
      await fetchSubrama();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la foto");
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
      console.debug('[SubramaDetail] handleCancelUpload: previousImagenPrincipalRef=', previousImagenPrincipalRef.current, 'current imagenPrincipal=', imagenPrincipal);
      
      try {
        previousImagenPrincipalRef.current = null;
      } catch (err) {
        console.warn('Error limpiando referencia previa tras cancel:', err);
      }
    }
  };

  const handleDeleteFoto = async () => {
    if (!subrama || !fotoTipo) return;

    try {
      setUploading(true);
      setUploadPercent(0);
      setUploadCompleteAnnounced(false);
      setCurrentUploadingFile('Eliminando imagen...');

      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      deleteIntervalRef.current = window.setInterval(() => {
        setUploadPercent(prev => {
          const next = prev + Math.ceil(Math.random() * 4);
          return next >= 95 ? 95 : next;
        });
      }, 300);

      if (fotoTipo === "principal") {
  const sectionIdDel = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
  const subgroupIdDel = subrama.subgroup_id ?? subrama.id ?? '';
        await organigramaService.removeSubramaMainImage(
          resolvedTenantId,
          resolvedGroupSlug,
          String(sectionIdDel),
          String(subgroupIdDel)
        );
        try {
          const refreshed = await organigramaService.getSubramaById(resolvedTenantId, resolvedGroupSlug, String(sectionIdDel), String(subgroupIdDel));
          const mainStill = refreshed?.imagenPrincipal ?? refreshed?.mainImageUrl ?? null;
          if (mainStill) {
            console.warn('[SubramaDetail] La imagen principal sigue presente tras remove; la eliminación física pudo fallar o no aplicarse');
            toast.warning('La imagen fue desvinculada, pero su eliminación física puede haber fallado. Por favor verifica en el servidor.');
          } else {
            toast.success('Imagen principal eliminada correctamente');
          }
        } catch (err) {
          console.warn('[SubramaDetail] No se pudo verificar estado tras remove main image:', err);
          toast('Operación completada. Verificar estado en el servidor si es necesario');
        }
      } else if (fotoTipo === "galeria") {
        
        const sectionIdDel = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
        const subgroupIdDel = subrama.subgroup_id ?? subrama.id ?? '';
        const candidate = fotoSeleccionada || '';
        const cleanUuid = (candidate.match(/[0-9a-fA-F-]{36}/) || [])[0] || '';

        if (!cleanUuid) {
          console.warn('[SubramaDetail] No se pudo extraer UUID de la foto seleccionada, usando fallback remove (PATCH)');
          await organigramaService.removeSubramaGalleryImage(
            resolvedTenantId,
            resolvedGroupSlug,
            String(sectionIdDel),
            String(subgroupIdDel),
            ''
          );
          toast.success('Foto removida de la galería (fallback).');
        } else {
          try {
            const result = await organigramaService.deleteGalleryImageById(
              resolvedTenantId,
              resolvedGroupSlug,
              String(sectionIdDel),
              cleanUuid,
              true
            );

            if (result === null) {
              toast.success('La foto ya no estaba presente o fue removida anteriormente.');
            } else {
              toast.success('Foto eliminada físicamente (intento realizado).');
            }
          } catch (err) {
            console.error('[SubramaDetail] Error intentando DELETE físico de galería:', err);
            toast.error('No fue posible eliminar físicamente la foto. Se intentó desvincular la referencia.');
          }
        }
      }

      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      setUploadPercent(100);
      setUploadCompleteAnnounced(true);
      toast('Subida completada. Procesando en servidor...');

      setFotoModalOpen(false);
      await fetchSubrama();
      toast.success("Foto eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la foto");
    }
    finally {
      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      setUploading(false);
      setUploadPercent(0);
      setCurrentUploadingFile(null);
      setUploadCompleteAnnounced(false);
    }
  };

  const fetchSubrama = useCallback(async () => {
    try {
      if (!id) {
        console.error(" [SubramaDetail] ID de subrama no proporcionado");
        return;
      }

      if (!hasTenantContext) {
        console.warn('[SubramaDetail] Tenant o grupo no disponibles aún; omitiendo fetch');
        return;
      }

      console.log(" [SubramaDetail] Obteniendo subrama con ID:", id, { tenantId: resolvedTenantId, groupSlug: resolvedGroupSlug });
        
      const ramas = await organigramaService.getRamasWithSubramas(resolvedTenantId, resolvedGroupSlug);
        
        let subramaEncontrada: Subrama | null = null;
        
        for (const rama of ramas) {
          const subramaInRama = (rama.subgroups ?? rama.subramas ?? []).find((s: Subrama) => s.id === id);
          if (subramaInRama) {
            subramaEncontrada = subramaInRama;
            break;
          }
        }
        
        if (subramaEncontrada) {
          setSubrama(subramaEncontrada);
          console.log(" [SubramaDetail] Subrama cargada:", subramaEncontrada);

          console.log(" [SubramaDetail] Analizando imagen principal para subrama:", subramaEncontrada.name ?? subramaEncontrada.nombre);
          console.log(" [SubramaDetail] subrama.imagenPrincipal:", subramaEncontrada.imagenPrincipal);

          const backendMainImage = (subramaEncontrada as { mainImageUrl?: string }).mainImageUrl;
          const resolvedMainImage = backendMainImage ?? subramaEncontrada.imagenPrincipal ?? '';

          if (resolvedMainImage) {
            if (!resolvedMainImage.startsWith('data:') && resolvedMainImage.includes('http')) {
              console.log(" [SubramaDetail] Usando URL directa del backend para imagen principal:", resolvedMainImage);
            } else if (resolvedMainImage.startsWith('data:')) {
              console.log(" [SubramaDetail] Usando data URL para imagen principal");
            } else {
              console.log(" [SubramaDetail] Usando campo imagenPrincipal como URL:", resolvedMainImage);
            }
            setImagenPrincipal(resolvedMainImage);
            setImageRefreshToken(Date.now());
          } else {
            console.log(" [SubramaDetail] No hay imagen principal para subrama:", subramaEncontrada.nombre);
            setImagenPrincipal('');
            setImageRefreshToken(Date.now());
          }

          const rawGallery = (subramaEncontrada as unknown as Record<string, unknown>)['gallery'] as unknown[] | undefined;
          const galleryUrls = Array.isArray(rawGallery) && rawGallery.length > 0
            ? (rawGallery as Array<Record<string, unknown>>).map(g => String(g.url)).filter(Boolean)
            : (subramaEncontrada.galleryObjectIds ?? subramaEncontrada.subgroupGalleryObjectIds ?? []);

          if (galleryUrls && galleryUrls.length > 0) {
            console.log(` [SubramaDetail] Cargadas ${galleryUrls.length} imágenes de galería desde backend`);
            console.log(' [SubramaDetail] URLs de galería:', galleryUrls);
          } else {
            console.log(' [SubramaDetail] No hay imágenes en la galería de la subrama');
          }
        } else {
          console.warn(" [SubramaDetail] No se encontró la subrama con ID:", id);
        }
    } catch (error) {
      console.error(" [SubramaDetail] Error cargando subrama:", error);
    } finally {
      setLoading(false);
    }
  }, [id, hasTenantContext, resolvedTenantId, resolvedGroupSlug]);

  useEffect(() => {
    fetchSubrama();
  }, [fetchSubrama]);

  // Cargar miembros del subgrupo cuando la subrama este cargada (llamada local a api)
  const fetchMembers = useCallback(async (subgrp: Subrama | null) => {
    if (!subgrp) return;
    const subgroupRec = subgrp as unknown as Record<string, unknown>;
    const subgroupId = subgroupRec['subgroup_id'] ?? subgroupRec['id'] ?? subgroupRec['subgroupId'];
    if (!subgroupId) return;
    try {
      setMembersLoading(true);
      setMembersError(null);
      const resp = await api.get('/members/list_members_by_subgroup', { params: { id: String(subgroupId) } });
      const data = resp?.data ?? [];
      const normalized = (data || []).map((m: unknown) => {
        const rec = m as unknown as Record<string, unknown>;
        const memberId = rec['memberId'] ?? rec['member_id'] ?? rec['id'];
        const firstName = rec['firstName'] ?? rec['first_name'];
        const lastName = rec['lastName'] ?? rec['last_name'];
        return {
          member_id: memberId,
          first_name: firstName,
          last_name: lastName,
          memberId: memberId,
          firstName: firstName,
          lastName: lastName,
        };
      });
      setMembers(normalized);
    } catch (err) {
      console.error('[SubramaDetail] Error cargando miembros por subgrupo', err);
      setMembersError('No se pudieron cargar los integrantes');
    } finally {
      setMembersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subrama) fetchMembers(subrama);
  }, [subrama, fetchMembers]);

  if (!hasTenantContext) {
    if (isFetching) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Cargando contexto del tenant...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No fue posible determinar el tenant o grupo actual.</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Regresar
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando detalles de la subrama...</p>
        </div>
      </div>
    );
  }

  if (!subrama) {
    return (
      <div className="text-center mt-6 space-y-4">
        <p className="text-foreground">No se encontró la subrama con id: {id}</p>
        <p className="text-muted-foreground">
          Tenant: {resolvedTenantId} | Group: {resolvedGroupSlug}
        </p>
        <Button
          onClick={() => navigate('/app/organigrama')}
          variant="outline"
          className="mt-4"
        >
          Volver
        </Button>
      </div>
    );
  }

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
                Procesando en servidor...
              </div>
            )}
          </div>
        </div>
      )}
      {/* Cabecera */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">
              Detalles de {subrama.nombre}
            </h1>
          </div>
        </div>
        
        {/* Botón Anterior */}
        <div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="border border-secondary text-secondary hover:bg-accent"
          >
            Anterior
          </Button>
        </div>
      </div>

      {/* Información Principal */}
      <Card className="p-4 space-y-4 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">Información Principal</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMainImageClick}
            className="border border-primary text-primary hover:bg-accent flex items-center gap-2"
          >
            Añadir Foto
            <Upload className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gray-100" onClick={openMainImageModal}>
          {imagenPrincipal ? (
              <>
                <img
                  src={makeDisplaySrc(imagenPrincipal) || undefined}
                  alt={subrama.nombre}
                  className="object-contain w-full h-full"
                />
                {/* El progreso ahora se muestra en el modal flotante superior (como en RamaDetail) */}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[rgba(234,241,246,0.9)]">
                <div className="text-center">
                  <span className="text-[72px] leading-none text-muted-foreground font-semibold">Sin imagen</span>
                </div>
              </div>
            )}
        </div>

        {/* Input oculto para imagen principal */}
        <input
          ref={mainImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleMainImageChange}
          className="hidden"
          aria-label="Subir imagen principal"
        />

        <p className="text-sm text-muted-foreground">
          {subrama.description ?? subrama.descripcion ?? "Sin descripción"}
        </p>
      </Card>

      {/* Integrantes */}
      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <h2 className="text-lg font-semibold text-primary">
          Integrantes
        </h2>
        <div className="flex flex-col gap-2">
          {membersLoading ? (
            <div className="text-sm text-muted-foreground">Cargando integrantes...</div>
          ) : membersError ? (
            <div className="text-sm text-destructive">{membersError}</div>
          ) : members && members.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {members.map((m, idx) => {
                const display = (m.firstName || m.first_name || '') + (m.lastName || m.last_name ? ` ${m.lastName || m.last_name}` : '');
                return (
                  <Badge
                    key={String(m.memberId ?? m.member_id ?? idx)}
                    variant="outline"
                    className="w-[255px] h-[40px] rounded-[8px] flex items-center justify-center text-sm border-[1px] border-[var(--primary)]"
                  >
                    {display || `Miembro ${m.member_id ?? m.memberId ?? idx}`}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay integrantes registrados en esta subrama.</div>
          )}
        </div>
      </Card>

      {/* Galería eliminada: sección removida por requerimiento */}
      <FotoModal
        open={fotoModalOpen}
        onClose={() => setFotoModalOpen(false)}
        titulo={
          fotoTipo === "principal"
            ? `Foto principal de ${subrama?.nombre ?? ""}`
            : `Foto de galería - ${subrama?.nombre ?? ""}`
        }
        imageUrl={fotoSeleccionada}
        onReplace={handleReplaceFoto}
        onDelete={handleDeleteFoto}
        onCancelUpload={handleCancelUpload}
      />
    </div>
  );
}




