import { useEffect } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CompleteDataFormData } from "../schemas/CompleteData.schema.ts";

/**
 * Hook para calcular automáticamente la edad basándose en la fecha de nacimiento
 * @param form - Form object de react-hook-form
 */
export const useAgeCalculation = (form: UseFormReturn<CompleteDataFormData>) => {
  const watchBirthDate = form.watch("birthDate");

  useEffect(() => {
    if (watchBirthDate) {
      const birthDate = new Date(watchBirthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      const calculatedAge = 
        monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ? age - 1
          : age;
      
      form.setValue("age", calculatedAge);
    }
  }, [watchBirthDate, form]);
};
