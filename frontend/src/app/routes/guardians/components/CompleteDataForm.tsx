import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { completeDataSchema, type CompleteDataFormData } from "@/app/routes/guardians/schemas/CompleteData.schema";
import { useAgeCalculation } from "@/app/routes/guardians/hooks/useAgeCalculation";
import { DocumentTypeField } from "@/app/routes/guardians/components/fields/DocumentTypeField";
import { IdentificationField } from "@/app/routes/guardians/components/fields/IdentificationField";
import { PhoneField } from "@/app/routes/guardians/components/fields/PhoneField";
import { GenderField } from "@/app/routes/guardians/components/fields/GenderField";
import { BirthDateField } from "@/app/routes/guardians/components/fields/BirthDateField";
import { AddressField } from "@/app/routes/guardians/components/fields/AddressField";


interface CompleteDataFormProps {
  onSubmit: (data: CompleteDataFormData) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Partial<CompleteDataFormData>;
}

export const CompleteDataForm = ({ onSubmit, isSubmitting, initialData }: CompleteDataFormProps) => {
  const form = useForm<CompleteDataFormData>({
    resolver: zodResolver(completeDataSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      identification: initialData?.identification || "",
      documentType: initialData?.documentType,
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      gender: initialData?.gender,
      birthDate: initialData?.birthDate || ""

    },
  });

  useAgeCalculation(form);

  const handleSubmit = async (data: CompleteDataFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error("Error in form submission:", error);
    }
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)} 
        className="space-y-4 max-h-[60vh] overflow-y-auto px-1"
      >
        {/* First Name and Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Juan"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Pérez"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Document Type and Identification */}
        <div className="grid grid-cols-2 gap-4">
          <DocumentTypeField control={form.control} disabled={isSubmitting} />
          <IdentificationField control={form.control} disabled={isSubmitting} />
        </div>

        {/* Phone and Gender */}
        <div className="grid grid-cols-2 gap-4">
          <PhoneField control={form.control} disabled={isSubmitting} />
          <GenderField control={form.control} disabled={isSubmitting} />
        </div>

        {/* Birth Date */}
        <BirthDateField control={form.control} disabled={isSubmitting} />

        {/* Address */}
        <AddressField control={form.control} disabled={isSubmitting} />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar y Continuar"}
        </Button>
      </form>
    </Form>
  );
};