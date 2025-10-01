import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload } from "lucide-react";
import type { Rama } from "../types/rama.type";
import * as organigramaService from "../services/organigrama.service";
import { StorageService } from "../services/storage.service";
import { toast } from "sonner";
import { useTenantParams } from "../hooks/useTenantParams";

export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tenantSlug, groupSlug } = useTenantParams();
  const [rama, setRama] = useState<Rama | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>("https://placehold.co/800x300");
  const [galeriaFotos, setGaleriaFotos] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => fileInputRef.current?.click();
  const handleMainImageClick = () => mainImageInputRef.current?.click();
  const handleGalleryClick = () => galleryInputRef.current?.click();

  // Función para obtener la URL correcta del icono
  const getIconUrl = (rama: Rama): string => {
    // Si hay iconoObjectId, usar el StorageService
    if (rama.iconoObjectId) {
      const imageUrl = StorageService.getImageUrl(rama.iconoObjectId);
      if (imageUrl) return imageUrl;
    }
    
    // Si el icono es una URL de datos (data:image/...), usarla directamente
    if (rama.icono && rama.icono.startsWith('data:')) {
      return rama.icono;
    }
    
    // Si hay una URL normal en icono, usarla
    if (rama.icono) {
      return rama.icono;
    }
    
    // Fallback
    return '';
  };

  // Función para obtener la URL correcta de la imagen principal
  const getMainImageUrl = (rama: Rama): string => {
    // Si hay imagenPrincipalObjectId, usar el StorageService
    if (rama.imagenPrincipalObjectId) {
      const imageUrl = StorageService.getImageUrl(rama.imagenPrincipalObjectId);
      if (imageUrl) return imageUrl;
    }
    
    // Si la imagenPrincipal es una URL de datos (data:image/...), usarla directamente
    if (rama.imagenPrincipal && rama.imagenPrincipal.startsWith('data:')) {
      return rama.imagenPrincipal;
    }
    
    // Si hay una URL normal en imagenPrincipal, usarla
    if (rama.imagenPrincipal) {
      return rama.imagenPrincipal;
    }
    
    // Fallback a una imagen placeholder
    return 'https://placehold.co/800x300/e2e8f0/94a3b8?text=Sin+imagen';
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;

    try {
      console.log('🔄 [RamaDetail] Subiendo icono de rama:', file.name);
      
      // Subir archivo usando el nuevo sistema
      await organigramaService.uploadSectionIcon(
        tenantSlug,
        groupSlug,
        rama.section_id,
        file
      );

      // Recargar la rama para obtener la imagen actualizada
      const updatedRama = await organigramaService.getRamaById(tenantSlug, groupSlug, rama.id);
      if (updatedRama) {
        setRama(updatedRama);
        console.log('✅ [RamaDetail] Icono actualizado correctamente');
        toast.success('Ícono actualizado correctamente');
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo ícono:', err);
      toast.error('Error subiendo el ícono');
    }
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;

    try {
      console.log('🔄 [RamaDetail] Subiendo imagen principal:', file.name);
      
      // Subir archivo usando el nuevo sistema
      await organigramaService.uploadSectionMainImage(
        tenantSlug,
        groupSlug,
        rama.section_id,
        file
      );

      // Recargar la rama para obtener la imagen actualizada
      const updatedRama = await organigramaService.getRamaById(tenantSlug, groupSlug, rama.id);
      if (updatedRama) {
        setRama(updatedRama);
        // Actualizar también el estado local de imagen principal
        const mainImageUrl = getMainImageUrl(updatedRama);
        setImagenPrincipal(mainImageUrl);
        
        console.log('✅ [RamaDetail] Imagen principal actualizada correctamente');
        toast.success('Imagen principal actualizada correctamente');
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo imagen principal:', err);
      toast.error('Error subiendo la imagen principal');
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !rama) return;

    try {
      console.log('🔄 [RamaDetail] Subiendo galería:', files.length, 'archivos');
      
      // Subir las imágenes usando el nuevo sistema
      const uploadedUrls = await organigramaService.uploadGalleryImages(
        tenantSlug, 
        groupSlug, 
        rama.section_id, 
        files
      );

      // Añadir las nuevas URLs a la galería existente
      setGaleriaFotos(prev => [...prev, ...uploadedUrls]);
      
      console.log('✅ [RamaDetail] Galería actualizada correctamente');
      toast.success('Galería actualizada correctamente');
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo galería:', err);
      toast.error('Error subiendo la galería');
    }
  };

  useEffect(() => {
    const fetchRama = async () => {
      try {
        if (!id) return;
        const data = await organigramaService.getRamaById(tenantSlug, groupSlug, id);
        if (data) {
          setRama(data);
          
          // Cargar imagen principal existente
          const mainImageUrl = getMainImageUrl(data);
          setImagenPrincipal(mainImageUrl);
          
          // Cargar imágenes de galería existentes
          const galleryUrls = StorageService.getRamaGalleryUrls(data.id);
          setGaleriaFotos(galleryUrls);
          
          console.log(`📸 [RamaDetail] Cargada imagen principal y ${galleryUrls.length} imágenes de galería para rama ${data.nombre}`);
        }
      } catch (err) {
        console.error('❌ [RamaDetail] Error cargando rama:', err);
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
      <div className="space-y-3">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary">Detalles de {rama.nombre} – {rama.año}</h1>
          <div className="relative">
            <div className="w-[200px] h-[124px] rounded-lg bg-muted border border-border flex items-center justify-center overflow-hidden cursor-pointer hover:bg-accent transition-colors" onClick={handleIconClick}>
              {rama && getIconUrl(rama) ? (
                <img 
                  src={getIconUrl(rama)} 
                  alt={`Ícono de ${rama.nombre}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('❌ Error cargando icono de rama:', getIconUrl(rama));
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('✅ Icono de rama cargado correctamente:', rama.nombre);
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground font-medium text-2xl">{rama.nombre.charAt(0)}</span>
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
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gray-100">
          <img src={imagenPrincipal} alt={rama.nombre} className="object-contain w-full h-full" />
        </div>
        <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" aria-label="Subir imagen principal" />
        <p className="text-sm text-muted-foreground">{rama.descripcion || "Sin descripción"}</p>

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
                    {subrama.nombre}
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
  <h2 className="text-lg font-semibold text-primary">Integrantes en {rama.año}</h2>
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
          <h2 className="text-lg font-semibold text-primary">Galería de fotos – {rama.año}</h2>
          <Button size="sm" variant="outline" onClick={handleGalleryClick} className="border border-primary text-primary hover:bg-accent flex items-center gap-2">Añadir Fotos <Upload className="w-4 h-4"/></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">{galeriaFotos.map((src, idx)=>(<div key={idx} className="relative"><img src={src} alt={`Foto ${idx+1}`} className="rounded-lg object-cover w-full h-[300px]"/></div>))}</div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" aria-label="Subir fotos a la galería" />
      </Card>
    </div>
  );
}

