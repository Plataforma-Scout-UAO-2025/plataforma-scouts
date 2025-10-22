import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form.tsx";
import { Input } from "@/components/ui/input.tsx";
import type { Control } from "react-hook-form";
import type { CompleteDataFormData } from "../../schemas/CompleteData.schema.ts";

interface PhoneFieldProps {
  control: Control<CompleteDataFormData>;
  disabled?: boolean;
}

export const PhoneField = ({ control, disabled }: PhoneFieldProps) => {
  return (
    <FormField
      control={control}
      name="phone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Teléfono</FormLabel>
          <FormControl>
            <Input
              placeholder="3001234567"
              {...field}
              disabled={disabled}
              maxLength={10}
              type="tel"
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
