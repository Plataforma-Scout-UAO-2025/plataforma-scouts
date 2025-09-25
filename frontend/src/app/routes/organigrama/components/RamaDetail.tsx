import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Rama } from "../types/rama.type";
import * as organigramaService from "../services/organigrama.service";

export default function RamaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rama, setRama] = useState<Rama | null>(null);
  const [loading, setLoading] = useState(true);

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
    return <p className="text-center mt-6">Cargando detalles...</p>;
  }

  if (!rama) {
    return (
      <div className="text-center mt-6">
        <p>No se encontró la rama con id: {id}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">
          Detalles de {rama.nombre} – {rama.año}
        </h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>

      {/* Información Principal */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
                Información Principal
            </h2>
            <Button size="sm" variant="outline">
                Añadir Foto
            </Button>
        </div>
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <img
            src="https://placehold.co/800x300"
            alt={rama.nombre}
            className="object-cover w-full h-full"
          />
        </div>
        <p className="text-sm text-gray-700">
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
      <Card className="p-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800">
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
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Galería de fotos – {rama.año}
          </h2>
          <Button size="sm" variant="outline">
            Añadir Foto
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["https://placehold.co/200", "https://placehold.co/201", "https://placehold.co/202"].map(
            (src, idx) => (
              <img
                key={idx}
                src={src}
                alt={`Foto ${idx}`}
                className="rounded-lg object-cover h-28 w-full"
              />
            )
          )}
        </div>
      </Card>
    </div>
  );
}

