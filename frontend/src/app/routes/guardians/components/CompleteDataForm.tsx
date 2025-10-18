import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form.tsx";
import { Button } from "@/components/ui/button.tsx";
import { completeDataSchema, type CompleteDataFormData } from "../schemas/CompleteData.schema.ts";
import { useAgeCalculation } from "../hooks/useAgeCalculation.ts";
import { DocumentTypeField } from "./fields/DocumentTypeField.tsx";
import { IdentificationField } from "./fields/IdentificationField.tsx";
import { PhoneField } from "./fields/PhoneField.tsx";
import { GenderField } from "./fields/GenderField.tsx";
import { BirthDateField } from "./fields/BirthDateField.tsx";
import { AddressField } from "./fields/AddressField.tsx";

interface CompleteDataFormProps {
  onSubmit: (data: CompleteDataFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const CompleteDataForm = ({ onSubmit, isSubmitting }: CompleteDataFormProps) => {
  const form = useForm<CompleteDataFormData>({
    resolver: zodResolver(completeDataSchema),
    defaultValues: {
      identification: "",
      documentType: undefined,
      phone: "",
      address: "",
      gender: undefined,
      birthDate: "",
      age: undefined,
    },
  });

  // Auto-calculate age from birth date
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