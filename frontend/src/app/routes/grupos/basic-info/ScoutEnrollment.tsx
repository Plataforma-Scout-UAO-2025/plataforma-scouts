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
import type {
  PersonalData,
  SchoolData,
  CreateMemberRequest,
  CreateMemberWithSchoolRequest,
  ChangeEvent,
  EmergencyContactField,
} from "@/models/types/enrollment.type";
import { createMember, createMemberWithSchool } from "@/api/membersApi";
import { transformarDatos } from "./utils/enrollment.utils";

function ScoutEnrollment() {
  const navigate = useNavigate();
  const [datosPersonales, setDatosPersonales] = useState<PersonalData>({
    firstname: "",
    lastname: "",
    email: "",
    confirm_email: "",
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
    group: "",
    emergency_contacts: [{ name: "", relationship: "", phone: "" }],
  });

  const [datosEscolares, setDatosEscolares] = useState<SchoolData>({
    institution: "",
    course: "",
    calendar: "",
    shift: "",
  });

  const [pagina, setPagina] = useState<number>(1);
  const [showSchoolDialog, setShowSchoolDialog] = useState<boolean>(false);
  const [incluirDatosEscolares, setIncluirDatosEscolares] =
    useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handlePersonalChange = (e: ChangeEvent): void => {
    const { name, value } = e.target;
    setDatosPersonales((prev) => ({ ...prev, [name]: value }));
  };

  const handleSchoolChange = (e: ChangeEvent): void => {
    const { name, value } = e.target;
    setDatosEscolares((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmergencyContactChange = (
    index: number,
    field: EmergencyContactField,
    value: string
  ): void => {
    setDatosPersonales((prev) => {
      const newContacts = [...prev.emergency_contacts];
      newContacts[index] = { ...newContacts[index], [field]: value };
      return { ...prev, emergency_contacts: newContacts };
    });
  };

  const addEmergencyContact = (): void => {
    setDatosPersonales((prev) => ({
      ...prev,
      emergency_contacts: [
        ...prev.emergency_contacts,
        { name: "", relationship: "", phone: "" },
      ],
    }));
  };

  const removeEmergencyContact = (index: number): void => {
    if (datosPersonales.emergency_contacts.length > 1) {
      setDatosPersonales((prev) => ({
        ...prev,
        emergency_contacts: prev.emergency_contacts.filter(
          (_, i) => i !== index
        ),
      }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Página 1 pasa a intereses
    if (pagina === 1) {
      if (datosPersonales.email !== datosPersonales.confirm_email) {
        alert("Los correos electrónicos no coinciden");
        return;
      }
      setPagina(2);
      return;
    }

    if (pagina === 2) {
      setShowSchoolDialog(true);
      return;
    }

    await enviarDatos();
  };

  const enviarDatos = async (): Promise<void> => {
    setLoading(true);
    try {
      const memberData: CreateMemberRequest = transformarDatos(datosPersonales);

      if (
        incluirDatosEscolares &&
        (datosEscolares.institution || datosEscolares.course)
      ) {
        // Crear miembro con datos escolares en una sola petición
        const requestData: CreateMemberWithSchoolRequest = {
          member: memberData,
          school: datosEscolares,
        };
        await createMemberWithSchool(requestData);
      } else {
        // Crear solo el miembro
        await createMember(memberData);
      }

      setShowModal(true);
    } catch (error) {
      alert(
        "Error al enviar la solicitud: " +
          (error instanceof Error ? error.message : "Error desconocido")
      );
    } finally {
      setLoading(false);
    }
  };
  const handleSchoolDialogResponse = (incluir: boolean): void => {
    setIncluirDatosEscolares(incluir);
    setShowSchoolDialog(false);
    if (incluir) {
      setPagina(3);
    } else {
      // Si no incluye, envía directamente
      enviarDatos();
    }
  };

  // Página 1: Datos personales
  const camposPagina1 = (
    <>
      <div className="w-full">
        <Label htmlFor="firstname">Nombres *</Label>
        <Input
          id="firstname"
          name="firstname"
          value={datosPersonales.firstname}
          onChange={handlePersonalChange}
          placeholder="Ej: Juan Carlos"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="lastname">Apellidos *</Label>
        <Input
          id="lastname"
          name="lastname"
          value={datosPersonales.lastname}
          onChange={handlePersonalChange}
          placeholder="Ej: Pérez García"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="email">Correo electrónico *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={datosPersonales.email}
          onChange={handlePersonalChange}
          placeholder="ejemplo@correo.com"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="confirm_email">Confirmar correo *</Label>
        <Input
          id="confirm_email"
          name="confirm_email"
          type="email"
          value={datosPersonales.confirm_email}
          onChange={handlePersonalChange}
          placeholder="ejemplo@correo.com"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="document_type">Tipo de documento *</Label>
        <select
          id="document_type"
          name="document_type"
          value={datosPersonales.document_type}
          onChange={handlePersonalChange}
          className="w-full border border-input rounded-md h-10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          required
        >
          <option value="">Selecciona un tipo...</option>
          <option value="CC">Cédula de Ciudadanía</option>
          <option value="TI">Tarjeta de Identidad</option>
          <option value="CE">Cédula de Extranjería</option>
        </select>
      </div>
      <div className="w-full">
        <Label htmlFor="identification">Número de documento *</Label>
        <Input
          id="identification"
          name="identification"
          value={datosPersonales.identification}
          onChange={handlePersonalChange}
          placeholder="1234567890"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="birth_date">Fecha de nacimiento *</Label>
        <Input
          id="birth_date"
          name="birth_date"
          type="date"
          value={datosPersonales.birth_date}
          onChange={handlePersonalChange}
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="gender">Género *</Label>
        <select
          id="gender"
          name="gender"
          value={datosPersonales.gender}
          onChange={handlePersonalChange}
          className="w-full border border-input rounded-md h-10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          required
        >
          <option value="">Selecciona una opción...</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
        </select>
      </div>
      <div className="w-full">
        <Label htmlFor="address">Dirección *</Label>
        <Input
          id="address"
          name="address"
          value={datosPersonales.address}
          onChange={handlePersonalChange}
          placeholder="Calle 12 #34-56"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="phone">Teléfono *</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          value={datosPersonales.phone}
          onChange={handlePersonalChange}
          placeholder="3001234567"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          name="weight"
          value={datosPersonales.weight}
          onChange={handlePersonalChange}
          placeholder="65"
          className="w-full"
        />
      </div>
      <div className="w-full">
        <Label htmlFor="height">Altura (cm)</Label>
        <Input
          id="height"
          name="height"
          value={datosPersonales.height}
          onChange={handlePersonalChange}
          placeholder="170"
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="group">Grupo scout *</Label>
        <select
          id="group"
          name="group"
          value={datosPersonales.group}
          onChange={handlePersonalChange}
          className="w-full border border-input rounded-md h-10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          required
        >
          <option value="">Selecciona un grupo...</option>
          <option value="Centinelas 113">Centinelas 113</option>
          <option value="803 Chiminigagua">803 Chiminigagua</option>
        </select>
      </div>

      {/* Contactos de emergencia */}
      <div className="col-span-full mt-4">
        <h3 className="text-lg font-semibold mb-3">
          Contactos de emergencia *
        </h3>
        {datosPersonales.emergency_contacts.map((contact, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg"
          >
            <div className="w-full">
              <Label htmlFor={`contact_name_${index}`}>Nombre</Label>
              <Input
                id={`contact_name_${index}`}
                value={contact.name}
                onChange={(e) =>
                  handleEmergencyContactChange(index, "name", e.target.value)
                }
                placeholder="María González"
                className="w-full"
                required
              />
            </div>
            <div className="w-full">
              <Label htmlFor={`contact_relationship_${index}`}>
                Parentesco
              </Label>
              <Input
                id={`contact_relationship_${index}`}
                value={contact.relationship}
                onChange={(e) =>
                  handleEmergencyContactChange(
                    index,
                    "relationship",
                    e.target.value
                  )
                }
                placeholder="Madre, Padre, Hermano/a..."
                className="w-full"
                required
              />
            </div>
            <div className="w-full">
              <Label htmlFor={`contact_phone_${index}`}>Teléfono</Label>
              <div className="flex gap-2 w-full">
                <Input
                  id={`contact_phone_${index}`}
                  type="tel"
                  value={contact.phone}
                  onChange={(e) =>
                    handleEmergencyContactChange(index, "phone", e.target.value)
                  }
                  placeholder="3009876543"
                  className="flex-1"
                  required
                />
                {datosPersonales.emergency_contacts.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeEmergencyContact(index)}
                    className="shrink-0"
                  >
                    X
                  </Button>
                )}
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
          + Agregar contacto
        </Button>
      </div>
    </>
  );

  // Página 2: Intereses y habilidades
  const camposPagina2 = (
    <>
      <div className="col-span-full w-full">
        <Label htmlFor="hobbies">Pasatiempos</Label>
        <Input
          id="hobbies"
          name="hobbies"
          value={datosPersonales.hobbies}
          onChange={handlePersonalChange}
          placeholder="Lectura, videojuegos, pintura..."
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="sports">Deportes</Label>
        <Input
          id="sports"
          name="sports"
          value={datosPersonales.sports}
          onChange={handlePersonalChange}
          placeholder="Fútbol, natación, ciclismo..."
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="instruments">Instrumentos musicales</Label>
        <Input
          id="instruments"
          name="instruments"
          value={datosPersonales.instruments}
          onChange={handlePersonalChange}
          placeholder="Guitarra, piano, flauta..."
          className="w-full"
        />
      </div>
    </>
  );

  // Página 3: Datos escolares
  const camposPagina3 = (
    <>
      <div className="col-span-full w-full">
        <Label htmlFor="institution">Institución educativa *</Label>
        <Input
          id="institution"
          name="institution"
          value={datosEscolares.institution}
          onChange={handleSchoolChange}
          placeholder="Nombre de la institución"
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="course">Curso/Grado actual *</Label>
        <Input
          id="course"
          name="course"
          value={datosEscolares.course}
          onChange={handleSchoolChange}
          placeholder="9, 10, 11..."
          className="w-full"
          required
        />
      </div>
      <div className="w-full">
        <Label htmlFor="calendar">Calendario</Label>
        <Input
          id="calendar"
          name="calendar"
          value={datosEscolares.calendar}
          onChange={handleSchoolChange}
          placeholder="A o B"
          className="w-full"
        />
      </div>
      <div className="col-span-full w-full">
        <Label htmlFor="shift">Jornada *</Label>
        <select
          id="shift"
          name="shift"
          value={datosEscolares.shift}
          onChange={handleSchoolChange}
          className="w-full border border-input rounded-md h-10 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ring"
          required
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

  const getCamposPagina = () => {
    if (pagina === 1) return camposPagina1;
    if (pagina === 2) return camposPagina2;
    return camposPagina3;
  };

  const getTituloPagina = () => {
    if (pagina === 1) return "Información personal";
    if (pagina === 2) return "Intereses y habilidades";
    return "Datos escolares";
  };

  const totalPaginas = incluirDatosEscolares ? 3 : 2;
  const progreso = (pagina / totalPaginas) * 100;

  return (
    <div className="min-h-screen bg-background px-4 md:px-20 py-10">
      <h1 className="text-2xl font-bold text-primary mb-8">
        Inscríbete al grupo scout
      </h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto"
      >
        <h2 className="col-span-full text-xl font-semibold mb-4">
          {getTituloPagina()}
        </h2>

        {getCamposPagina()}

        <div className="col-span-full flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              pagina > 1 ? setPagina((p) => p - 1) : navigate("/")
            }
          >
            {pagina > 1 ? "Atrás" : "Cancelar"}
          </Button>

          <Button type="submit" disabled={loading}>
            {loading
              ? "Enviando..."
              : pagina === totalPaginas
              ? "Enviar"
              : "Continuar"}
          </Button>
        </div>
      </form>

      <div className="mt-8 max-w-4xl mx-auto">
        <Progress value={progreso} className="h-2 rounded-full" />
        <p className="text-sm text-gray-600 mt-2 text-center">
          Página {pagina} de {totalPaginas}
        </p>
      </div>

      {/* Diálogo para decidir si incluir datos escolares */}
      <AlertDialog open={showSchoolDialog} onOpenChange={setShowSchoolDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Deseas incluir información escolar?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estos datos son opcionales pero nos ayudan a conocer mejor al
              scout. Puedes agregarlos ahora o más adelante.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => handleSchoolDialogResponse(false)}
            >
              No, enviar ahora
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSchoolDialogResponse(true)}>
              Sí, incluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-primary">
              ¡Solicitud enviada con éxito!
            </h3>
            <p className="mb-6 text-gray-700">
              Un encargado revisará tu solicitud y se comunicará contigo pronto.
            </p>
            <Button className="w-full" onClick={() => navigate("/")}>
              Volver al inicio
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoutEnrollment;
