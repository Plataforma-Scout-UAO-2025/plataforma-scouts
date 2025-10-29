import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PersonalData } from "@/types/enrollment.type";
import { Trash, AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  datos: PersonalData;
  setDatos: React.Dispatch<React.SetStateAction<PersonalData>>;
  errors?: Record<string, string>;
  onContactChange?: (updatedData: PersonalData) => void;
}

export default function EmergencyContacts({
  datos,
  setDatos,
  errors = {},
  onContactChange,
}: Props) {
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && (!datos.emergency_contacts || datos.emergency_contacts.length === 0)) {
      initializedRef.current = true;
      const newData = {
        ...datos,
        emergency_contacts: [{ name: "", relationship: "", phone: "" }],
      };
      setDatos(newData);
      onContactChange?.(newData);
    }
  }, [datos, setDatos, onContactChange]);

  // Verificar si el último contacto está completo
  const isLastContactComplete = () => {
    const contacts = datos.emergency_contacts ?? [];
    if (contacts.length === 0) return true;
    
    const lastContact = contacts[contacts.length - 1];
    return (
      lastContact.name?.trim() !== "" &&
      lastContact.relationship?.trim() !== "" &&
      lastContact.phone?.trim() !== ""
    );
  };

  const canAddNewContact = isLastContactComplete();

  const handleChange = (i: number, field: string, value: string) => {
    let sanitizedValue = value;

    if (field === "name" || field === "relationship") {
      sanitizedValue = value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, "");
    } else if (field === "phone") {
      sanitizedValue = value.replace(/[^0-9]/g, "");
      if (sanitizedValue.length > 10) {
        sanitizedValue = sanitizedValue.slice(0, 10);
      }
    }

    setDatos((prev) => {
      const currentContacts = prev.emergency_contacts ?? [];
      const newContacts = [...currentContacts];
      newContacts[i] = { ...newContacts[i], [field]: sanitizedValue };
      const newData = { ...prev, emergency_contacts: newContacts };
      onContactChange?.(newData);

      return newData;
    });
  };

  const addContact = () => {
    if (!canAddNewContact) return;
    
    setDatos((prev) => {
      const newData = {
        ...prev,
        emergency_contacts: [
          ...(prev.emergency_contacts ?? []),
          { name: "", relationship: "", phone: "" },
        ],
      };
      onContactChange?.(newData);
      return newData;
    });
  };

  const removeContact = (i: number) => {
    setDatos((prev) => {
      const newData = {
        ...prev,
        emergency_contacts: (prev.emergency_contacts ?? []).filter(
          (_, idx) => idx !== i
        ),
      };
      onContactChange?.(newData);

      return newData;
    });
  };

  const hasGeneralError = errors["emergency_contacts"];

  const getContactErrors = (index: number) => {
    return {
      name: errors[`emergency_contacts.${index}.name`],
      relationship: errors[`emergency_contacts.${index}.relationship`],
      phone: errors[`emergency_contacts.${index}.phone`],
    };
  };

  const hasAnyContactError = (datos.emergency_contacts ?? []).some((_, i) => {
    const contactErrors = getContactErrors(i);
    return (
      contactErrors.name || contactErrors.relationship || contactErrors.phone
    );
  });

  return (
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold mb-3">Contactos de emergencia *</h3>

      {hasGeneralError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{hasGeneralError}</p>
        </div>
      )}

      {!hasGeneralError && hasAnyContactError && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            Algunos contactos tienen errores. Por favor revisa los campos
            marcados en rojo.
          </p>
        </div>
      )}

      {(datos.emergency_contacts ?? []).map((c, i) => {
        const contactErrors = getContactErrors(i);
        const hasError =
          contactErrors.name ||
          contactErrors.relationship ||
          contactErrors.phone;
        return (
          <div
            key={i}
            className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg ${
              hasError ? "bg-red-50 border-red-300" : "bg-muted/50"
            }`}
          >
            <div>
              <Label>Nombre *</Label>
              <Input
                value={c.name}
                onChange={(e) => handleChange(i, "name", e.target.value)}
                placeholder="María González"
                className={
                  contactErrors.name
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                required
              />
              {contactErrors.name && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {contactErrors.name}
                </p>
              )}
            </div>

            <div>
              <Label>Parentesco *</Label>
              <Input
                value={c.relationship}
                onChange={(e) =>
                  handleChange(i, "relationship", e.target.value)
                }
                placeholder="Madre, Padre, Hermano/a..."
                className={
                  contactErrors.relationship
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                required
              />

              {contactErrors.relationship && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {contactErrors.relationship}
                </p>
              )}
            </div>

            <div>
              <Label>Teléfono *</Label>
              <Input
                value={c.phone}
                onChange={(e) => handleChange(i, "phone", e.target.value)}
                placeholder="3009876543"
                inputMode="numeric"
                maxLength={10}
                className={
                  contactErrors.phone
                    ? "border-red-500 focus:border-red-500"
                    : ""
                }
                required
              />
              <p
                className={`text-xs mt-1 ${
                  contactErrors.phone ? "text-red-600" : "text-muted-foreground"
                }`}
              >
                {c.phone.length}/10 dígitos
              </p>
              {contactErrors.phone && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {contactErrors.phone}
                </p>
              )}
            </div>

            <div className="flex gap-2 md:col-span-3">
              {(datos.emergency_contacts ?? []).length > 1 && (
                <Button
                  type="button"
                  variant="destructive"
                  className="hover:text-destructive-hover"
                  size="sm"
                  onClick={() => removeContact(i)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar contacto
                </Button>
              )}
            </div>
          </div>
        );
      })}
      
      <Button
        type="button"
        variant="primary"
        onClick={addContact}
        className="w-full"
        disabled={!canAddNewContact}
        title={
          !canAddNewContact
            ? "Completa todos los campos del contacto actual antes de agregar uno nuevo"
            : "Agregar nuevo contacto de emergencia"
        }
      >
        + Agregar contacto
      </Button>
      
      {!canAddNewContact && (datos.emergency_contacts ?? []).length > 0 && (
        <p className="text-xs text-red-600">
          Complete todos los campos del contacto actual antes de agregar uno nuevo
        </p>
      )}
    </div>
  );
}