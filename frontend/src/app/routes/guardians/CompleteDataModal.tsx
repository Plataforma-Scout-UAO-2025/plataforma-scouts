import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompleteDataForm } from "@/app/routes/guardians/components/CompleteDataForm";
import type { CompleteDataFormData } from "@/app/routes/guardians/schemas/CompleteData.schema";
import type { GuardianCompleteData } from "@/types/guardian.type";
import { createGuardian } from "@/api/guardiansApi.ts";
import { toast } from "sonner";
import { isAxiosError } from "axios";

interface CompleteDataModalProps {
  onComplete?: () => void;
}

export const CompleteDataModal = ({ onComplete }: CompleteDataModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const { user } = useAuth0();

  const handleSubmit = async (data: CompleteDataFormData) => {
    console.log("handleSubmit llamado en CompleteDataModal con:", data);
    setIsSubmitting(true);
    
    try {
      const userId = user?.sub?.replace('auth0|', '') || user?.sub;
      const tenantId = user?.org_id;      
      
      if (!userId) {
        throw new Error("No se pudo obtener el ID del usuario");
      }

      if (!tenantId) {
        throw new Error("No se pudo obtener el ID de la organización");
      }

      console.log("Datos del usuario desde Auth0:","userID:", userId, "tenantID:", tenantId, "Status:", status);
      console.log('Creando guardián con user_id:', userId);
      console.log('Tenant ID:', tenantId);
      console.log('Datos del formulario:', data);


      const payload: GuardianCompleteData = {
        user_id: userId,
        tenant_id: tenantId,
        role: 'ACUDIENTE',
        first_name: data.firstName,
        last_name: data.lastName,
        gender: data.gender,
        birth_date: data.birthDate,
        address: data.address,
        identification: data.identification,
        document_type: data.documentType,
        phone: data.phone,
        is_active: true,
        status: 'PENDING',
        accept_treatment: true
      };

      console.log('Payload a enviar (snake_case):', payload);

      const response = await createGuardian(payload);

      console.log("Respuesta del servidor:", response);
      
      toast.success("Perfil creado exitosamente.");
      setIsOpen(false);
      
      if (onComplete) {
        console.log("Llamando a onComplete...");
        onComplete();
      }
    } catch (error) {
      console.error("Error al crear el perfil:", error);
      
      // Verificar si es un error de Axios
      if (isAxiosError(error)) {
        console.error("Detalle del error del servidor:", error.response?.data);
        
        // Manejar error 409 Conflict - Usuario ya existe
        if (error.response?.status === 409) {
          console.log("Usuario ya existe, cerrando modal y continuando...");
          toast.info("Tu perfil ya está registrado. Redirigiendo...");
          setIsOpen(false);
          
          if (onComplete) {
            onComplete();
          }
          return;
        }
        
        // Mostrar mensaje claro sobre el problema del backend
        if (error.response?.status === 500) {
          toast.error("Error interno del servidor. Por favor contacta al equipo de backend.");
        } else if (error.response?.data?.details) {
          const details = error.response.data.details as Record<string, string>;
          const errorMessages = Object.entries(details)
            .map(([field, message]) => `${field}: ${message}`)
            .join('\n');
          toast.error(`Errores de validación:\n${errorMessages}`);
        } else if (error.response?.data?.message) {
          toast.error(`Error: ${error.response.data.message}`);
        } else {
          toast.error("Error al guardar los datos. Por favor intenta de nuevo.");
        }
      } else {
        // Error que no es de Axios (errores de red, etc.)
        toast.error("Error al guardar los datos. Por favor intenta de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Completa tu perfil</DialogTitle>
          <DialogDescription>
            Para continuar, necesitamos algunos datos adicionales.
          </DialogDescription>
        </DialogHeader>
        <CompleteDataForm 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting}
          initialData={{
            firstName: user?.given_name || user?.nickname || "",
            lastName: user?.family_name || "",
          }}
        />
      </DialogContent>
    </Dialog>
  );
};