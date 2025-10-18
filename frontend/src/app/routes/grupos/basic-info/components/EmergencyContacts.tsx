import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PersonalData } from "@/types/enrollment.type";

export default function EmergencyContacts({
  datos,
  setDatos,
}: {
  datos: PersonalData;
  setDatos: React.Dispatch<React.SetStateAction<PersonalData>>;
}) {
  const handleChange = (i: number, field: string, value: string) => {
    setDatos((prev) => {
      const currentContacts = prev.emergency_contacts ?? [];
      const newContacts = [...currentContacts];
      newContacts[i] = { ...newContacts[i], [field]: value };
      return { ...prev, emergency_contacts: newContacts };
    });
  };

  const addContact = () => {
    setDatos((p) => ({
      ...p,
      emergency_contacts: [...(p.emergency_contacts ?? []), { name: "", relationship: "", phone: "" }],
    }));
  };

  const removeContact = (i: number) => {
    setDatos((p) => ({
      ...p,
      emergency_contacts: (p.emergency_contacts ?? []).filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold mb-3">Contactos de emergencia</h3>

      {(datos.emergency_contacts ?? []).map((c, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <input
            type="text"
            value={c.name}
            placeholder="Nombre"
            onChange={(e) => handleChange(i, "name", e.target.value)}
            className="input"
          />
          <input
            type="text"
            value={c.relationship}
            placeholder="Relación"
            onChange={(e) => handleChange(i, "relationship", e.target.value)}
            className="input"
          />
          <input
            type="text"
            value={c.phone}
            placeholder="Teléfono"
            onChange={(e) => handleChange(i, "phone", e.target.value)}
            className="input"
          />
          <button type="button" onClick={() => removeContact(i)} className="text-red-500">
            Eliminar
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addContact}
        className="mt-2 text-primary underline"
      >
        + Agregar contacto
      </button>
    </div>
  );
}
