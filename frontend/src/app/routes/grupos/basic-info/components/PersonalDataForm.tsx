import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import type { PersonalData, ChangeEvent } from "@/types/enrollment.type";

interface Props {
  datos: PersonalData;
  handleChange: (e: ChangeEvent) => void;
  setDatos: React.Dispatch<React.SetStateAction<PersonalData>>;
  errors?: Record<string, string>;
}

export default function PersonalDataForm({
  datos,
  handleChange,
  errors = {},
}: Props) {
  const today = new Date().toISOString().split("T")[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 80);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <>
      <div>
        <Label htmlFor="firstname">Nombres *</Label>
        <Input
          id="firstname"
          name="firstname"
          value={datos.firstname}
          onChange={handleChange}
          className={`w-full ${
            errors.firstname ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        />
        {errors.firstname && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.firstname}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="lastname">Apellidos *</Label>
        <Input
          id="lastname"
          name="lastname"
          value={datos.lastname}
          onChange={handleChange}
          className={`w-full ${
            errors.lastname ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        />
        {errors.lastname && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.lastname}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={datos.email}
          className={`w-full ${
            errors.email ? "border-red-500 focus:border-red-500" : ""
          }`}
          onChange={handleChange}
          required
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_email">Confirmar correo *</Label>
        <Input
          id="confirm_email"
          name="confirm_email"
          type="email"
          value={datos.confirm_email}
          className={`w-full ${
            errors.confirm_email ? "border-red-500 focus:border-red-500" : ""
          }`}
          onChange={handleChange}
          required
        />
        {errors.confirm_email && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.confirm_email}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="username">Nombre de usuario *</Label>
        <Input
          id="username"
          name="username"
          value={datos.username ?? ""}
          onChange={handleChange}
          className={`w-full ${
            errors.username ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        />
        {errors.username && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Contraseña *</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={datos.password ?? ""}
          onChange={handleChange}
          className={`w-full ${
            errors.password ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un
          número y un carácter especial (* + - . , ?)
        </p>
        {errors.password && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.password}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirm_password">Confirmar contraseña *</Label>
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          value={datos.confirm_password ?? ""}
          onChange={handleChange}
          className={`w-full ${
            errors.confirm_password ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        />
        {errors.confirm_password && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.confirm_password}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="document_type">Tipo de documento *</Label>
        <select
          id="document_type"
          name="document_type"
          value={datos.document_type}
          onChange={handleChange}
          className={`w-full border rounded-md h-10 px-3 py-2 ${
            errors.document_type ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        >
          <option value="">Selecciona un tipo...</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="RC">Registro Civil</option>
          <option value="CE">Cédula de Extranjería</option>
        </select>
        {errors.document_type && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.document_type}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="identification">Número de documento *</Label>
        <Input
          id="identification"
          name="identification"
          value={datos.identification}
          onChange={handleChange}
          className={`w-full ${
            errors.identification ? "border-red-500 focus:border-red-500" : ""
          }`}
          inputMode="numeric"
          pattern="[0-9]*"
          required
        />
        {errors.identification && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.identification}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="birth_date">Fecha de nacimiento *</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={datos.birth_date}
          className={`w-full ${
            errors.birth_date ? "border-red-500 focus:border-red-500" : ""
          }`}
          onChange={handleChange}
          max={today}
          min={minDateStr}
          required
        />
        {errors.birth_date && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.birth_date}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="gender">Género *</Label>
        <select
          id="gender"
          name="gender"
          value={datos.gender}
          onChange={handleChange}
          className={`w-full border rounded-md h-10 px-3 py-2 ${
            errors.gender ? "border-red-500 focus:border-red-500" : ""
          }`}
          required
        >
          <option value="">Selecciona una opción...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        {errors.gender && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.gender}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          name="address"
          value={datos.address}
          onChange={handleChange}
          className={`w-full ${
            errors.address ? "border-red-500 focus:border-red-500" : ""
          }`}
          placeholder="Calle 123 #45-67"
          required
        />
        {errors.address && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.address}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={datos.phone}
          className={`w-full ${
            errors.phone ? "border-red-500 focus:border-red-500" : ""
          }`}
          onChange={handleChange}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="3001234567"
          required
        />
        {errors.phone && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.phone}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          name="weight"
          value={datos.weight}
          onChange={handleChange}
          className={`w-full ${
            errors.weight ? "border-red-500 focus:border-red-500" : ""
          }`}
          inputMode="decimal"
          placeholder="70.5"
        />
        {errors.weight && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.weight}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="height">Altura (cm)</Label>
        <Input
          id="height"
          name="height"
          value={datos.height}
          onChange={handleChange}
          className={`w-full ${
            errors.height ? "border-red-500 focus:border-red-500" : ""
          }`}
          inputMode="decimal"
          placeholder="175"
        />
        {errors.height && (
          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.height}
          </p>
        )}
      </div>
    </>
  );
}