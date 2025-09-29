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
import { deleteImagen } from "../services/storage.service";
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

  // Helper to extract extension safely
  const getExtension = (name: string) => {
    const m = name.match(/\.([0-9a-z]+)(?:[?#]|$)/i);
    return m ? `.${m[1]}` : "";
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;

    // Preview
    const preview = URL.createObjectURL(file);
    setRama(prev => prev ? { ...prev, icono: preview } : prev);

    try {
      const fileId = await organigramaService.uploadSectionIcon(
        tenantSlug,
        groupSlug,
        rama.section_id.toString(),
        file
      );

      const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
      try {
        // Obtener datos actuales para recuperar nombres/galería si el backend los mantiene
        const backendResource = await apiClient.get<any>(updateEndpoint);

        const payload = {
          sectionName: backendResource?.sectionName ?? rama.sectionName ?? rama.nombre,
          sectionDescription: backendResource?.sectionDescription ?? rama.sectionDescription ?? rama.descripcion ?? '',
          sectionIconObjectId: fileId,
          sectionGalleryObjectIds: backendResource?.sectionGalleryObjectIds ?? rama.sectionGalleryObjectIds ?? []
        };

        console.log('🔍 [RamaDetail] PUT payload (icon) - cleaned:', JSON.stringify(payload, null, 2));
        await apiClient.put(updateEndpoint, payload);

        const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/organigrama/${fileId}${getExtension(file.name)}`;
        setRama(prev => prev ? { ...prev, icono: publicUrl } : prev);
        toast.success('Ícono actualizado correctamente');
      } catch (err) {
        console.error('❌ [RamaDetail] Error persistiendo ícono en backend:', err);
        // rollback: eliminar archivo subido en Supabase para evitar archivos huérfanos
        try { await deleteImagen(`organigrama/${fileId}${getExtension(file.name)}`); } catch (e) { console.warn('Rollback fallo', e); }
        toast.error('Error al guardar el ícono en el backend');
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo ícono:', err);
      toast.error('Error subiendo el ícono');
    }
  };

  const handleMainImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !rama) return;
    const preview = URL.createObjectURL(file);
    setImagenPrincipal(preview);

    try {
      const fileId = await organigramaService.uploadSectionIcon(
        tenantSlug,
        groupSlug,
        rama.section_id.toString(),
        file
      );

      const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
      try {
        const backend = await apiClient.get<any>(updateEndpoint);
        backend.sectionMainImageObjectId = fileId;
        delete backend.createdAt;
        delete backend.updatedAt;
        console.log('🔍 [RamaDetail] PUT payload (main):', JSON.stringify(backend, null, 2));
        await apiClient.put(updateEndpoint, backend);

        const publicUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media/organigrama/${fileId}${getExtension(file.name)}`;
        setImagenPrincipal(publicUrl);
        toast.success('Imagen principal actualizada correctamente');
      } catch (err) {
        console.error('❌ [RamaDetail] Error persistiendo imagen principal:', err);
        try { await deleteImagen(`organigrama/${fileId}${getExtension(file.name)}`); } catch (e) { console.warn('Rollback fallo', e); }
        toast.error('Error al guardar la imagen principal en el backend');
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo imagen principal:', err);
      toast.error('Error subiendo la imagen principal');
    }
  };

  const handleGalleryChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0 || !rama) return;

    const previews = files.map(f => URL.createObjectURL(f));
    setGaleriaFotos(prev => [...prev, ...previews]);

    try {
      const imageIds = await organigramaService.uploadGalleryImages(tenantSlug, groupSlug, rama.section_id.toString(), files);
      const updateEndpoint = buildApiPath(tenantSlug, groupSlug, 'sections', rama.section_id.toString());
      try {
        const backend = await apiClient.get<any>(updateEndpoint);
        backend.sectionGalleryObjectIds = imageIds;
        delete backend.createdAt;
        delete backend.updatedAt;
        console.log('🔍 [RamaDetail] PUT payload (gallery):', JSON.stringify(backend, null, 2));
        await apiClient.put(updateEndpoint, backend);
        toast.success('Galería actualizada correctamente');
      } catch (err) {
        console.error('❌ [RamaDetail] Error persistiendo galería:', err);
        toast.error('Error al guardar la galería en el backend');
      }
    } catch (err) {
      console.error('❌ [RamaDetail] Error subiendo galería:', err);
      setGaleriaFotos(prev => prev.slice(0, -previews.length));
    }
  };

  useEffect(() => {
    const fetchRama = async () => {
      try {
        if (!id) return;
        const data = await organigramaService.getRamaById(tenantSlug, groupSlug, id);
        if (data) setRama(data);
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
              {rama.icono ? (
                <img src={rama.icono} alt={`Ícono de ${rama.nombre}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><span className="text-muted-foreground font-medium text-2xl">{rama.nombre.charAt(0)}</span></div>
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
          <h2 className="text-lg font-semibold text-foreground">Información Principal</h2>
          <Button size="sm" variant="outline" onClick={handleMainImageClick} className="border border-primary text-primary hover:bg-accent flex items-center gap-2">Añadir Foto <Upload className="w-4 h-4"/></Button>
        </div>
        <div className="relative w-full h-[450px] rounded-lg overflow-hidden bg-gray-100">
          <img src={imagenPrincipal} alt={rama.nombre} className="object-contain w-full h-full" />
        </div>
        <input ref={mainImageInputRef} type="file" accept="image/*" onChange={handleMainImageChange} className="hidden" aria-label="Subir imagen principal" />
        <p className="text-sm text-muted-foreground">{rama.descripcion || "Sin descripción"}</p>
      </Card>

      {rama.subramas && rama.subramas.length > 0 && (
        <Card className="p-6 space-y-4 bg-card text-card-foreground border border-border">
          <h2 className="text-lg font-semibold text-foreground">Subramas de {rama.nombre}</h2>
          <div className="grid gap-3">
            {rama.subramas.map((subrama) => (
              <div key={subrama.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors">
                <div className="flex items-center space-x-3"><Users className="h-5 w-5 text-primary"/>
                  <div>
                    <div className="flex items-center space-x-2"><span className="font-medium text-foreground">{subrama.nombre}</span>
                      <Badge variant={subrama.estado === 'activa' ? 'default' : 'secondary'} className="text-xs">{subrama.estado}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{subrama.descripcion || 'Sin descripción'}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => navigate(`/app/organigrama/subrama/${subrama.subgroup_id || subrama.id}`)} className="bg-primary hover:bg-primary-hover text-white border-primary">Ver Detalles</Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <h2 className="text-lg font-semibold text-foreground">Integrantes en {rama.año}</h2>
        <div className="flex flex-wrap gap-2">{["Roberto Restrepo","Carlos Camargo","Ana Aguillón","Mario Mora"].map((name, idx)=>(<Badge key={idx} variant="outline">{name}</Badge>))}</div>
      </Card>

      <Card className="p-4 space-y-3 bg-card text-card-foreground border border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Galería de fotos – {rama.año}</h2>
          <Button size="sm" variant="outline" onClick={handleGalleryClick} className="border border-primary text-primary hover:bg-accent flex items-center gap-2">Añadir Fotos <Upload className="w-4 h-4"/></Button>
        </div>
        <div className="grid grid-cols-3 gap-2">{galeriaFotos.map((src, idx)=>(<div key={idx} className="relative"><img src={src} alt={`Foto ${idx+1}`} className="rounded-lg object-cover w-full h-[300px]"/></div>))}</div>
        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleGalleryChange} className="hidden" aria-label="Subir fotos a la galería" />
      </Card>
    </div>
  );
}

