import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import type { CompleteDataFormData } from "@/app/routes/guardians/schemas/CompleteData.schema";

interface IdentificationFieldProps {
  control: Control<CompleteDataFormData>;
  disabled?: boolean;
}

export const IdentificationField = ({ control, disabled }: IdentificationFieldProps) => {
  return (
    <FormField
      control={control}
      name="identification"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Número de Identificación</FormLabel>
          <FormControl>
            <Input
              placeholder="1234567890"
              {...field}
              disabled={disabled}
              maxLength={10}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
