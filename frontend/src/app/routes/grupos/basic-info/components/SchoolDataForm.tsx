import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SchoolData, ChangeEvent } from "@/types/enrollment.type";

export default function SchoolDataForm({
  datos,
  handleChange,
}: {
  datos: SchoolData;
  handleChange: (e: ChangeEvent) => void;
}) {
  return (
    <>
      <div>
        <Label htmlFor="institution">Institución educativa *</Label>
        <Input
          id="institution"
          name="institution"
          value={datos.institution}
          onChange={handleChange}
          className="w-full"
          placeholder="Nombre de la institución"
          required
        />
      </div>
      <div>
        <Label htmlFor="course">Curso/Grado *</Label>
        <Input 
          id="course" 
          name="course" 
          value={datos.course} 
          onChange={handleChange}
          className="w-full"
          placeholder="9, 10, 11..."
          required
        />
      </div>
      <div>
        <Label htmlFor="calendar">Calendario</Label>
        <select 
          id="calendar" 
          name="calendar" 
          value={datos.calendar} 
          onChange={handleChange}
          className="w-full border rounded-md h-10 px-3 py-2"
        >
          <option value="">Selecciona un calendario...</option>
          <option value="A">Calendario A</option>
          <option value="B">Calendario B</option>
        </select>
      </div>
      <div>
        <Label htmlFor="shift">Jornada *</Label>
        <select
          id="shift"
          name="shift"
          value={datos.shift}
          onChange={handleChange}
          className="w-full border rounded-md h-10 px-3 py-2"
        >
          <option value="">Selecciona una jornada...</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
          <option value="Completa">Completa</option>
        </select>
      </div>
    </>
  );
}
