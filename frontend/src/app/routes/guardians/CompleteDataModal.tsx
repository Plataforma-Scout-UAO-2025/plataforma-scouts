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
import { useCompleteData } from "@/app/routes/guardians/hooks/useCompleteData";
import { guardianService } from "@/app/routes/guardians/services/guardianService";
import { toast } from "sonner";

export const CompleteDataModal = () => {
  const { isOpen, isLoading, markDataComplete } = useCompleteData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth0();

  const handleSubmit = async (data: CompleteDataFormData) => {
    setIsSubmitting(true);
    try {
      const userId = user?.sub;

      if (!userId) {
        throw new Error("Could not get user ID");
      }

      await guardianService.updateData(userId, {
        identification: data.identification,
        documentType: data.documentType,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        birthDate: data.birthDate,
        age: data.age,
      });

      markDataComplete();
      
      toast.success("Datos guardados exitosamente");
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Error al guardar los datos. Por favor intenta de nuevo.");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[600px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Completa tu perfil</DialogTitle>
          <DialogDescription>
            Para continuar, necesitamos tu información personal completa. 
            Esta información es requerida para tu registro como acudiente.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <CompleteDataForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>
      </DialogContent>
    </Dialog>
  );
};