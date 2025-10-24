import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subgroup as Subrama } from "../types/frontend";
import * as organigramaService from "../services";
import { useSubgroupMembers, getMemberFullName, getMemberId } from '@/hooks/useSubgroupMembers';
import { useTenantParams } from "../hooks/useTenantParams";
import { toast } from "sonner";
import FotoModal from "../components/FotoModal";
import useOrganigramaActions from "../hooks/useOrganigramaActions";


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
  // Get subgroup ID for the hook
  const subgroupId = subrama ? 
    ((subrama as unknown as Record<string, unknown>)['subgroupId'] ?? 
     (subrama as unknown as Record<string, unknown>)['id']) as number : undefined;
  
  // Use Redux hook for members
  const { members: reduxMembers, loading: membersLoading, error: membersError, fetchMembers } = useSubgroupMembers(subgroupId);

  // ===== Modal de fotos =====
  const [fotoModalOpen, setFotoModalOpen] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string>("");
  const [fotoTipo, setFotoTipo] = useState<"principal" | null>(null);


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

        const sectionId = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
        const subgroupId = subrama.subgroup_id ?? subrama.id ?? '';

        await uploadSubgroupPhotoPrincipal(
          String(sectionId),
          String(subgroupId),
          file,
          (percent) => {
            setUploadPercent(percent >= 100 ? 99 : Math.floor(percent));
            if (percent >= 100 && !uploadCompleteAnnounced) {
              setUploadCompleteAnnounced(true);
              toast('Subida completada. Procesando en servidor...');
            }
          }
        );

        setUploadPercent(100);
        setImageRefreshToken(Date.now());
        toast.success('Imagen principal actualizada correctamente');
      } catch (error) {
        console.error(' [SubramaDetail] Error subiendo imagen principal:', error);
        const msg = error instanceof Error ? error.message : String(error);
        if (msg === 'UploadCanceled' || msg === 'canceled') {
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
      setImagenPrincipal(preview);

      try {
        setUploading(true);
        setUploadPercent(0);
        setUploadCompleteAnnounced(false);
        setCurrentUploadingFile(file.name);

        const sectionId = subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? '';
        const subgroupId = subrama.subgroup_id ?? subrama.id ?? '';

        await uploadSubgroupPhotoPrincipal(
          String(sectionId),
          String(subgroupId),
          file,
          (percent) => {
            setUploadPercent(percent >= 100 ? 99 : Math.floor(percent));
            if (percent >= 100 && !uploadCompleteAnnounced) {
              setUploadCompleteAnnounced(true);
              toast('Subida completada. Procesando en servidor...');
            }
          }
        );

        setUploadPercent(100);
        toast.success("Foto actualizada correctamente");
        setFotoModalOpen(false);
        await fetchSubrama();
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
        // NO revocar el preview aquí - se revocará cuando se reemplace o al desmontar
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
        // Usar la acción de Redux para eliminar la foto principal del subgrupo
        await deleteSubgroupPhotoPrincipal(
          String(subrama.section_id ?? subrama.ramaId ?? subrama.branchId ?? ''),
          String(subrama.subgroup_id ?? subrama.id ?? '')
        );
        toast.success('Imagen principal eliminada correctamente');
      }

      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      setUploadPercent(100);
      setUploadCompleteAnnounced(true);

      setFotoModalOpen(false);
      await fetchSubrama();
    } catch (error) {
      console.error('[SubramaDetail] Error eliminando foto:', error);
      toast.error("Error al eliminar la foto");
    } finally {
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

        // Datos ya vienen en camelCase del backend
        const ramasNorm = ramas || [];
        
        let subramaEncontrada: Subrama | null = null;

        for (const rama of ramasNorm) {
          const subs = (rama.subgroups ?? rama.subramas ?? []) as unknown[];
          const subramaInRama = subs.find((s: unknown) => {
            const rec = s as Record<string, unknown>;
            return String(rec['id'] ?? rec['subgroupId']) === String(id);
          });
          if (subramaInRama) {
            subramaEncontrada = subramaInRama as Subrama;
            break;
          }
        }

        if (subramaEncontrada) {
          setSubrama(subramaEncontrada as Subrama);
          console.log(" [SubramaDetail] Subrama cargada:", subramaEncontrada);

          console.log(" [SubramaDetail] Analizando imagen principal para subrama:", subramaEncontrada.name ?? subramaEncontrada.nombre ?? subramaEncontrada.subgroupName);
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
            console.log(" [SubramaDetail] No hay imagen principal para subrama:", subramaEncontrada.name ?? subramaEncontrada.nombre ?? subramaEncontrada.subgroupName);
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

  // Hook de acciones (incluye acciones de galería y foto principal)
  const { uploadSubgroupPhotoPrincipal, deleteSubgroupPhotoPrincipal } = useOrganigramaActions({
    tenantId: resolvedTenantId,
    groupSlug: resolvedGroupSlug,
    loadRamas: fetchSubrama,
    handleError: (err: unknown) => {
      console.error('Error en acción de organigrama:', err);
      toast.error('Error en operación de organigrama');
    }
  });

  useEffect(() => {
    fetchSubrama();
  }, [fetchSubrama]);

  // Fetch members when subrama is loaded
  useEffect(() => {
    if (subgroupId) {
      fetchMembers(subgroupId).catch(err => {
        console.error('[SubramaDetail] Error cargando miembros por subgrupo', err);
      });
    }
  }, [subgroupId, fetchMembers]);

  // Cleanup para imagenPrincipal - revocar blob cuando cambie o al desmontar
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
          ) : reduxMembers && reduxMembers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {reduxMembers.map((m, idx) => {
                const display = getMemberFullName(m);
                const memberId = getMemberId(m);
                return (
                  <Badge
                    key={String(memberId || idx)}
                    variant="outline"
                    className="w-[255px] h-[40px] rounded-[8px] flex items-center justify-center text-sm border-[1px] border-[var(--primary)]"
                  >
                    {display}
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