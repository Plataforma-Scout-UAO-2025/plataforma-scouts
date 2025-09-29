import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Subrama } from "../types/rama.type";
import * as organigramaService from "../services/organigrama.service";
import { useTenantParams } from "../hooks/useTenantParams";

export default function SubramaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantSlug, groupSlug } = useTenantParams();
  const [subrama, setSubrama] = useState<Subrama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);

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
        
        // Mostrar imagen temporalmente
        const imageUrl = URL.createObjectURL(file);
        setImagenPrincipal(imageUrl);
        
        console.log('✅ [SubramaDetail] Imagen principal actualizada localmente');
      } catch (error) {
        console.error('❌ [SubramaDetail] Error subiendo imagen principal:', error);
        setImagenPrincipal('');
      }
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && subrama) {
      try {
        console.log('🔄 [SubramaDetail] Subiendo fotos a la galería:', files.length);
        
        // Mostrar imágenes temporalmente
        const newImages = files.map(file => URL.createObjectURL(file));
        setGaleriaFotos(prev => [...prev, ...newImages]);
        
        console.log('✅ [SubramaDetail] Fotos de galería actualizadas localmente');
      } catch (error) {
        console.error('❌ [SubramaDetail] Error subiendo fotos de galería:', error);
        setGaleriaFotos(prev => prev.slice(0, -files.length));
      }
    }
  };

  useEffect(() => {
    const fetchSubrama = async () => {
      try {
        if (id) {
          console.log("🔄 [SubramaDetail] Obteniendo subrama con ID:", id, { tenantSlug, groupSlug });
          
          
          const ramas = await organigramaService.getRamas(tenantSlug, groupSlug);
          
          let subramaEncontrada: Subrama | null = null;
          
          for (const rama of ramas) {
            const subramaInRama = rama.subramas.find(s => s.id === id);
            if (subramaInRama) {
              subramaEncontrada = subramaInRama;
              break;
            }
          }
          
          if (subramaEncontrada) {
            setSubrama(subramaEncontrada);
            console.log("✅ [SubramaDetail] Subrama cargada:", subramaEncontrada);
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

        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gray-100">
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
            <div key={idx} className="relative">
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
    </div>
  );
}




