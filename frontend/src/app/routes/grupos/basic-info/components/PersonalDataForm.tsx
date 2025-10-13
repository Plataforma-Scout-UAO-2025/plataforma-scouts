import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import EmergencyContacts from "./EmergencyContacts";
import type { PersonalData, ChangeEvent } from "@/types/enrollment.type";
import type { GroupResponseDTO } from "@/types/group.type";

interface Props {
  datos: PersonalData;
  handleChange: (e: ChangeEvent) => void;
  groups: GroupResponseDTO[];
  loadingGroups: boolean;
  setDatos: React.Dispatch<React.SetStateAction<PersonalData>>;
}

export default function PersonalDataForm({
  datos,
  handleChange,
  groups,
  loadingGroups,
  setDatos,
}: Props) {
  return (
    <>
      <div>
        <Label htmlFor="firstname">Nombres *</Label>
        <Input
          id="firstname"
          name="firstname"
          value={datos.firstname}
          onChange={handleChange}
          className="w-full"       
          required
        />
      </div>

      <div>
        <Label htmlFor="lastname">Apellidos *</Label>
        <Input
          id="lastname"
          name="lastname"
          value={datos.lastname}
          onChange={handleChange}
          className="w-full"  
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={datos.email}
          className="w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="confirm_email">Confirmar correo *</Label>
        <Input
          id="confirm_email"
          name="confirm_email"
          type="email"
          value={datos.confirm_email}
          className="w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="document_type">Tipo de documento *</Label>
        <select
          id="document_type"
          name="document_type"
          value={datos.document_type}
          onChange={handleChange}
          className="w-full border rounded-md h-10 px-3 py-2"
          required
        >
          <option value="">Selecciona un tipo...</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CE">Cédula de Extranjería</option>
        </select>
      </div>

      <div>
        <Label htmlFor="identification">Número de documento *</Label>
        <Input
          id="identification"
          name="identification"
          value={datos.identification}
          onChange={handleChange}
          className="w-full"   
          required
        />
      </div>

      <div>
        <Label htmlFor="birth_date">Fecha de nacimiento *</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={datos.birth_date}
          className="w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="gender">Género *</Label>
        <select
          id="gender"
          name="gender"
          value={datos.gender}
          onChange={handleChange}
          className="w-full border rounded-md h-10 px-3 py-2"
          required
        >
          <option value="">Selecciona una opción...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          name="address"
          value={datos.address}
          onChange={handleChange}
          className="w-full"
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={datos.phone}
          className="w-full"
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          name="weight"
          value={datos.weight}
          onChange={handleChange}
          className="w-full"/>
      </div>

      <div>
        <Label htmlFor="height">Altura (cm)</Label>
        <Input
          id="height"
          name="height"
          value={datos.height}
          onChange={handleChange}
          className="w-full"/>
      </div>

      <div className="col-span-full">
        <Label htmlFor="group">Grupo scout *</Label>
        <select
          id="group"
          name="group"
          value={datos.group}
          onChange={handleChange}
          disabled={loadingGroups}
          className="w-full border rounded-md h-10 px-3 py-2"
          required
        >
          <option value="">
            {loadingGroups ? "Cargando grupos..." : "Selecciona un grupo..."}
          </option>
          {groups.map((g, i) => (
            <option key={i} value={g.name}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <EmergencyContacts datos={datos} setDatos={setDatos} />
    </>
  );
}
