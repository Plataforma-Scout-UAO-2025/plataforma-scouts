import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload } from "lucide-react";
import type { Rama } from "../types/rama.type";
import * as organigramaService from "../services/organigrama.service";

export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && rama) {
      // Crear URL temporal para mostrar la imagen
      const imageUrl = URL.createObjectURL(file);
      
      // Actualizar el estado local
      setRama({
        ...rama,
        icono: imageUrl
      });
      
      // Aquí podrías hacer la llamada al servicio para guardar la imagen
      console.log('Ícono seleccionado:', file);
      // TODO: Implementar la subida real del archivo al servidor
    }
  };

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagenPrincipal(imageUrl);
      console.log('Imagen principal seleccionada:', file);
      // TODO: Implementar la subida real del archivo al servidor
    }
  };

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setGaleriaFotos(prev => [...prev, ...newImages]);
      console.log('Fotos de galería seleccionadas:', files);
      // TODO: Implementar la subida real de los archivos al servidor
    }
  };

  useEffect(() => {
    const fetchRama = async () => {
      try {
        if (id) {
          const data = await organigramaService.getRamaById(id);
          setRama(data);
        }
      } catch (error) {
        console.error("Error cargando rama:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRama();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-6 text-muted-foreground">Cargando detalles...</p>;
  }

  if (!rama) {
    return (
      <div className="text-center mt-6 space-y-4">
        <p className="text-foreground">No se encontró la rama con id: {id}</p>
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

        {/* Subramas */}
        {rama.subramas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {rama.subramas.map((sub) => (
              <Badge key={sub.id} variant="secondary">
                {sub.nombre}
              </Badge>
            ))}
          </div>
        )}
      </Card>

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

