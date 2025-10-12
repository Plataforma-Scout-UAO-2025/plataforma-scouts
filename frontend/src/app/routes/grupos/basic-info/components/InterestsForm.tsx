import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PersonalData, ChangeEvent } from "@/types/enrollment.type";

export default function InterestsForm({
  datos,
  handleChange,
}: {
  datos: PersonalData;
  handleChange: (e: ChangeEvent) => void;
}) {
  return (
    <>
      <div className="col-span-full w-full">
        <Label htmlFor="hobbies">Pasatiempos</Label>
        <Input
          id="hobbies"
          name="hobbies"
          value={datos.hobbies}
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="sports">Deportes</Label>
        <Input 
          id="sports" 
          name="sports" 
          value={datos.sports} 
          onChange={handleChange}
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="instruments">Instrumentos musicales</Label>
        <Input
          id="instruments"
          name="instruments"
          value={datos.instruments}
          onChange={handleChange}
          className="w-full"
        />
      </div>
    </>
  );
}
