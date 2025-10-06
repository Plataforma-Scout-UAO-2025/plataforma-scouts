import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subrama } from "../types/rama.type";
import * as organigramaService from "../services";
import { useTenantParams } from "../hooks/useTenantParams";
import { toast } from "sonner";
import FotoModal from "../components/FotoModal";


export default function SubramaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantSlug, groupSlug } = useTenantParams();
  const [subrama, setSubrama] = useState<Subrama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);
  // Token para forzar recarga de imágenes (cache-busting)
  const [imageRefreshToken, setImageRefreshToken] = useState<number>(Date.now());
  // Helper para display src (añade cache-bust si es URL remota)
  const makeDisplaySrc = (src: string | null | undefined) => {
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('data:')) return src;
    const separator = src.includes('?') ? '&' : '?';
    return `${src}${separator}v=${imageRefreshToken}`;
  };
  // Estados para mostrar progreso de subida (replicar como en RamaDetail)
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

  const animatePercentTo = (target: number) => {
    // limpiar cualquier animación previa
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
        // incrementar en pasos más pequeños cuando estamos cerca
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
  const [galeriaObjetivo, setGaleriaObjetivo] = useState<string>("");


  // Referencias para inputs de archivos
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleMainImageClick = () => {
    mainImageInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && subrama) {
      try {
      console.log('🔄 [SubramaDetail] Subiendo imagen principal:', file.name);
  const preview = URL.createObjectURL(file);
  // guardar imagen previa para poder revertir si se cancela
  previousImagenPrincipalRef.current = imagenPrincipal || '';
  setImagenPrincipal(preview);

        // Preparar AbortController y estados de progreso
        if (uploadControllerRef.current) {
          try { uploadControllerRef.current.abort(); } catch (e) { console.warn('Could not abort previous upload controller', e); }
        }
        const controller = new AbortController();
        uploadControllerRef.current = controller;

        setUploading(true);
        setUploadPercent(0);
        setUploadCompleteAnnounced(false);
        setCurrentUploadingFile(file.name);

        // Iniciar progreso simulado por si no llegan eventos de progreso reales
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

        await organigramaService.updateSubramaMainImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          file,
          (fileName, percent) => {
            // cuando llegan eventos reales, cancelar simulado y animar hasta el valor real
            uploadProgressReceivedRef.current = true;
            if (uploadIntervalRef.current) {
              clearInterval(uploadIntervalRef.current);
              uploadIntervalRef.current = null;
            }
            setCurrentUploadingFile(fileName);
            const display = percent >= 100 ? 99 : Math.floor(percent);
            // animar gradualmente hasta display para evitar saltos bruscos
            animatePercentTo(display);
            if (percent >= 100 && !uploadCompleteAnnounced) {
              setUploadCompleteAnnounced(true);
              toast('Subida completada. Procesando en servidor...');
            }
          },
          controller.signal
        );
  // Si la operación fue cancelada por la señal, updateSubramaMainImage lanzará
  // 'UploadCanceled' y caeremos en el catch. Para prevenir races, comprobamos
  // si el controller fue abortado antes de hacer fetch/patch finalizados.
  if (uploadControllerRef.current && uploadControllerRef.current.signal.aborted) {
    console.warn('[SubramaDetail] Upload fue abortado - evitando refresh y restaurando preview si aplica');
    throw new Error('UploadCanceled');
  }

  // Refrescar datos de la subrama para asegurar sincronización
  console.log('🔄 [SubramaDetail] Refrescando datos de la subrama...');
  await fetchSubrama();
  // Obtener la subrama actualizada directamente para obtener la URL definitiva
  try {
    const updated = await organigramaService.getSubramaById(tenantSlug, groupSlug, subrama.section_id, subrama.subgroup_id);
    if (updated && updated.imagenPrincipal) {
      // Actualizar visualmente con cache-bust igual que RamaDetail
      setImagenPrincipal(`${updated.imagenPrincipal}?v=${Date.now()}`);
      setUploadPercent(100);
      toast.success('Imagen principal actualizada correctamente');
      console.log('✅ [SubramaDetail] Imagen principal actualizada y persistida');
    } else {
      // marcar 100% y refrescar token aunque no tengamos URL directa
      setUploadPercent(100);
      setImageRefreshToken(Date.now());
      console.log('✅ [SubramaDetail] Imagen principal actualizada (sin URL devuelta)');
    }
  } catch (err) {
    console.warn('⚠️ [SubramaDetail] No se pudo obtener subrama actualizada tras upload:', err);
    setUploadPercent(100);
    setImageRefreshToken(Date.now());
  }
      } catch (error) {
        console.error('❌ [SubramaDetail] Error subiendo imagen principal:', error);
        const msg = (error as any)?.message || '';
        if (msg === 'UploadCanceled' || msg === 'canceled') {
          console.debug('[SubramaDetail] upload canceled catch: previous=', previousImagenPrincipalRef.current, 'imagenPrincipal=', imagenPrincipal);
          toast('Subida cancelada');
          // NUEVO: dejar el preview actual (blob) visible para simular cancel.
          // Limpiar referencia previa.
          previousImagenPrincipalRef.current = null;
        } else {
          toast.error('Error subiendo la imagen principal');
          setImagenPrincipal('');
        }
      } finally {
          try { /* nothing to revoke here - previews are revoked by FotoModal when needed */ } catch { /* ignore */ }
          // limpiar intervalo simulado y animaciones si siguen activos
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

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && subrama) {
      const previews = files.map(f => URL.createObjectURL(f));
      setGaleriaFotos(prev => [...prev, ...previews]);
      
      try {
        console.log('🔄 [SubramaDetail] Subiendo fotos a la galería:', files.length);

        await organigramaService.uploadSubramaGalleryImages(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          files
        );

        console.log('✅ [SubramaDetail] Fotos de galería subidas correctamente');
        console.log('🔄 [SubramaDetail] Refrescando datos completos de la subrama...');
        
        // Recargar datos completos de la subrama para sincronizar con backend
        await fetchSubrama();
        
        console.log('✅ [SubramaDetail] Datos de subrama actualizados después del upload');
      } catch (error) {
        console.error('❌ [SubramaDetail] Error subiendo fotos de galería:', error);
        // Limpiar previews en caso de error
        setGaleriaFotos(prev => prev.slice(0, -previews.length));
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

  const openGalleryModal = (url: string) => {
    setFotoTipo("galeria");
    setFotoSeleccionada(url);
    setGaleriaObjetivo(url);
    setFotoModalOpen(true);
  };

  const handleReplaceFoto = async (file: File) => {
    if (!subrama || !fotoTipo) return;

    // Si es principal, usar el mismo flujo que el input principal para mostrar progreso
    if (fotoTipo === 'principal') {
  const preview = URL.createObjectURL(file);
  // guardar imagen previa para poder revertir si se cancela
  previousImagenPrincipalRef.current = imagenPrincipal || '';
      // preparar abort controller
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

        // iniciar simulador por si no se reciben eventos de progreso
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

        await organigramaService.updateSubramaMainImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
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

        // refrescar y obtener URL definitiva
        // Antes de refrescar, verificar si la señal fue abortada (cancel)
        if (uploadControllerRef.current && uploadControllerRef.current.signal.aborted) {
          console.warn('[SubramaDetail] modal upload fue abortado - evitando refresh y restaurando preview');
          throw new Error('UploadCanceled');
        }

        await fetchSubrama();
        try {
          const updated = await organigramaService.getSubramaById(tenantSlug, groupSlug, subrama.section_id, subrama.subgroup_id);
          if (updated && updated.imagenPrincipal) {
            setImagenPrincipal(`${updated.imagenPrincipal}?v=${Date.now()}`);
            setUploadPercent(100);
            toast.success('Imagen principal actualizada correctamente');
          } else {
            setUploadPercent(100);
            setImageRefreshToken(Date.now());
          }
        } catch (err) {
          console.warn('⚠️ [SubramaDetail] No se pudo obtener subrama actualizada tras replace:', err);
          setUploadPercent(100);
          setImageRefreshToken(Date.now());
        }

        setFotoModalOpen(false);
      } catch (error) {
        console.error('❌ [SubramaDetail] Error reemplazando imagen principal desde modal:', error);
        const msg = (error as any)?.message || '';
        if (msg === 'UploadCanceled' || msg === 'canceled') {
          console.debug('[SubramaDetail] modal upload canceled catch: previous=', previousImagenPrincipalRef.current, 'imagenPrincipal=', imagenPrincipal);
          toast('Subida cancelada');
          // Mantener preview actual y limpiar referencia previa
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

    // Si es galería, usar el servicio de reemplazo de galería (sin progreso complejo por ahora)
    try {
      const cleanUuid = galeriaObjetivo.match(/[0-9a-fA-F-]{36}/)?.[0] || galeriaObjetivo;
      await organigramaService.replaceSubramaGalleryImage(
        tenantSlug,
        groupSlug,
        subrama.section_id,
        subrama.subgroup_id,
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
      // Revertir preview si existía (logs para diagnóstico)
      console.debug('[SubramaDetail] handleCancelUpload: previousImagenPrincipalRef=', previousImagenPrincipalRef.current, 'current imagenPrincipal=', imagenPrincipal);
      // NUEVA LÓGICA: conservar la imagen actual (preview) cuando el usuario
      // pulsa cancelar. Esto simula la cancelación para el usuario aunque la
      // operación real quede abortada en segundo plano.
      // Limpiar la referencia a la imagen previa para evitar futuros reverts.
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
      // Mostrar UI de progreso durante la eliminación para dar feedback al usuario
      setUploading(true);
      setUploadPercent(0);
      setUploadCompleteAnnounced(false);
      setCurrentUploadingFile('Eliminando imagen...');

      // Simular progreso incremental mientras la petición de eliminación ocurre
      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      deleteIntervalRef.current = window.setInterval(() => {
        setUploadPercent(prev => {
          // incrementar lentamente hasta 94-96%
          const next = prev + Math.ceil(Math.random() * 4);
          return next >= 95 ? 95 : next;
        });
      }, 300);

      if (fotoTipo === "principal") {
        // 🧩 NUEVO: eliminar imagen principal
        await organigramaService.removeSubramaMainImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id
        );
      } else if (fotoTipo === "galeria") {
        // 🧠 Extraer UUID limpio
        const cleanUuid = galeriaObjetivo.match(/[0-9a-fA-F-]{36}/)?.[0] || galeriaObjetivo;
        await organigramaService.removeSubramaGalleryImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          cleanUuid
        );
      }

      // Al completar la petición de eliminación, marcar 100% y anunciar procesamiento
      if (deleteIntervalRef.current) {
        clearInterval(deleteIntervalRef.current);
        deleteIntervalRef.current = null;
      }
      setUploadPercent(100);
      setUploadCompleteAnnounced(true);
      toast('Subida completada. Procesando en servidor...');

      setFotoModalOpen(false);
      // Refrescar para que el frontend reciba la versión actualizada del backend
      await fetchSubrama();
      // Mensaje final de éxito cuando el backend confirma la eliminación
      toast.success("Foto eliminada correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la foto");
    }
    finally {
      // Asegurarse de limpiar cualquier estado de progreso residual
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

  const fetchSubrama = async () => {
    try {
      if (id) {
        console.log("🔄 [SubramaDetail] Obteniendo subrama con ID:", id, { tenantSlug, groupSlug });
        
        const ramas = await organigramaService.getRamas(tenantSlug, groupSlug);
        
        let subramaEncontrada: Subrama | null = null;
        
        for (const rama of ramas) {
          const subramaInRama = rama.subramas.find((s: Subrama) => s.id === id);
          if (subramaInRama) {
            subramaEncontrada = subramaInRama;
            break;
          }
        }
        
        if (subramaEncontrada) {
          setSubrama(subramaEncontrada);
          console.log("✅ [SubramaDetail] Subrama cargada:", subramaEncontrada);

          // 📸 Cargar imágenes existentes (PRIORIZAR URLs directas del backend)
          console.log("🔍 [SubramaDetail] Analizando imagen principal para subrama:", subramaEncontrada.nombre);
          console.log("🔍 [SubramaDetail] subrama.imagenPrincipal:", subramaEncontrada.imagenPrincipal);
          
          // PRIORIDAD 1: URL directa del backend (campo optimizado)
          if (subramaEncontrada.imagenPrincipal && !subramaEncontrada.imagenPrincipal.startsWith('data:') && subramaEncontrada.imagenPrincipal.includes('http')) {
            setImagenPrincipal(subramaEncontrada.imagenPrincipal);
            console.log("✅ [SubramaDetail] Usando URL directa del backend para imagen principal:", subramaEncontrada.imagenPrincipal);
          }
          // PRIORIDAD 2: URL de datos (data:image/...)
          else if (subramaEncontrada.imagenPrincipal && subramaEncontrada.imagenPrincipal.startsWith('data:')) {
            setImagenPrincipal(subramaEncontrada.imagenPrincipal);
            console.log("✅ [SubramaDetail] Usando data URL para imagen principal");
          }
          // PRIORIDAD 3: Cualquier URL en campo imagenPrincipal
          else if (subramaEncontrada.imagenPrincipal) {
            setImagenPrincipal(subramaEncontrada.imagenPrincipal);
            console.log("✅ [SubramaDetail] Usando campo imagenPrincipal como URL:", subramaEncontrada.imagenPrincipal);
          }
          else {
            console.log("ℹ️ [SubramaDetail] No hay imagen principal para subrama:", subramaEncontrada.nombre);
            // Forzar estado vacío para que la UI deje de renderizar cualquier imagen previa
            setImagenPrincipal('');
          }

          // Cargar galería desde backend (URLs directas)
          if (subramaEncontrada.subgroupGalleryObjectIds && subramaEncontrada.subgroupGalleryObjectIds.length > 0) {
            setGaleriaFotos(subramaEncontrada.subgroupGalleryObjectIds);
            console.log(`📸 [SubramaDetail] Cargadas ${subramaEncontrada.subgroupGalleryObjectIds.length} imágenes de galería desde backend`);
            console.log('🔗 [SubramaDetail] URLs de galería:', subramaEncontrada.subgroupGalleryObjectIds);
          } else {
            console.log('ℹ️ [SubramaDetail] No hay imágenes en la galería de la subrama');
            setGaleriaFotos([]);
          }
        } else {
          console.warn("⚠️ [SubramaDetail] No se encontró la subrama con ID:", id);
        }
      } else {
        console.error("❌ [SubramaDetail] ID de subrama no proporcionado");
      }
    } catch (error) {
      console.error("❌ [SubramaDetail] Error cargando subrama:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubrama();
  }, [id, tenantSlug, groupSlug]);

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
          Tenant: {tenantSlug} | Group: {groupSlug}
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
          {subrama.descripcion || "Sin descripción"}
        </p>
      </Card>

      {/* Integrantes */}
      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <h2 className="text-lg font-semibold text-primary">
          Integrantes
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* ⚠️ Mock temporal */}
          {["Roberto Restrepo", "Carlos Camargo", "Ana Aguillón", "Mario Mora"].map(
            (name, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="w-[255px] h-[40px] rounded-[8px] flex items-center justify-center text-sm border-[1px] border-[var(--primary)]"
              >
                {name}
              </Badge>
            )
          )}
        </div>
      </Card>

      {/* Galería */}
      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-primary">
            Galería de fotos
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={handleGalleryClick}
            className="border border-primary text-primary hover:bg-accent flex items-center gap-2"
          >
            Añadir Fotos
            <Upload className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {galeriaFotos.map((src, idx) => (
            <div key={idx} className="relative cursor-pointer hover:opacity-80" onClick={() => openGalleryModal(src)}>
              <img
                src={src}
                alt={`Foto ${idx + 1}`}
                className="rounded-lg object-cover w-full h-[300px]"
              />
            </div>
          ))}
        </div>

        {/* Input oculto para galería */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
          className="hidden"
          aria-label="Subir fotos a la galería"
        />
      </Card>
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




