import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import type { CompleteDataFormData } from "../../schemas/CompleteData.schema";

interface BirthDateFieldProps {
  control: Control<CompleteDataFormData>;
  disabled?: boolean;
}

export const BirthDateField = ({ control, disabled }: BirthDateFieldProps) => {
  return (
    <FormField
      control={control}
      name="birthDate"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fecha de Nacimiento</FormLabel>
          <FormControl>
            <Input
              type="date"
              {...field}
              disabled={disabled}
              max={new Date().toISOString().split('T')[0]}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
