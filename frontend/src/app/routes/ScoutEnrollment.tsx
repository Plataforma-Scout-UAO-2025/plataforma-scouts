import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ScoutEnrollment() {
  const [formulario, setFormulario] = useState({
    nombres: "",
    apellidos: "",
    correo: "",
    confirmarCorreo: "",
    tipoDocumento: "",
    numeroDocumento: "",
    fechaNacimiento: "",
    ciudad: "",
    direccion: "",
    telefono: "",
    institucion: "",
    curso: "",
    calendario: "",
    jornada: "",
    sexo: "",
    peso: "",
    estatura: "",
    tipoSangre: "",
    rh: "",
    eps: "",
    sitioAtencion: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos de inscripción:", formulario);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1 className="text-3xl font-bold mb-10 text-center text-primary">
        Inscripción al Grupo Scout
      </h1>
      <h2 className="text-xl mb-6">Información personal</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-5 w-1/2">
        {/* Nombres */}
        <div>
          <Label className="mb-1" htmlFor="nombres">
            Nombres *
          </Label>
          <Input
            id="nombres"
            name="nombres"
            value={formulario.nombres}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Apellidos */}
        <div>
          <Label className="mb-1" htmlFor="apellidos">
            Apellidos *
          </Label>
          <Input
            id="apellidos"
            name="apellidos"
            value={formulario.apellidos}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Correo */}
        <div>
          <Label className="mb-1" htmlFor="correo">
            Correo electrónico *
          </Label>
          <Input
            type="email"
            id="correo"
            name="correo"
            value={formulario.correo}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Confirmar correo */}
        <div>
          <Label className="mb-1" htmlFor="confirmarCorreo">
            Confirmar correo *
          </Label>
          <Input
            type="email"
            id="confirmarCorreo"
            name="confirmarCorreo"
            value={formulario.confirmarCorreo}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Documento */}
        <div>
          <Label className="mb-1" htmlFor="tipoDocumento">
            Tipo de documento *
          </Label>
          <Input
            id="tipoDocumento"
            name="tipoDocumento"
            value={formulario.tipoDocumento}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        <div>
          <Label className="mb-1" htmlFor="numeroDocumento">
            Número de documento *
          </Label>
          <Input
            id="numeroDocumento"
            name="numeroDocumento"
            value={formulario.numeroDocumento}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Fecha de nacimiento */}
        <div>
          <Label className="mb-1" htmlFor="fechaNacimiento">
            Fecha de nacimiento *
          </Label>
          <Input
            type="date"
            id="fechaNacimiento"
            name="fechaNacimiento"
            value={formulario.fechaNacimiento}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Ciudad */}
        <div>
          <Label className="mb-1" htmlFor="ciudad">
            Ciudad de residencia *
          </Label>
          <Input
            id="ciudad"
            name="ciudad"
            value={formulario.ciudad}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Dirección */}
        <div className="md:col-span-2">
          <Label className="mb-1" htmlFor="direccion">
            Dirección *
          </Label>
          <Input
            id="direccion"
            name="direccion"
            value={formulario.direccion}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Teléfono */}
        <div>
          <Label className="mb-1" htmlFor="telefono">
            Teléfono *
          </Label>
          <Input
            id="telefono"
            name="telefono"
            value={formulario.telefono}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Institución y curso */}
        <div>
          <Label className="mb-1" htmlFor="institucion">
            Institución educativa *
          </Label>
          <Input
            id="institucion"
            name="institucion"
            value={formulario.institucion}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        <div>
          <Label className="mb-1" htmlFor="curso">
            Curso actual *
          </Label>
          <Input
            id="curso"
            name="curso"
            value={formulario.curso}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Calendario */}
        <div>
          <Label className="mb-1" htmlFor="calendario">
            Calendario
          </Label>
          <Input
            id="calendario"
            name="calendario"
            value={formulario.calendario}
            onChange={handleChange}
            className="border border-primary"
          />
        </div>
        {/* Jornada */}
        <div>
          <Label className="mb-1" htmlFor="jornada">
            Jornada *
          </Label>
          <Input
            id="jornada"
            name="jornada"
            value={formulario.jornada}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Sexo */}
        <div>
          <Label className="mb-1" htmlFor="sexo">
            Sexo *
          </Label>
          <Input
            id="sexo"
            name="sexo"
            value={formulario.sexo}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Peso y estatura */}
        <div>
          <Label className="mb-1" htmlFor="peso">
            Peso
          </Label>
          <Input
            id="peso"
            name="peso"
            value={formulario.peso}
            onChange={handleChange}
            className="border border-primary"
          />
        </div>
        <div>
          <Label className="mb-1" htmlFor="estatura">
            Estatura
          </Label>
          <Input
            id="estatura"
            name="estatura"
            value={formulario.estatura}
            onChange={handleChange}
            className="border border-primary"
          />
        </div>
        {/* Sangre, RH */}
        <div>
          <Label className="mb-1" htmlFor="tipoSangre">
            Tipo de sangre *
          </Label>
          <Input
            id="tipoSangre"
            name="tipoSangre"
            value={formulario.tipoSangre}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        <div>
          <Label className="mb-1" htmlFor="rh">
            RH *
          </Label>
          <Input
            id="rh"
            name="rh"
            value={formulario.rh}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* EPS */}
        <div>
          <Label className="mb-1" htmlFor="eps">
            EPS *
          </Label>
          <Input
            id="eps"
            name="eps"
            value={formulario.eps}
            onChange={handleChange}
            className="border border-primary"
            required
          />
        </div>
        {/* Sitio de atención */}
        <div className="md:col-span-2">
          <Label className="mb-1" htmlFor="sitioAtencion">
            Sitio de atención
          </Label>
          <Input
            id="sitioAtencion"
            name="sitioAtencion"
            value={formulario.sitioAtencion}
            onChange={handleChange}
            className="border border-primary"
          />
        </div>
        {/* Botón */}
        <div className="col-span-3 flex justify-center mt-4">
          <Button type="submit">Enviar inscripción</Button>
        </div>
      </form>
    </div>
  );
}
