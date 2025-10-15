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
      const newContacts = [...prev.emergency_contacts];
      newContacts[i] = { ...newContacts[i], [field]: value };
      return { ...prev, emergency_contacts: newContacts };
    });
  };

  const addContact = () =>
    setDatos((p) => ({
      ...p,
      emergency_contacts: [...p.emergency_contacts, { name: "", relationship: "", phone: "" }],
    }));

  const removeContact = (i: number) =>
    setDatos((p) => ({
      ...p,
      emergency_contacts: p.emergency_contacts.filter((_, idx) => idx !== i),
    }));

  return (
    <div className="col-span-full mt-4">
      <h3 className="text-lg font-semibold mb-3">Contactos de emergencia *</h3>
      {datos.emergency_contacts.map((c, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg">
          <div>
            <Label>Nombre</Label>
            <Input 
              value={c.name} 
              onChange={(e) => handleChange(i, "name", e.target.value)}
              placeholder="María González" 
            />
          </div>
          <div>
            <Label>Parentesco</Label>
            <Input
              value={c.relationship}
              onChange={(e) => handleChange(i, "relationship", e.target.value)}
              placeholder="Madre, Padre, Hermano/a..."
            />
          </div>
          <div>
            <Label>Teléfono</Label>
            <Input
              value={c.phone}
              onChange={(e) => handleChange(i, "phone", e.target.value)}
              placeholder="3009876543"
            />
          </div>
          <div className="flex gap-2">
            {datos.emergency_contacts.length > 1 && (
              <Button variant="destructive" size="sm" onClick={() => removeContact(i)}>
                X
              </Button>
            )}
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addContact} className="w-full">
        + Agregar contacto
      </Button>
    </div>
  );
}
