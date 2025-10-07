import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Control } from "react-hook-form";
import type { CompleteDataFormData } from "../../schemas/CompleteData.schema";

interface DocumentTypeFieldProps {
  control: Control<CompleteDataFormData>;
  disabled?: boolean;
}

export const DocumentTypeField = ({ control, disabled }: DocumentTypeFieldProps) => {
  return (
    <FormField
      control={control}
      name="documentType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tipo de Documento</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
              <SelectItem value="RC">Registro Civil</SelectItem>
              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
              <SelectItem value="PA">Pasaporte</SelectItem>
              <SelectItem value="PEP">Permiso Especial de Permanencia</SelectItem>
              <SelectItem value="PPT">Permiso por Protección Temporal</SelectItem>
              <SelectItem value="NIT">Número de Identificación Tributaria</SelectItem>
              <SelectItem value="NUIP">Número Único de Identificación Personal</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
