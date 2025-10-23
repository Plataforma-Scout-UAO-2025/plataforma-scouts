import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SchoolData, ChangeEvent } from "@/types/enrollment.type";
import { AlertCircle } from "lucide-react";

interface Props {
  datos: SchoolData;
  handleChange: (e: ChangeEvent) => void;
  errors?: Record<string, string>;
}

export default function SchoolDataForm({
  datos,
  handleChange,
  errors = {},
}: Props) {
  return (
    <>
      <div>
        <Label htmlFor="institution">Institución educativa *</Label>
        <Input
          id="institution"
          name="institution"
          value={datos.institution}
          onChange={handleChange}
          className={`w-full ${
            errors.institution ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="Nombre de la institución"
          required
        />
        {errors.institution && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.institution}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="course">Curso/Grado *</Label>
        <Input
          id="course"
          name="course"
          value={datos.course}
          onChange={handleChange}
          className={`w-full ${
            errors.course ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="9, 10, 11..."
          required
        />
        {errors.course && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.course}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="calendar">Calendario *</Label>
        <select
          id="calendar"
          name="calendar"
          value={datos.calendar}
          onChange={handleChange}
          className={`w-full border rounded-md h-10 px-3 py-2 ${
            errors.calendar ? "border-red-500 focus:border-red-500" : ""
          }`}
        >
          <option value="">Selecciona un calendario...</option>
          <option value="A">Calendario A</option>
          <option value="B">Calendario B</option>
        </select>
        {errors.calendar && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.calendar}
          </p>
        )}
      </div>
      <div>
        <Label htmlFor="shift">Jornada *</Label>
        <select
          id="shift"
          name="shift"
          value={datos.shift}
          onChange={handleChange}
          className={`w-full border rounded-md h-10 px-3 py-2 ${
            errors.shift ? "border-red-500 focus:border-red-500" : ""
          }`}
        >
          <option value="">Selecciona una jornada...</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
          <option value="Completa">Completa</option>
        </select>
        {errors.shift && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.shift}
          </p>
        )}
      </div>
    </>
  );
}