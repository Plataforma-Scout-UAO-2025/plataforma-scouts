import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Save } from 'lucide-react';
import { medicalFormSchema } from '../schemas/CreateMedicalInfoForm.schema';
import type { MedicalFormData, MedicalFormErrors, VaccineDetail, MedicationDetail } from '../../../../../types/medical-form.type';
import type { Member } from '@/types/member.type';
import { useTenant } from '@/hooks/useTenant';
import api from '@/api/axios';
import axios from 'axios';
import { toast } from 'sonner';

interface MedicalWizardFormProps {
  memberId?: number; // Hacerlo opcional para creación
  onSubmit: (data: MedicalFormData) => void;
  onCancel?: () => void;
  initialData?: MedicalFormData;
}

export default function MedicalWizardForm({ memberId, onSubmit, onCancel, initialData }: MedicalWizardFormProps) {
  const tenantId = useTenant();

  const [formData, setFormData] = useState<MedicalFormData>({
    member_id: memberId || 0, // Valor por defecto 0 para creación
    blood_type: '',
    eps: '',
    allergies: '',
    chronic_diseases: '',
    physical_restrictions: '',
    surgical_history: '',
    vaccines_detail: [],
    medications_detail: [],
  });

  const [errors, setErrors] = useState<MedicalFormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number>(memberId || 0);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  // Cargar miembros si estamos en modo creación
  useEffect(() => {
    if (!initialData && !memberId) {
      loadMembers();
    }
  }, [initialData, memberId]);

  useEffect(() => {
    if (initialData) {
      const adaptedData = {
        ...initialData,
        vaccines_detail: initialData.vaccines_detail.map(vaccine => ({
          name: vaccine.name,
          date: vaccine.date.includes('T') ? vaccine.date : `${vaccine.date}T00:00:00.000Z`
        })),
        medications_detail: initialData.medications_detail.map(med => ({
          name: med.name,
          dose: med.dose || 'No especificada',
          frecuency: med.frecuency || 'No especificada'
        }))
      };

      setFormData(adaptedData);
    }
  }, [initialData, memberId, tenantId]);

  // Cargar lista de miembros desde la API
  const loadMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await api.get('/members/list_members');

      // Filtrar solo miembros aprobados y activos
      const scoutMembers = response.data.filter((member: Member) => 
      member.role === 'SCOUT' && 
      member.status === 'APPROVED' && 
      member.is_active !== false
      );

      setMembers(scoutMembers);
    } catch (error) {
      console.error('Error cargando miembros:', error);
      toast.error('Error al cargar la lista de miembros');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  // Función para crear nuevo registro médico
  const createMedicalRecord = async (data: MedicalFormData) => {
    try {
      setIsSubmitting(true);

      if (!tenantId) {
        throw new Error('No se encontró el tenant ID');
      }

      if (!selectedMemberId) {
        throw new Error('Debe seleccionar un miembro');
      }

      // Preparar payload en snake_case (como espera el endpoint)
      const payload = {
        blood_type: data.blood_type,
        eps: data.eps,
        allergies: data.allergies,
        chronic_diseases: data.chronic_diseases,
        physical_restrictions: data.physical_restrictions,
        surgical_history: data.surgical_history,
        active: true,
        medications_detail: data.medications_detail.map(med => ({
          name: med.name,
          frequency: med.frecuency
        })),
        vaccines_detail: data.vaccines_detail.map(vaccine => ({
          name: vaccine.name,
          applied_at: vaccine.date.includes('T') ? vaccine.date : `${vaccine.date}T00:00:00.000Z`
        }))
      };

      const response = await api.post(
        `http://localhost:8080/api/v1/medical_record/create_record/${selectedMemberId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ CREATE - Error:', error);

      if (axios.isAxiosError(error)) {
        console.error('❌ CREATE - Detalles Axios:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        throw new Error(error.response?.data?.message || `Error ${error.response?.status}` || 'Error del servidor');
      }

      throw new Error('Error desconocido al crear el registro médico');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMedicalRecord = async (data: MedicalFormData) => {
    try {
      setIsSubmitting(true);

      if (!tenantId) {
        throw new Error('No se encontró el tenant ID');
      }

      if (!memberId) {
        throw new Error('No se encontró el member ID');
      }

      const payload = {
        blood_type: data.blood_type,
        eps: data.eps,
        allergies: data.allergies,
        chronic_diseases: data.chronic_diseases,
        physical_restrictions: data.physical_restrictions,
        surgical_history: data.surgical_history,
        active: true,
        medications_detail: data.medications_detail.map(med => ({
          name: med.name,
          frequency: med.frecuency
        })),
        vaccines_detail: data.vaccines_detail.map(vaccine => ({
          name: vaccine.name,
          applied_at: vaccine.date.includes('T') ? vaccine.date : `${vaccine.date}T00:00:00.000Z`
        }))
      };

      const response = await api.put(
        `http://localhost:8080/api/v1/medical_record/update_record/${memberId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant-Id': tenantId
          },
        }
      );

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Error del servidor: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ UPDATE - Error:', error);

      if (axios.isAxiosError(error)) {
        console.error('❌ UPDATE - Detalles Axios:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        throw new Error(error.response?.data?.message || `Error ${error.response?.status}` || 'Error del servidor');
      }

      throw new Error('Error desconocido al actualizar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAlergiaComun = (alergia: string) => {
    setFormData(prev => {
      const currentAllergies = prev.allergies
        ? prev.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
        : [];

      if (currentAllergies.includes(alergia)) {
        const newAllergies = currentAllergies.filter(a => a !== alergia);
        return { ...prev, allergies: newAllergies.join(', ') };
      }

      return { ...prev, allergies: [...currentAllergies, alergia].join(', ') };
    });
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const commonVaccines = ['COVID-19 (Pfizer)', 'COVID-19 (Moderna)', 'Influenza', 'Tétanos', 'Hepatitis B', 'Fiebre Amarilla'];

  const handleInputChange = (field: keyof MedicalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleMemberChange = (newMemberId: number) => {
    setSelectedMemberId(newMemberId);
    setFormData(prev => ({ ...prev, member_id: newMemberId }));
  };

  const addVaccine = () => {
    setFormData(prev => ({
      ...prev,
      vaccines_detail: [...prev.vaccines_detail, { name: '', date: new Date().toISOString() }]
    }));
  };

  const updateVaccine = (index: number, field: keyof VaccineDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      vaccines_detail: prev.vaccines_detail.map((vaccine, i) =>
        i === index ? { ...vaccine, [field]: value } : vaccine
      )
    }));
  };

  const removeVaccine = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vaccines_detail: prev.vaccines_detail.filter((_, i) => i !== index)
    }));
  };

  const addCommonVaccine = (vaccineName: string) => {
    setFormData(prev => ({
      ...prev,
      vaccines_detail: [...prev.vaccines_detail, {
        name: vaccineName,
        date: new Date().toISOString()
      }]
    }));
  };

  const addMedication = () => {
    setFormData(prev => ({
      ...prev,
      medications_detail: [...prev.medications_detail, { name: '', dose: '', frecuency: '' }]
    }));
  };

  const updateMedication = (index: number, field: keyof MedicationDetail, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications_detail: prev.medications_detail.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications_detail: prev.medications_detail.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (data: MedicalFormData) => {
    const result = medicalFormSchema.safeParse(data);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: MedicalFormErrors = {};
      result.error.issues.forEach((issue) => {
        if (issue.path && issue.path.length > 0) {
          const fieldName = issue.path[0] as string;
          newErrors[fieldName] = issue.message;
        }
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      if (initialData) {
        // Modo edición
        await updateMedicalRecord(formData);
        toast.success('Información médica actualizada exitosamente');
      } else {
        // Modo creación
        await createMedicalRecord(formData);
        toast.success('Información médica creada exitosamente');
      }

      onSubmit(formData);
    } catch (error) {
      console.error('❌ SUBMIT - Error general:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al guardar');
      }
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    // En modo creación, verificar que se haya seleccionado un miembro
    if (!initialData && currentStep === 0 && !selectedMemberId) {
      return false;
    }

    switch (currentStep) {
      case 0:
        return formData.eps.trim() !== '' && formData.blood_type !== '';
      case 1:
        return true;
      case 2:
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const steps = [
    { id: 'basica', title: 'Información Básica', completed: false },
    { id: 'medica', title: 'Información Médica', completed: false },
    { id: 'vacunas', title: 'Vacunas', completed: false },
    { id: 'medicamentos', title: 'Medicamentos', completed: false }
  ];

  const alergiasComunes = [
    'Penicilina', 'Aspirina', 'Mariscos', 'Nueces', 'Huevos', 'Leche',
    'Soja', 'Trigo', 'Polen', 'Ácaros', 'Mascotas', 'Picaduras de insectos'
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-background p-6 rounded-lg">
          <h1 className="text-2xl font-bold">
            {initialData ? 'Editar' : 'Nueva'} Información Médica
          </h1>
          <p className="text-muted-foreground">
            {initialData
              ? 'Actualice la información médica del integrante.'
              : 'Complete la información médica del integrante.'
            }
          </p>
        </div>

        <div className="bg-background rounded-lg shadow-sm border p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2 ${index < currentStep
                    ? 'bg-green-500 text-white'
                    : index === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-accent text-accent-foreground'
                    }`}>
                    {index < currentStep ? '✓' : index + 1}
                  </div>
                  <span className={`text-xs text-center ${index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <div className="w-full bg-accent rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>

          {currentStep === 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Básica</h2>
              <div className="space-y-4">
                {/* Selector de miembro solo en modo creación */}
                {!initialData && (
                  <div className="space-y-2">
                    <Label htmlFor="member" className="font-medium">Seleccionar Integrante *</Label>
                    <Select
                      value={selectedMemberId.toString()}
                      onValueChange={(value) => handleMemberChange(parseInt(value))}
                      disabled={isLoadingMembers}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingMembers ? "Cargando miembros..." : "Seleccione un integrante"} />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map(member => (
                          <SelectItem key={member.member_id} value={member.member_id?.toString() || ""}>
                            {member.first_name} {member.last_name} - ID {member.identification} ({member.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!selectedMemberId && (
                      <p className="text-sm text-red-500">Debe seleccionar un integrante</p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eps">EPS *</Label>
                    <input
                      id="eps"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.eps ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Ingrese la EPS del Integrante"
                      value={formData.eps}
                      onChange={(e) => handleInputChange('eps', e.target.value)}
                      maxLength={50}
                    />
                    {errors.eps && <p className="text-sm text-red-500">{errors.eps}</p>}
                    <p className="text-xs text-gray-500">{formData.eps.length}/50 caracteres</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_type" className="font-medium">Tipo de Sangre *</Label>
                    <Select
                      value={formData.blood_type}
                      onValueChange={(value) => handleInputChange('blood_type', value)}
                    >
                      <SelectTrigger className={`w-full ${errors.blood_type ? 'border-red-500' : 'border-gray-300'}`}>
                        <SelectValue placeholder="Seleccione tipo de sangre" />
                      </SelectTrigger>
                      <SelectContent>
                        {bloodTypes.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.blood_type && <p className="text-sm text-red-500">{errors.blood_type}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* El resto del componente se mantiene igual */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Médica Detallada</h2>
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="font-medium">Alergias</Label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Lista de alergias separadas por comas"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    rows={2}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">{formData.allergies.length}/1000 caracteres</p>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Alergias comunes:</Label>
                    <div className="flex flex-wrap gap-2">
                      {alergiasComunes.map(alergia => {
                        const currentAllergies = formData.allergies
                          ? formData.allergies.split(',').map(a => a.trim()).filter(a => a.length > 0)
                          : [];
                        const isSelected = currentAllergies.includes(alergia);

                        return (
                          <span
                            key={alergia}
                            className={`px-2 py-1 rounded-md text-sm cursor-pointer border ${isSelected
                              ? 'bg-primary text-white'
                              : 'bg-accent text-gray-700 hover:bg-accent/70'
                              }`}
                            onClick={() => addAlergiaComun(alergia)}
                          >
                            {alergia} {isSelected ? '✓' : '+'}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chronic_diseases" className="font-medium">Enfermedades Crónicas</Label>
                  <textarea
                    id="chronic_diseases"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describa cualquier enfermedad crónica..."
                    value={formData.chronic_diseases}
                    onChange={(e) => handleInputChange('chronic_diseases', e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">{formData.chronic_diseases.length}/1000 caracteres</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physical_restrictions" className="font-medium">Restricciones Físicas</Label>
                  <textarea
                    id="physical_restrictions"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describa cualquier restricción física..."
                    value={formData.physical_restrictions}
                    onChange={(e) => handleInputChange('physical_restrictions', e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">{formData.physical_restrictions.length}/1000 caracteres</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surgical_history" className="font-medium">Antecedentes Quirúrgicos</Label>
                  <textarea
                    id="surgical_history"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describa cualquier cirugía previa..."
                    value={formData.surgical_history}
                    onChange={(e) => handleInputChange('surgical_history', e.target.value)}
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500">{formData.surgical_history.length}/1000 caracteres</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Vacunas</h2>
              <p className="text-gray-600 mb-4">
                Registre todas las vacunas que ha recibido el integrante.
              </p>

              <div className="space-y-4 mb-6">
                <Label className="font-medium">Vacunas Comunes:</Label>
                <div className="flex flex-wrap gap-2">
                  {commonVaccines.map(vaccine => (
                    <span
                      key={vaccine}
                      className="px-3 py-1 bg-accent text-gray-700 rounded-md text-sm cursor-pointer hover:bg-accent/70 border"
                      onClick={() => addCommonVaccine(vaccine)}
                    >
                      {vaccine} +
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {formData.vaccines_detail.map((vaccine, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="font-medium">Vacuna {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => removeVaccine(index)}
                        className="text-gray-500 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="font-medium">Nombre *</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nombre de la vacuna"
                          value={vaccine.name}
                          onChange={(e) => updateVaccine(index, 'name', e.target.value)}
                          maxLength={50}
                        />
                        <p className="text-xs text-gray-500">{vaccine.name.length}/50 caracteres</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Fecha *</Label>
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          value={vaccine.date.slice(0, 16)}
                          onChange={(e) => updateVaccine(index, 'date', new Date(e.target.value).toISOString())}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addVaccine}
                  className="border border-gray-300 rounded w-full p-3 hover:bg-accent flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Vacuna
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicamentos Actuales</h2>
              <p className="text-gray-600 mb-4">
                Registre todos los medicamentos que toma actualmente el integrante.
              </p>
              <div className="space-y-4">
                {formData.medications_detail.map((medication, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="font-medium">Medicamento {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-gray-500 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="font-medium">Nombre *</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nombre del medicamento"
                          value={medication.name}
                          onChange={(e) => updateMedication(index, 'name', e.target.value)}
                          maxLength={50}
                        />
                        <p className="text-xs text-gray-500">{medication.name.length}/50 caracteres</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Dosis *</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ej: 50 mg"
                          value={medication.dose}
                          onChange={(e) => updateMedication(index, 'dose', e.target.value)}
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500">{medication.dose.length}/100 caracteres</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Frecuencia *</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ej: 2 veces al día"
                          value={medication.frecuency}
                          onChange={(e) => updateMedication(index, 'frecuency', e.target.value)}
                          maxLength={100}
                        />
                        <p className="text-xs text-gray-500">{medication.frecuency.length}/100 caracteres</p>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMedication}
                  className="border border-gray-300 rounded w-full p-3 hover:bg-accent flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Medicamento
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="border border-gray-300 px-6 py-2 rounded-md hover:bg-accent flex items-center"
                >
                  <X className="h-4 w-4 mr-4" /> Cancelar
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0 || isSubmitting}
                className={`border border-gray-300 px-6 py-2 rounded-md ${currentStep === 0 || isSubmitting
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent'
                  }`}
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed() || isSubmitting}
                className={`px-6 py-2 rounded-md flex items-center ${canProceed() && !isSubmitting
                  ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
                  : 'bg-accent text-accent-foreground cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {initialData ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : currentStep === steps.length - 1 ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {initialData ? 'Actualizar' : 'Crear'}
                  </>
                ) : (
                  <>
                    Siguiente
                    <span className="ml-2">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}