import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { Control } from "react-hook-form";
import type { CompleteDataFormData } from "@/app/routes/guardians/schemas/CompleteData.schema";

interface AddressFieldProps {
  control: Control<CompleteDataFormData>;
  disabled?: boolean;
}

export const AddressField = ({ control, disabled }: AddressFieldProps) => {
  return (
    <FormField
      control={control}
      name="address"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dirección</FormLabel>
          <FormControl>
            <Input
              placeholder="Calle 123 #45-67"
              {...field}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
