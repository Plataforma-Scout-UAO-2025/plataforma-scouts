import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Users } from "lucide-react";
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
        setImagenPrincipal(preview);

        const publicUrl = await organigramaService.updateSubramaMainImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          file
        );

        setImagenPrincipal(publicUrl);
        console.log('✅ [SubramaDetail] Imagen principal actualizada y persistida');
        
        // Refrescar datos de la subrama para asegurar sincronización
        console.log('🔄 [SubramaDetail] Refrescando datos de la subrama...');
        await fetchSubrama();
      } catch (error) {
        console.error('❌ [SubramaDetail] Error subiendo imagen principal:', error);
        setImagenPrincipal('');
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

    try {
      if (fotoTipo === "principal") {
        await organigramaService.updateSubramaMainImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          file
        );
      } else if (fotoTipo === "galeria") {
        const cleanUuid = galeriaObjetivo.match(/[0-9a-fA-F-]{36}/)?.[0] || galeriaObjetivo;
        await organigramaService.replaceSubramaGalleryImage(
          tenantSlug,
          groupSlug,
          subrama.section_id,
          subrama.subgroup_id,
          cleanUuid,
          file
        );
      }

      toast.success("Foto actualizada correctamente");
      setFotoModalOpen(false);
      await fetchSubrama();
    } catch (error) {
      console.error(error);
      toast.error("Error al actualizar la foto");
    }
  };

  const handleDeleteFoto = async () => {
    if (!subrama || !fotoTipo) return;

    try {
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

      toast.success("Foto eliminada correctamente");
      setFotoModalOpen(false);
      await fetchSubrama();
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la foto");
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
          // PRIORIDAD 4: Cualquier URL en campo imagenPrincipal
          else if (subramaEncontrada.imagenPrincipal) {
            setImagenPrincipal(subramaEncontrada.imagenPrincipal);
            console.log("✅ [SubramaDetail] Usando campo imagenPrincipal como URL:", subramaEncontrada.imagenPrincipal);
          }
          else {
            console.log("ℹ️ [SubramaDetail] No hay imagen principal para subrama:", subramaEncontrada.nombre);
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
            <img
              src={imagenPrincipal}
              alt={subrama.nombre}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
              <div className="text-center">
                <Users className="w-16 h-16 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Imagen principal de la subrama
                </p>
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
      />
    </div>
  );
}




