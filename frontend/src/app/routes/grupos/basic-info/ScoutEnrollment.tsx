import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Estructura para contactos de emergencia
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

interface PersonalData {
  firstname: string;
  lastname: string;
  email: string;
  confirmarCorreo: string;
  document_type: string;
  identification: string;
  birth_date: string;
  address: string;
  phone: string;
  gender: string;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  grupo: string;
  rama: string;
  emergency_contacts: EmergencyContact[];
}

interface SchoolData {
  institution: string;
  course: string;
  calendar: string;
  shift: string;
}

interface CrearMiembroData {
  subgroup_id: number;
  first_name: string;
  last_name: string;
  age: number;
  role: string;
  identification: number;
  document_type: string;
  email: string;
  gender: string;
  birth_date: string;
  address: string;
  phone: string;
  weight: string;
  height: string;
  hobbies: string;
  sports: string;
  instruments: string;
  status: string;
  emergencyPhone: Record<string, EmergencyContact>;
}

interface CrearMiembroResponse {
  member_id: number;
  [key: string]: number;
}

function ScoutEnrollment() {
  // Datos del miembro
  const [datosPersonales, setDatosPersonales] = useState<PersonalData>({
    firstname: "",
    lastname: "",
    email: "",
    confirmarCorreo: "",
    document_type: "",
    identification: "",
    birth_date: "",
    address: "",
    phone: "",
    gender: "",
    weight: "",
    height: "",
    hobbies: "",
    sports: "",
    instruments: "",
    grupo: "",
    rama: "",
    emergency_contacts: [
      { name: "", relationship: "", phone: "" },
      { name: "", relationship: "", phone: "" },
    ],
  });

  // Datos escolares
  const [datosEscolares, setDatosEscolares] = useState({
    institution: "",
    course: "",
    calendar: "",
    shift: "",
  });

  const [pagina, setPagina] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showSchoolDialog, setShowSchoolDialog] = useState(false);
  const [incluirDatosEscolares, setIncluirDatosEscolares] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Calcula la edad a partir de la fecha de nacimiento
  interface CalcularEdad {
    (fecha: string): number;
  }

  const calcularEdad: CalcularEdad = (fecha) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

type ChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
  const handlePersonalChange = (e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosPersonales((prev) => ({ ...prev, [name]: value }));
  };

  const handleSchoolChange = (e: ChangeEvent) => {
    const { name, value } = e.target;
    setDatosEscolares((prev: SchoolData) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (
    index: number,
    field: keyof EmergencyContact,
    value: string
  ) => {
    setDatosPersonales((prev) => {
      const newContacts = [...prev.emergency_contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, emergency_contacts: newContacts };
    });
  };

  const addEmergencyContact = () => {
    setDatosPersonales((prev) => ({
      ...prev,
      emergency_contacts: [
        ...prev.emergency_contacts,
        { name: "", relationship: "", phone: "" },
      ],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    if (datosPersonales.emergency_contacts.length > 1) {
      setDatosPersonales((prev) => ({
        ...prev,
        emergency_contacts: prev.emergency_contacts.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  const crearMiembro = async (
    memberData: CrearMiembroData
  ): Promise<CrearMiembroResponse> => {
    try {
      const response = await fetch(
        "http://localhost:8081/api/members/create_member",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el miembro");
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const crearDatosEscolares = async (
    schoolData: SchoolData & { member_id: number }
  ) => {
    try {
      const response = await fetch("/api/school/crear_datos_escolares", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Error al crear los datos escolares"
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const transformarDatos = (data: PersonalData): CrearMiembroData => {
    const edad = calcularEdad(data.birth_date);

    // Mapear nombre del grupo a subgroup_id
    const grupoASubgroupId: Record<string, number> = {
      "Centinelas 113": 1,
      "803 Chiminigagua": 2,
    };

    // Transformar emergency_contacts a emergencyPhone
    const emergencyPhone: Record<string, EmergencyContact> = {};
    data.emergency_contacts.forEach((contact, index) => {
      if (contact.name && contact.phone) {
        emergencyPhone[`contact${index + 1}`] = {
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone,
        };
      }
    });

    return {
      subgroup_id: grupoASubgroupId[data.grupo] || 1,
      first_name: data.firstname,
      last_name: data.lastname,
      age: edad,
      role: "Scout",
      identification: Number(data.identification),
      document_type: data.document_type,
      email: data.email,
      gender: data.gender,
      birth_date: data.birth_date,
      address: data.address,
      phone: data.phone,
      weight: data.weight,
      height: data.height,
      hobbies: data.hobbies,
      sports: data.sports,
      instruments: data.instruments,
      status: "PENDING",
      emergencyPhone: emergencyPhone,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pagina === 1) {
      // Validar que los correos coincidan
      if (datosPersonales.email !== datosPersonales.confirmarCorreo) {
        alert("Los correos electrónicos no coinciden");
        return;
      }
      // Después de la primera página, preguntar si quiere incluir datos escolares
      setShowSchoolDialog(true);
      return;
    }

    if (pagina === 2 && incluirDatosEscolares) {
      setPagina(3);
      return;
    }

    setLoading(true);
    try {
      // Conversión de datos personales
      const memberData = transformarDatos(datosPersonales);

      const miembroCreado = await crearMiembro(memberData);

      if (
        incluirDatosEscolares &&
        (datosEscolares.institution || datosEscolares.course)
      ) {
        const schoolData = {
          member_id: miembroCreado.member_id,
          institution: datosEscolares.institution,
          course: datosEscolares.course,
          calendar: datosEscolares.calendar,
          shift: datosEscolares.shift,
        };

        await crearDatosEscolares(schoolData);
      }

      // Mostrar modal de éxito
      setShowModal(true);
      } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    alert("Error al enviar la solicitud: " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSchoolDialogResponse = (incluir: boolean) => {
    setIncluirDatosEscolares(incluir);
    setShowSchoolDialog(false);

    if (incluir) {
      setPagina(2);
    } else {
      setPagina(3);
    }
  };

  const camposPagina1 = (
    <>
      {/* Nombres */}
      <div>
        <Label className="mb-1" htmlFor="firstname">
          Nombres *
        </Label>
        <Input
          id="firstname"
          name="firstname"
          value={datosPersonales.firstname}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>
      {/* Apellidos */}
      <div>
        <Label className="mb-1" htmlFor="lastname">
          Apellidos *
        </Label>
        <Input
          id="lastname"
          name="lastname"
          value={datosPersonales.lastname}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>
      {/* Correo */}
      <div>
        <Label className="mb-1" htmlFor="email">
          Correo electrónico *
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={datosPersonales.email}
          onChange={handlePersonalChange}
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
          value={datosPersonales.confirmarCorreo}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>
      {/* Documento */}
      <div>
        <Label className="mb-1" htmlFor="document_type">
          Tipo de documento *
        </Label>
        <select
          id="document_type"
          name="document_type"
          value={datosPersonales.document_type}
          onChange={handlePersonalChange}
          className="border border-primary rounded w-full h-10 px-2 bg-white"
          required
        >
          <option value="">Selecciona...</option>
          <option value="CC">Cédula de ciudadanía (CC)</option>
          <option value="TI">Tarjeta de identidad (TI)</option>
        </select>
      </div>
      <div>
        <Label className="mb-1" htmlFor="identification">
          Número de documento *
        </Label>
        <Input
          id="identification"
          name="identification"
          value={datosPersonales.identification}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>

      {/* Grupo */}
      <div>
        <Label className="mb-1" htmlFor="grupo">
          Grupo *
        </Label>
        <select
          id="grupo"
          name="grupo"
          value={datosPersonales.grupo}
          onChange={handlePersonalChange}
          className="border border-primary rounded w-full h-10 px-2 bg-white"
          required
        >
          <option value="">Selecciona...</option>
          <option value="Centinelas 113">Centinelas 113</option>
          <option value="803 Chiminigagua">803 Chiminigagua</option>
        </select>
      </div>

      {/* Fecha de nacimiento */}
      <div>
        <Label className="mb-1" htmlFor="birth_date">
          Fecha de nacimiento *
        </Label>
        <Input
          type="date"
          id="birth_date"
          name="birth_date"
          value={datosPersonales.birth_date}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>

      {/* Dirección */}
      <div>
        <Label className="mb-1" htmlFor="address">
          Dirección *
        </Label>
        <Input
          id="address"
          name="address"
          value={datosPersonales.address}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>

      {/* Teléfono */}
      <div>
        <Label className="mb-1" htmlFor="phone">
          Teléfono *
        </Label>
        <Input
          id="phone"
          name="phone"
          value={datosPersonales.phone}
          onChange={handlePersonalChange}
          className="border border-primary"
          required
        />
      </div>

      {/* Sexo */}
      <div>
        <Label className="mb-1" htmlFor="gender">
          Sexo *
        </Label>
        <select
          id="gender"
          name="gender"
          value={datosPersonales.gender}
          onChange={handlePersonalChange}
          className="border border-primary rounded w-full h-10 px-2 bg-white"
          required
        >
          <option value="">Selecciona...</option>
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
        </select>
      </div>

      {/* Peso y estatura */}
      <div>
        <Label className="mb-1" htmlFor="weight">
          Peso (kg)
        </Label>
        <Input
          id="weight"
          name="weight"
          value={datosPersonales.weight}
          onChange={handlePersonalChange}
          className="border border-primary"
          type="number"
          step="0.1"
        />
      </div>
      <div>
        <Label className="mb-1" htmlFor="height">
          Estatura (cm)
        </Label>
        <Input
          id="height"
          name="height"
          value={datosPersonales.height}
          onChange={handlePersonalChange}
          className="border border-primary"
          type="number"
          step="0.1"
        />
      </div>

      {/* Contactos de emergencia */}
      <div className="col-span-2">
        <h3 className="text-lg font-semibold mb-4 text-primary">
          Contactos de emergencia *
        </h3>
        {datosPersonales.emergency_contacts.map((contact, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-primary rounded-lg"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Contacto {index + 1}</h4>
              {datosPersonales.emergency_contacts.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeEmergencyContact(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  Eliminar
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor={`contact-name-${index}`}>Nombre *</Label>
                <Input
                  id={`contact-name-${index}`}
                  value={contact.name}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, "name", e.target.value)
                  }
                  className="border border-primary"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`contact-relationship-${index}`}>
                  Parentesco *
                </Label>
                <Input
                  id={`contact-relationship-${index}`}
                  value={contact.relationship}
                  onChange={(e) =>
                    handleEmergencyContactChange(
                      index,
                      "relationship",
                      e.target.value
                    )
                  }
                  className="border border-primary"
                  placeholder="Ej: Madre, Padre, Tío"
                  required
                />
              </div>
              <div>
                <Label htmlFor={`contact-phone-${index}`}>Teléfono *</Label>
                <Input
                  id={`contact-phone-${index}`}
                  value={contact.phone}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, "phone", e.target.value)
                  }
                  className="border border-primary"
                  required
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addEmergencyContact}
          className="w-full"
        >
          + Agregar otro contacto de emergencia
        </Button>
      </div>
    </>
  );

  const camposPagina2 = (
    <>
      {/* Datos escolares */}
      <div>
        <Label className="mb-1" htmlFor="institution">
          Institución educativa *
        </Label>
        <Input
          id="institution"
          name="institution"
          value={datosEscolares.institution}
          onChange={handleSchoolChange}
          className="border border-primary"
          required
        />
      </div>
      <div>
        <Label className="mb-1" htmlFor="course">
          Curso actual *
        </Label>
        <Input
          id="course"
          name="course"
          value={datosEscolares.course}
          onChange={handleSchoolChange}
          className="border border-primary"
          required
        />
      </div>
      <div>
        <Label className="mb-1" htmlFor="calendar">
          Calendario
        </Label>
        <Input
          id="calendar"
          name="calendar"
          value={datosEscolares.calendar}
          onChange={handleSchoolChange}
          className="border border-primary"
        />
      </div>
      <div>
        <Label className="mb-1" htmlFor="shift">
          Jornada *
        </Label>
        <select
          id="shift"
          name="shift"
          value={datosEscolares.shift}
          onChange={handleSchoolChange}
          className="border border-primary rounded w-full h-10 px-2 bg-white"
          required
        >
          <option value="">Selecciona...</option>
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
          <option value="Noche">Noche</option>
          <option value="Completa">Completa</option>
        </select>
      </div>
    </>
  );

  const camposPagina3 = (
    <>
      {/* Pasatiempos */}
      <div>
        <Label className="mb-1" htmlFor="hobbies">
          Pasatiempos
        </Label>
        <Input
          id="hobbies"
          name="hobbies"
          value={datosPersonales.hobbies}
          onChange={handlePersonalChange}
          className="border border-primary"
        />
      </div>
      {/* Deportes */}
      <div>
        <Label className="mb-1" htmlFor="sports">
          Deportes
        </Label>
        <Input
          id="sports"
          name="sports"
          value={datosPersonales.sports}
          onChange={handlePersonalChange}
          className="border border-primary"
        />
      </div>
      {/* Instrumentos */}
      <div>
        <Label className="mb-1" htmlFor="instruments">
          Instrumentos
        </Label>
        <Input
          id="instruments"
          name="instruments"
          value={datosPersonales.instruments}
          onChange={handlePersonalChange}
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

  const getTituloPagina = () => {
    if (pagina === 1) return "Información personal";
    if (pagina === 2) return "Información escolar";
    return "Intereses y habilidades";
  };

  const totalPaginas = incluirDatosEscolares ? 3 : 2;
  const paginaActual = pagina > totalPaginas ? totalPaginas : pagina;
  const progreso = (paginaActual / totalPaginas) * 100;

  return (
    <div className="min-h-screen w-screen bg-background px-20 py-10">
      <div className="mb-10">
        <h1 className="text-2xl font-bold mb-10 text-left text-primary">
          Inscríbete
        </h1>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          Ingrese todos los datos requeridos en este formulario para enviar la
          solicitud de inscripción.
        </p>
      </div>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">{getTituloPagina()}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
          {getCamposPagina()}
          {/* Botones */}
          <div className="col-span-2 flex justify-between mt-6">
            {pagina === 1 ? (
              <Button
                variant="outline"
                type="button"
                className="px-10 py-6"
                onClick={() => navigate("/")}
              >
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

            <Button type="submit" className="px-10 py-6" disabled={loading}>
              {loading
                ? "Enviando..."
                : pagina === totalPaginas
                ? "Enviar"
                : "Continuar"}
            </Button>
          </div>
        </form>
        {/* Barra de progreso */}
        <div className="mt-8">
          <Progress className="h-2 rounded-full" value={progreso} />
        </div>
      </div>

      {/* Modal para preguntar sobre datos escolares */}
      <AlertDialog open={showSchoolDialog} onOpenChange={setShowSchoolDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Datos escolares</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Desea incluir información escolar en la inscripción?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleSchoolDialogResponse(false)}
            >
              No, continuar.
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSchoolDialogResponse(true)}>
              Sí, incluir.
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <h3 className="text-xl font-bold mb-4 text-green-700">
              ¡Solicitud enviada!
            </h3>
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
