import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Users } from "lucide-react";
import type { Rama } from "../types/rama.type";
import * as organigramaService from "../services/organigrama.service";
import { apiClient } from "../services/apiClient";
import { buildApiPath } from "../hooks/useTenantParams";
import { toast } from "sonner";
import { useTenantParams } from "../hooks/useTenantParams";

export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantSlug, groupSlug } = useTenantParams();
  const [rama, setRama] = useState<Rama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>("https://placehold.co/800x300");
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([
    "https://placehold.co/200", 
    "https://placehold.co/201", 
    "https://placehold.co/202"
  ]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleMainImageClick = () => {
    mainImageInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    galleryInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && rama) {
      try {
        console.log('🔄 [RamaDetail] Subiendo ícono de rama:', file.name);
        
        // Mostrar imagen temporalmente
        const imageUrl = URL.createObjectURL(file);
        setRama({
          ...rama,
          icono: imageUrl
        });
        
        // Subir a Supabase Storage (devuelve publicUrl)
        const publicUrl = await organigramaService.uploadSectionIcon(
          tenantSlug,
          groupSlug,
          rama.section_id.toString(),
          file
        );

        // Persistir la URL en el backend principal
        try {
          const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
          // Intentar primero persistir la URL directamente (campo sectionIconUrl)
          try {
            await apiClient.patch(updateEndpoint, { sectionIconUrl: publicUrl });
            setRama(prev => prev ? { ...prev, icono: publicUrl } : prev);
            toast.success('Ícono actualizado correctamente');
            console.log('✅ [RamaDetail] Ícono subido y persistido en backend (sectionIconUrl)');
          } catch (innerErr: any) {
            console.warn('⚠️ [RamaDetail] Falló persistir sectionIconUrl, intentando fallback a sectionIconObjectId', innerErr);
            // Extraer ruta relativa del objeto desde la publicUrl para compatibilidad con backend
            const marker = '/object/public/media/';
            const idx = publicUrl.indexOf(marker);
            if (idx !== -1) {
              const objectId = publicUrl.substring(idx + marker.length);
              await apiClient.patch(updateEndpoint, { sectionIconObjectId: objectId });
              setRama(prev => prev ? { ...prev, icono: publicUrl } : prev);
              toast.success('Ícono actualizado correctamente');
              console.log('✅ [RamaDetail] Ícono subido y persistido en backend (sectionIconObjectId)', { objectId });
            } else {
              throw innerErr; // no pudimos formar objectId, propagar
            }
          }
        } catch (err) {
          console.error('❌ [RamaDetail] Error persistiendo ícono en backend:', err);
          toast.error('Error al guardar el ícono en el backend');
        }
      } catch (error) {
        console.error('❌ [RamaDetail] Error subiendo ícono:', error);
        // Revertir cambio visual en caso de error
        if (rama.icono !== URL.createObjectURL(file)) {
          setRama({
            ...rama,
            icono: rama.icono // Restaurar ícono anterior
          });
        }
      }
    }
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && rama) {
      try {
        console.log('🔄 [RamaDetail] Subiendo imagen principal:', file.name);
        
        // Mostrar imagen temporalmente
        const imageUrl = URL.createObjectURL(file);
        setImagenPrincipal(imageUrl);
        
        // Subir a Supabase Storage (devuelve publicUrl)
        const publicUrlMain = await organigramaService.uploadSectionIcon(
          tenantSlug,
          groupSlug,
          rama.section_id.toString(),
          file
        );

        try {
          const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
          // Intentar campo directo
          try {
            await apiClient.patch(updateEndpoint, { sectionMainImageUrl: publicUrlMain });
            setImagenPrincipal(publicUrlMain);
            toast.success('Imagen principal actualizada correctamente');
            console.log('✅ [RamaDetail] Imagen principal subida y persistida en backend (sectionMainImageUrl)');
          } catch (innerErr: any) {
            console.warn('⚠️ [RamaDetail] Falló persistir sectionMainImageUrl, intentando fallback a sectionIconObjectId', innerErr);
            const marker = '/object/public/media/';
            const idx = publicUrlMain.indexOf(marker);
            if (idx !== -1) {
              const objectId = publicUrlMain.substring(idx + marker.length);
              await apiClient.patch(updateEndpoint, { sectionMainImageObjectId: objectId });
              setImagenPrincipal(publicUrlMain);
              toast.success('Imagen principal actualizada correctamente');
              console.log('✅ [RamaDetail] Imagen principal subida y persistida en backend (sectionMainImageObjectId)', { objectId });
            } else {
              throw innerErr;
            }
          }
        } catch (err) {
          console.error('❌ [RamaDetail] Error persistiendo imagen principal en backend:', err);
          toast.error('Error al guardar la imagen principal en el backend');
        }
      } catch (error) {
        console.error('❌ [RamaDetail] Error subiendo imagen principal:', error);
        // Revertir cambio visual en caso de error
        setImagenPrincipal('');
      }
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0 && rama) {
      try {
        console.log('🔄 [RamaDetail] Subiendo fotos a la galería:', files.length);
        
        // Mostrar imágenes temporalmente
        const newImages = files.map(file => URL.createObjectURL(file));
        setGaleriaFotos(prev => [...prev, ...newImages]);
        
        // Subir al servidor (aún usa uploadGalleryImages que espera postFormData)
        const imageIds = await organigramaService.uploadGalleryImages(
          tenantSlug,
          groupSlug,
          rama.section_id.toString(),
          files
        );

        try {
          // Actualizar la sección en backend con los ids devueltos
          const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
          await apiClient.patch(updateEndpoint, {
            sectionGalleryObjectIds: imageIds
          });

          toast.success('Galería actualizada correctamente');
          console.log('✅ [RamaDetail] Fotos de galería subidas y persistidas en backend');
        } catch (err) {
          console.error('❌ [RamaDetail] Error persistiendo galería en backend:', err);
          toast.error('Error al guardar la galería en el backend');
        }
      } catch (error) {
        console.error('❌ [RamaDetail] Error subiendo fotos de galería:', error);
        // Revertir cambio visual en caso de error
        setGaleriaFotos(prev => prev.slice(0, -files.length));
      }
    }
  };

  useEffect(() => {
    const fetchRama = async () => {
      try {
        if (id) {
          console.log("🔄 [RamaDetail] Obteniendo rama con ID:", id, { tenantSlug, groupSlug });
          const data = await organigramaService.getRamaById(tenantSlug, groupSlug, id);
          if (data) {
            setRama(data);
            console.log("✅ [RamaDetail] Rama cargada:", data);
          } else {
            console.warn("⚠️ [RamaDetail] No se encontró la rama con ID:", id);
          }
        } else {
          console.error("❌ [RamaDetail] ID de rama no proporcionado");
        }
      } catch (error) {
        console.error("❌ [RamaDetail] Error cargando rama:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRama();
  }, [id, tenantSlug, groupSlug]);

  if (loading) {
    return <p className="text-center mt-6 text-muted-foreground">Cargando detalles...</p>;
  }

  if (!rama) {
    return (
      <div className="text-center mt-6 space-y-4">
        <p className="text-foreground">No se encontró la rama con id: {id}</p>
        <p className="text-sm text-muted-foreground">
          Tenant: {tenantSlug} | Group: {groupSlug}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="border border-secondary text-secondary hover:bg-accent"
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
              Detalles de {rama.nombre} – {rama.año}
            </h1>
            {/* Ícono de la rama */}
            <div className="relative">
              <div 
                className="w-[200px] h-[124px] rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-accent transition-colors"
                onClick={handleIconClick}
              >
                {rama.icono ? (
                  <img 
                    src={rama.icono} 
                    alt={`Ícono de ${rama.nombre}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-muted-foreground font-medium text-2xl">
                      {rama.nombre.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              {/* Botón de cámara overlay */}
              <div 
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-colors"
                onClick={handleIconClick}
              >
                <Camera className="w-4 h-4 text-primary-foreground" />
              </div>
              {/* Input de archivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Subir ícono de rama"
              />
            </div>
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
          <h2 className="text-lg font-semibold text-foreground">Información Principal</h2>
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
          <img
            src={imagenPrincipal}
            alt={rama.nombre}
            className="object-contain w-full h-full"
          />
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
          {rama.descripcion || "Sin descripción"}
        </p>
      </Card>

      {/* Subramas */}
      {rama.subramas && rama.subramas.length > 0 && (
        <Card className="p-6 space-y-4 bg-card text-card-foreground border border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Subramas de {rama.nombre}
          </h2>
          <div className="grid gap-3">
            {rama.subramas.map((subrama) => (
              <div
                key={subrama.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">
                        {subrama.nombre}
                      </span>
                      <Badge 
                        variant={subrama.estado === 'activa' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {subrama.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subrama.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('🔍 [RamaDetail] Navigating to subrama with ID:', subrama.subgroup_id || subrama.id);
                    navigate(`/app/organigrama/subrama/${subrama.subgroup_id || subrama.id}`)
                  }}
                  className="bg-primary hover:bg-primary-hover text-white border-primary"
                >
                  Ver Detalles
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Integrantes */}
      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Integrantes en {rama.año}
        </h2>
        <div className="flex flex-wrap gap-2">
          {/* ⚠️ Mock temporal */}
          {["Roberto Restrepo", "Carlos Camargo", "Ana Aguillón", "Mario Mora"].map(
            (name, idx) => (
              <Badge key={idx} variant="outline">
                {name}
              </Badge>
            )
          )}
        </div>
      </Card>

      {/* Galería */}
      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Galería de fotos – {rama.año}
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

