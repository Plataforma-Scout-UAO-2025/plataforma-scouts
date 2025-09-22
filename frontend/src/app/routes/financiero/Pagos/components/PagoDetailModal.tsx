import { useState } from "react";
import { Button } from "@/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import type { Pago } from "../types/pago.type";
import { mockScouts, mockCuotas } from "../constants/mockData";

interface PagoDetailModalProps {
  pago: Pago;
}

export default function PagoDetailModal({ pago }: PagoDetailModalProps) {
  const [open, setOpen] = useState(false);

  // Obtener información detallada del scout e información adicional mockeada
  const scout = mockScouts.find(s => s.id === pago.scoutId) || {
    id: pago.scoutId,
    nombre: "Scout no encontrado",
    rama: "N/A",
    edad: 0
  };

  const cuota = mockCuotas.find(c => c.id === pago.cuotaId) || {
    id: pago.cuotaId,
    nombre: "Cuota no encontrada",
    monto: "0",
    periodicidad: "N/A"
  };

  // Datos adicionales mockeados para el detalle
  const scoutDetailMock = {
    nombreCompleto: `${scout.nombre} Jiménez`, // Agregar apellido mock
    akela: "María López", // Líder de la rama mockeado
    foto: "/api/placeholder/150/150" // Placeholder para foto
  };

  const formatMonto = (monto: string) => {
    const numero = parseFloat(monto);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
    }).format(numero);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-CO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-primary text-3xl tracking-tight font-bold mt-4">
            Detalle del pago
          </DialogTitle>
          <DialogDescription>
            Información completa del pago realizado por el integrante.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-8 py-6">
          {/* Sección Integrante */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Integrante</h3>
            <div className="border rounded-lg p-6 bg-transparent border-secondary">
              <div className="flex items-start gap-6">
                {/* Foto del scout */}
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {scout.nombre.charAt(0)}
                </div>
                
                {/* Información del scout */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 flex-1">
                  <div>
                    <span className="text-secondary font-medium">Nombre completo:</span>
                    <span className="ml-2 text-gray-900">{scoutDetailMock.nombreCompleto}</span>
                  </div>
                  <div>
                    <span className="text-secondary font-medium">Rama actual:</span>
                    <span className="ml-2 text-gray-900">{scout.rama}</span>
                  </div>
                  <div>
                    <span className="text-secondary font-medium">Edad:</span>
                    <span className="ml-2 text-gray-900">{scout.edad} años</span>
                  </div>
                  <div>
                    <span className="text-secondary font-medium">Akela:</span>
                    <span className="ml-2 text-gray-900">{scoutDetailMock.akela}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección Detalle del Pago */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-4">Detalle</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <span className="text-primary font-medium">Concepto:</span>
                <div className="mt-1 text-gray-900">{pago.concepto}</div>
              </div>
              <div>
                <span className="text-primary font-medium">Fecha de pago:</span>
                <div className="mt-1 text-gray-900">{formatFecha(pago.fechaPago)}</div>
              </div>
              <div>
                <span className="text-primary font-medium">Monto:</span>
                <div className="mt-1 text-gray-900 text-xl font-semibold">{formatMonto(pago.monto)}</div>
              </div>
              <div>
                <span className="text-primary font-medium">Medio de pago:</span>
                <div className="mt-1 text-gray-900">{pago.medioPago}</div>
              </div>
              <div>
                <span className="text-primary font-medium">Estado:</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      pago.estado === "Pagado"
                        ? "bg-green-100 text-green-800"
                        : pago.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {pago.estado}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-primary font-medium">Cuota asociada:</span>
                <div className="mt-1 text-gray-900">{cuota.nombre}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
