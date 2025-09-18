import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // <-- Agrega esta línea
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";

function ScoutEnrollment() {
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
    barrio: "",
    telefono: "",
    institucion: "",
    curso: "",
    calendario: "",
    jornada: "",
    sexo: "",
    peso: "",
    estatura: "",
    pasatiempos: "",
    deportes: "",
    instrumentos: "",
  });

  const [pagina, setPagina] = useState(1);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [showModal, setShowModal] = useState(false); // <-- Estado para controlar el modal
  const calendarioRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // <-- Inicializa el hook

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleFechaSeleccionada = (fecha?: Date) => {
    if (!fecha) return;
    const fechaFormateada = fecha.toISOString().split("T")[0];
    setFormulario({ ...formulario, fechaNacimiento: fechaFormateada });
    setMostrarCalendario(false);
  };

  useEffect(() => {
    const handleClickFuera = (e: MouseEvent) => {
      if (
        calendarioRef.current &&
        !calendarioRef.current.contains(e.target as Node)
      ) {
        setMostrarCalendario(false);
      }
    };
    document.addEventListener("mousedown", handleClickFuera);
    return () => {
      document.removeEventListener("mousedown", handleClickFuera);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pagina < 3) {
      setPagina((prev) => prev + 1);
    } else {
      console.log("Datos de inscripción:", formulario);
      setShowModal(true); // <-- Muestra el modal al enviar el formulario
    }
  };

  const camposPagina1 = (
    <>
      {/* Nombres */}
      <div className="">
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
      <div className="relative">
        <Label className="mb-1" htmlFor="fechaNacimiento">
          Fecha de nacimiento *
        </Label>
        <Input
          type="text"
          id="fechaNacimiento"
          name="fechaNacimiento"
          value={formulario.fechaNacimiento}
          onClick={() => setMostrarCalendario(true)}
          readOnly
          className="border border-primary"
          required
        />
        {mostrarCalendario && (
          <div ref={calendarioRef} className="absolute z-50 mt-2">
            <Calendar
              mode="single"
              selected={
                formulario.fechaNacimiento
                  ? new Date(formulario.fechaNacimiento)
                  : undefined
              }
              onSelect={handleFechaSeleccionada}
              toDate={new Date()}
            />
          </div>
        )}
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
      <div>
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
      {/* Barrio */}
      <div>
        <Label className="mb-1" htmlFor="barrio">
          Barrio *
        </Label>
        <Input
          id="barrio"
          name="barrio"
          value={formulario.barrio}
          onChange={handleChange}
          className="border border-primary"
          required
        />
      </div>
    </>
  );

  const camposPagina2 = (
    <>
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
    </>
  );

  const camposPagina3 = (
    <>
      {/* Pasatiempos */}
      <div>
        <Label className="mb-1" htmlFor="pasatiempos">
          Pasatiempos
        </Label>
        <Input
          id="pasatiempos"
          name="pasatiempos"
          value={formulario.pasatiempos}
          onChange={handleChange}
          className="border border-primary"
        />
      </div>
      {/* Deportes */}
      <div>
        <Label className="mb-1" htmlFor="deportes">
          Deportes
        </Label>
        <Input
          id="deportes"
          name="deportes"
          value={formulario.deportes}
          onChange={handleChange}
          className="border border-primary"
        />
      </div>
      {/* Instrumentos */}
      <div>
        <Label className="mb-1" htmlFor="instrumentos">
          Instrumentos
        </Label>
        <Input
          id="instrumentos"
          name="instrumentos"
          value={formulario.instrumentos}
          onChange={handleChange}
          className="border border-primary"
        />
      </div>
    </>
  );

  const getCamposPagina = () => {
    if (pagina === 1) return camposPagina1;
    if (pagina === 2) return camposPagina2;
    return camposPagina3;
  };

  const progreso = pagina === 1 ? 33 : pagina === 2 ? 66 : 100;

  return (
    <div className="min-h-screen w-screen bg-background px-20 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-10 text-left text-primary">
          Inscríbete
        </h1>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          Ingrese todos los datos requeridos en este formulario para enviar la solicitud de inscripción.
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Información personal</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {getCamposPagina()}
          {/* Botones */}
          <div className="col-span-2 flex justify-between mt-6">
            {pagina === 1 ? (
              <Button variant="outline" type="button" className="px-10 py-6" onClick={() => navigate("/")}>
                Cancelar
              </Button>
            ) : (
              <Button
                variant="outline"
                type="button"
                className="px-10 py-6"
                onClick={() => setPagina((prev) => prev - 1)}
              >
                Atrás
              </Button>
            )}
            {pagina < 3 ? (
              <Button type="submit" className="px-10 py-6">
                Continuar
              </Button>
            ) : (
              <Button type="submit" className="px-10 py-6">
                Enviar
              </Button>
            )}
          </div>
        </form>
        {/* Barra de progreso */}
        <div className="mt-8">
          <Progress className="h-2 rounded-full" value={progreso} />
        </div>
      </div>
      {/* Modal de confirmación */}
      {showModal && (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          backdropFilter: "blur(7px)",   
          backgroundColor: "rgba(0, 0, 0, 0.6)", 
        }}
      >
        <div className="bg-[#FFFAF3] rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
          <h3 className="text-xl font-bold mb-4 text-green-700">¡Solicitud enviada!</h3>
          <p className="mb-6 text-gray-700">
            Un encargado se comunicará contigo pronto.
          </p>
          <Button className="w-full" onClick={() => navigate("/")}>
            Cerrar
          </Button>
        </div>
      </div>
      )}
    </div>
  );
}
export default ScoutEnrollment;
