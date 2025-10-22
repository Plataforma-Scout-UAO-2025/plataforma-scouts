import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PersonalData, ChangeEvent } from "@/types/enrollment.type";
import { AlertCircle } from "lucide-react";

interface Props {
  datos: PersonalData;
  handleChange: (e: ChangeEvent) => void;
  errors?: Record<string, string>;
}

export default function InterestsForm({
  datos,
  handleChange,
  errors = {},
}: Props) {
  return (
    <>
      <div className="col-span-full w-full">
        <Label htmlFor="hobbies">Pasatiempos</Label>
        <Input
          id="hobbies"
          name="hobbies"
          value={datos.hobbies}
          onChange={handleChange}
          className={`w-full ${
            errors.hobbies ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="Lectura, videojuegos, pintura..."
        />
        {errors.hobbies && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.hobbies}
          </p>
        )}
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="sports">Deportes</Label>
        <Input
          id="sports"
          name="sports"
          value={datos.sports}
          onChange={handleChange}
          className={`w-full ${
            errors.sports ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="Fútbol, natación, ciclismo..."
        />
        {errors.sports && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.sports}
          </p>
        )}
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="instruments">Instrumentos musicales</Label>
        <Input
          id="instruments"
          name="instruments"
          value={datos.instruments}
          onChange={handleChange}
          className={`w-full ${
            errors.instruments ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="Guitarra, piano, flauta..."
        />
        {errors.instruments && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.instruments}
          </p>
        )}
      </div>
    </>
  );
}
