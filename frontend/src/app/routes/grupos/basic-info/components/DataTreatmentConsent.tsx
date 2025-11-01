import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Info, ChevronDown } from "lucide-react";
import { useState } from "react";

interface DataTreatmentConsentProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function DataTreatmentConsent({
  value,
  onChange,
  error,
}: DataTreatmentConsentProps) {
  const [isOpen, setIsOpen] = useState(false);

  const stringValue = value === true ? "accepted" : value === false ? "rejected" : "";

  const handleSelectChange = (val: string) => {
    onChange(val === "accepted");
  };

  return (
    <div className="col-span-full space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-start gap-2">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-primary mb-2">
            Tratamiento de Datos Personales
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para continuar con tu inscripción, necesitamos tu autorización para
            el tratamiento de tus datos personales de acuerdo con nuestra
            política de privacidad.
          </p>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {isOpen ? "Ocultar" : "Leer"} política de tratamiento de datos
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isOpen && (
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="p-4 bg-background rounded-md border max-h-64 overflow-y-auto">
                  <h4 className="font-semibold text-foreground mb-2">
                    Política de Tratamiento de Datos Personales
                  </h4>

                  <p className="mb-3">
                    De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013,
                    la organización Scout tratará tus datos personales con las
                    siguientes finalidades:
                  </p>

                  <ul className="list-disc pl-5 space-y-2 mb-3">
                    <li>Gestión de inscripciones y membresías</li>
                    <li>Comunicación de actividades y eventos</li>
                    <li>Contacto en casos de emergencia</li>
                    <li>Envío de información institucional</li>
                    <li>Cumplimiento de obligaciones legales</li>
                  </ul>

                  <p className="mb-3">
                    <strong>Tus derechos:</strong> Conocer, actualizar,
                    rectificar y suprimir tus datos personales, así como revocar
                    la autorización otorgada para su tratamiento.
                  </p>

                  <p className="mb-3">
                    <strong>Responsable del tratamiento:</strong> La organización
                    garantiza la seguridad y confidencialidad de tu información.
                  </p>

                  <p>
                    Para más información o ejercer tus derechos, contacta a:{" "}
                    <a
                      href="mailto:ascoutsregionpacifico@gmail.com"
                      className="text-primary hover:underline"
                    >
                      ascoutsregionpacifico@gmail.com
                    </a>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data-consent" className="text-base font-semibold">
          ¿Autorizas el tratamiento de tus datos personales? *
        </Label>
        <Select value={stringValue} onValueChange={handleSelectChange}>
          <SelectTrigger
            id="data-consent"
            className={error ? "border-red-500 focus:border-red-500" : ""}
          >
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">
              Sí, autorizo el tratamiento de mis datos
            </SelectItem>
            <SelectItem value="rejected">
              No autorizo el tratamiento de mis datos
            </SelectItem>
          </SelectContent>
        </Select>
        {error && (
          <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        {value === false && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Sin tu autorización no podremos procesar tu inscripción. Si tienes
              dudas, por favor contáctanos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}