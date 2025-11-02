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

interface ScoutDataTreatmentConsentProps {
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function ScoutDataTreatmentConsent({
  value,
  onChange,
  error,
}: ScoutDataTreatmentConsentProps) {
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
            Autorizaciones y Tratamiento de Datos Personales
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Para continuar con tu inscripción, necesitamos tu autorización para la pertenencia al movimiento scout,
            tratamiento de datos personales, exoneración de responsabilidades y uso de imágenes de acuerdo con la
            normativa vigente.
          </p>

          <div className="mb-4">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {isOpen ? "Ocultar" : "Leer"} autorizaciones y política completa
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {isOpen && (
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div className="p-4 bg-background rounded-md border max-h-96 overflow-y-auto space-y-4">

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      AUTORIZACIÓN DE PERTENENCIA Y PARTICIPACIÓN
                    </h4>
                    <p>
                      Autorizo mi pertenencia al grupo Scout de la ASRP (Asociación Scout Región Pacífico)
                      y mi participación en todas las actividades Scouts que sean programadas por el Grupo,
                      Región, a nivel local, departamental o nacional.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      EXONERACIÓN DE RESPONSABILIDADES
                    </h4>
                    <p>
                      Exonero de responsabilidades en caso de accidente o desgracia humana a los miembros
                      del Grupo Scout perteneciente a la ASRP (Asociación Scout's Región Pacífico).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      AUTORIZACIÓN DE HOSPITALIZACIÓN Y CIRUGÍA
                    </h4>
                    <p>
                      Autorizo a los miembros del Recurso Adulto a proceder como Representantes Legales
                      Inmediatos para: hospitalizar y autorizar cirugía en caso de presentarse un accidente
                      o calamidad que requiera de dichos procedimientos.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      TRATAMIENTO DE DATOS PERSONALES
                    </h4>
                    <p className="mb-3">
                      De acuerdo con la Ley 1581 de 2012 y su decreto reglamentario 1377 de 2013,
                      autorizo de manera expresa al grupo scout y la ASRP en el tratamiento
                      (recolección, verificación, almacenamiento, uso y supresión) de mis datos personales
                      dispensables, opcionales y sensibles.
                    </p>
                    <p className="mb-2">
                      <strong>Finalidades del tratamiento:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mb-3">
                      <li>Gestión de inscripciones y membresías</li>
                      <li>Comunicación de actividades y eventos</li>
                      <li>Contacto en casos de emergencia</li>
                      <li>Envío de información institucional</li>
                      <li>Cumplimiento de obligaciones legales</li>
                    </ul>
                    <p className="mb-2">
                      <strong>Mis derechos:</strong> Conocer, actualizar, rectificar y suprimir mis datos
                      personales, así como revocar la autorización otorgada para su tratamiento.
                    </p>
                  </div>

                  {/* Autorización de Uso de Imágenes */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      AUTORIZACIÓN DE USO DE FOTOGRAFÍAS, IMÁGENES Y/O VIDEOS PARA PUBLICIDAD SCOUT
                    </h4>
                    <p className="mb-3">
                      Autorizo de manera expresa e inequívoca al grupo scout para usar, publicar, exponer,
                      producir, reproducir, duplicar y/o distribuir reproducciones fotográficas, grabaciones
                      en video o en audio en las que participe, para actividades de promoción, publicidad e
                      innovación de marca Scout tanto en el grupo como en la ASRP y otros afines.
                    </p>
                    <p className="mb-3">
                      Esta autorización se entiende concedida para la utilización de mi imagen tanto en medios
                      impresos (revistas, folletos, volantes, plegables, libros, etc.), como a través de internet
                      en: Facebook, Instagram, de los grupos como de la ASRP y otras formas digitales, tanto en
                      Colombia como en cualquier otro lugar del mundo, siempre y cuando dicha utilización esté
                      directa o indirectamente relacionada con algunas de las actividades en desarrollo del objeto
                      social del movimiento scout en la ASRP.
                    </p>
                    <p>
                      De manera expresa manifiesto que no recibiré ningún pago monetario o ningún otro trato
                      especial, a cambio del derecho que otorgo a utilizar dichas fotografías.
                    </p>
                  </div>

                  {/* Información de Contacto */}
                  <div className="pt-3 border-t">
                    <p className="font-semibold text-foreground">
                      Para más información o ejercer tus derechos, contacta a:
                    </p>
                    <a
                      href="mailto:ascoutsregionpacifico@gmail.com"
                      className="text-primary hover:underline"
                    >
                      ascoutsregionpacifico@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="data-consent" className="text-base font-semibold">
          ¿Autorizas todo lo anterior? *
        </Label>
        <p className="text-xs text-muted-foreground mb-2">
          Al seleccionar "Sí, autorizo", aceptas: la pertenencia al movimiento scout, el tratamiento
          de datos personales, la exoneración de responsabilidades, la autorización de hospitalización
          y cirugía en caso de emergencia, y el uso de imágenes para publicidad scout.
        </p>
        <Select value={stringValue} onValueChange={handleSelectChange}>
          <SelectTrigger
            id="data-consent"
            className={error ? "border-red-500 focus:border-red-500" : ""}
          >
            <SelectValue placeholder="Selecciona una opción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="accepted">
              Sí, autorizo todo lo anterior
            </SelectItem>
            <SelectItem value="rejected">
              No autorizo
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
              Sin tu autorización no podremos procesar tu inscripción al movimiento scout.
              Si tienes dudas, por favor contáctanos a ascoutsregionpacifico@gmail.com
            </p>
          </div>
        )}
      </div>
    </div>
  );
}