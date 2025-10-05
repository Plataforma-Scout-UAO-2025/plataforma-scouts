import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Plus, X, Upload, Save, FileText, CheckCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Interfaces
interface Medicamento {
  nombre: string;
  dosis: string;
  frecuencia: string;
}

interface FormData {
  eps: string;
  certificadoEPS: File | null;
  certificadoEPSName: string;
  rh: string;
  colegio: string;
  jornada: string;
  tipoSangre: string;
  alergias: string[];
  nuevaAlergia: string;
  enfermedadesCronicas: string;
  restriccionesFisicas: string;
  medicamentos: Medicamento[];
  antecedenteQuirurgico: string;
  vacunas: string[];
  autorizacionEmergencia: boolean;
  consentimientoTransporte: boolean;
  firmaPadre: string;
}

interface Errors {
  [key: string]: string | null;
}

export default function MedicalWizardForm() {
  const [formData, setFormData] = useState<FormData>({
    eps: '',
    certificadoEPS: null,
    certificadoEPSName: '',
    rh: '',
    colegio: '',
    jornada: '',
    tipoSangre: '',
    alergias: [],
    nuevaAlergia: '',
    enfermedadesCronicas: '',
    restriccionesFisicas: '',
    medicamentos: [],
    antecedenteQuirurgico: '',
    vacunas: [],
    autorizacionEmergencia: false,
    consentimientoTransporte: false,
    firmaPadre: ''
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'basica', title: 'Información Básica', completed: false },
    { id: 'medica', title: 'Información Médica', completed: false },
    { id: 'medicamentos', title: 'Medicamentos', completed: false },
    { id: 'consentimientos', title: 'Consentimientos', completed: false }
  ];

  const tiposSangre = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const alergiasCommunas = [
    'Penicilina', 'Aspirina', 'Mariscos', 'Nueces', 'Huevos', 'Leche',
    'Soja', 'Trigo', 'Polen', 'Ácaros', 'Mascotas', 'Picaduras de insectos'
  ];

  const vacunasComunes = [
    'Hepatitis A', 'Hepatitis B', 'Tétanos', 'Fiebre Amarilla',
    'Meningococo', 'Neumococo', 'Influenza', 'COVID-19', 'Varicela', 'Sarampión'
  ];

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, field: keyof FormData) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos PDF, JPG, JPEG o PNG');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no puede ser mayor a 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [field]: file,
        [`${String(field)}Name`]: file.name
      }));

      setIsModalOpen(false);
    }
  };

  const removeFile = (field: keyof FormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: null,
      [`${String(field)}Name`]: ''
    }));
  };

  const addAlergia = () => {
    if (formData.nuevaAlergia.trim()) {
      setFormData(prev => ({
        ...prev,
        alergias: [...prev.alergias, formData.nuevaAlergia.trim()],
        nuevaAlergia: ''
      }));
    }
  };

  const removeAlergia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      alergias: prev.alergias.filter((_, i) => i !== index)
    }));
  };

  const addMedicamento = () => {
    setFormData(prev => ({
      ...prev,
      medicamentos: [...prev.medicamentos, { nombre: '', dosis: '', frecuencia: '' }]
    }));
  };

  const updateMedicamento = (index: number, field: keyof Medicamento, value: string) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedicamento = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicamentos: prev.medicamentos.filter((_, i) => i !== index)
    }));
  };

  const toggleVacuna = (vacuna: string) => {
    setFormData(prev => ({
      ...prev,
      vacunas: prev.vacunas.includes(vacuna)
        ? prev.vacunas.filter(v => v !== vacuna)
        : [...prev.vacunas, vacuna]
    }));
  };

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.eps.trim()) newErrors.eps = 'EPS es requerida';
    if (!formData.tipoSangre) newErrors.tipoSangre = 'Tipo de sangre es requerido';
    if (!formData.autorizacionEmergencia) newErrors.autorizacionEmergencia = 'Autorización requerida';
    if (!formData.consentimientoTransporte) newErrors.consentimientoTransporte = 'Consentimiento requerido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Formulario válido:', formData);
      alert('Información médica guardada correctamente');
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
    switch (currentStep) {
      case 0:
        return formData.eps.trim() !== '';
      case 1:
        return formData.tipoSangre !== '';
      case 2:
        return true;
      case 3:
        return formData.autorizacionEmergencia && formData.consentimientoTransporte;
      default:
        return true;
    }
  };



  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="bg-background p-6 rounded-lg ">
          <h1 className="custom-title text-2xl">Información Médica</h1>
          <p className="text-muted-foreground">
            Complete la información médica del integrante para garantizar su seguridad durante las actividades scout.
          </p>
        </div>

        <div className="bg-background rounded-lg shadow-sm border p-6">
          {/* Barra de progreso */}
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
                  <span className={`text-xs text-center ${index === currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal y de Contacto</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eps">EPS *</Label>
                    <input
                      id="eps"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${errors.eps ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Ingrese la EPS del Integrante"
                      value={formData.eps}
                      onChange={(e) => handleInputChange('eps', e.target.value)}
                    />
                    {errors.eps && <p className="text-sm text-red-500">{errors.eps}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rh">RH</Label>
                    <input
                      id="rh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Ingrese RH"
                      value={formData.rh}
                      onChange={(e) => handleInputChange('rh', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Certificado</Label>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                      <DialogTrigger asChild>
                        <button className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover flex items-center justify-center">
                          <Upload className="h-4 w-4 mr-2" />
                          Subir Archivo
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md ">
                        <DialogHeader>
                          <DialogTitle className="text-gray-900 font-semibold">Subir Certificado EPS</DialogTitle>
                          <DialogDescription>
                            Seleccione el certificado de afiliación a la EPS del integrante
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {!formData.certificadoEPS ? (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-sm text-gray-600 mb-2">
                                Arrastre y suelte su archivo aquí o haga clic para seleccionar
                              </p>
                              <p className="text-xs text-gray-500 mb-4">
                                Formatos permitidos: PDF, JPG, PNG (máx. 5MB)
                              </p>
                              <input
                                type="file"
                                id="certificadoEPSModal"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handleFileUpload(e, 'certificadoEPS')}
                              />
                              <button
                                type="button"
                                className="border border-gray-300 rounded px-4 py-2 hover:bg-gray-50 flex items-center mx-auto"
                                onClick={() => document.getElementById('certificadoEPSModal')?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Seleccionar Archivo
                              </button>
                            </div>
                          ) : (
                            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <CheckCircle className="h-6 w-6 text-green-600" />
                                  <div>
                                    <p className="text-sm font-medium text-green-800">
                                      Archivo subido correctamente
                                    </p>
                                    <p className="text-xs text-green-600">
                                      {formData.certificadoEPSName}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile('certificadoEPS')}
                                  className="text-red-600 hover:text-red-800 p-1 rounded"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {formData.certificadoEPS && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {formData.certificadoEPSName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="colegio">Colegio</Label>
                  <input
                    id="colegio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ingrese el colegio del integrante"
                    value={formData.colegio}
                    onChange={(e) => handleInputChange('colegio', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jornada">Jornada</Label>
                  <input
                    id="jornada"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Ingrese la jornada del integrante"
                    value={formData.jornada}
                    onChange={(e) => handleInputChange('jornada', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Médica Detallada</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="tipoSangre" className="font-medium">Tipo de Sangre *</Label>
                  <Select value={formData.tipoSangre} onValueChange={(value) => handleInputChange('tipoSangre', value)}>
                    <SelectTrigger className={`w-full ${errors.tipoSangre ? 'border-red-500' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Seleccione tipo de sangre" />
                    </SelectTrigger>
                    <SelectContent className="">
                      {tiposSangre.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.tipoSangre && <p className="text-sm text-red-500">{errors.tipoSangre}</p>}
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="space-y-4">
                  <Label className="font-medium">Alergias</Label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Agregar nueva alergia"
                      value={formData.nuevaAlergia}
                      onChange={(e) => handleInputChange('nuevaAlergia', e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAlergia())}
                    />
                    <button type="button" onClick={addAlergia} className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-500">Alergias comunes:</Label>
                    <div className="flex flex-wrap gap-2">
                      {alergiasCommunas.map(alergia => (
                        <span
                          key={alergia}
                          className="px-2 py-1 bg-accent text-gray-700 rounded-md text-sm cursor-pointer hover:bg-accent/70 border"
                          onClick={() => {
                            if (!formData.alergias.includes(alergia)) {
                              setFormData(prev => ({
                                ...prev,
                                alergias: [...prev.alergias, alergia]
                              }));
                            }
                          }}
                        >
                          {alergia}
                        </span>
                      ))}
                    </div>
                  </div>

                  {formData.alergias.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Alergias registradas:</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.alergias.map((alergia, index) => (
                          <span key={index} className="px-2 py-1 bg-accent-foreground/70 text-white rounded-md text-sm flex items-center gap-1">
                            {alergia}
                            <X
                              className="h-3 w-3 cursor-pointer hover:text-red-900"
                              onClick={() => removeAlergia(index)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="space-y-2">
                  <Label htmlFor="enfermedadesCronicas" className="font-medium">Enfermedades Crónicas</Label>
                  <textarea
                    id="enfermedadesCronicas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primaryresize-none"
                    placeholder="Describa cualquier enfermedad crónica..."
                    value={formData.enfermedadesCronicas}
                    onChange={(e) => handleInputChange('enfermedadesCronicas', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restriccionesFisicas" className="font-medium">Restricciones Físicas</Label>
                  <textarea
                    id="restriccionesFisicas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describa cualquier restricción física..."
                    value={formData.restriccionesFisicas}
                    onChange={(e) => handleInputChange('restriccionesFisicas', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="antecedenteQuirurgico" className="font-medium">Antecedentes Quirúrgicos</Label>
                  <textarea
                    id="antecedenteQuirurgico"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    placeholder="Describa cualquier cirugía previa..."
                    value={formData.antecedenteQuirurgico}
                    onChange={(e) => handleInputChange('antecedenteQuirurgico', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="space-y-4">
                  <Label className="font-medium">Vacunas</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {vacunasComunes.map(vacuna => (
                      <div key={vacuna} className="flex items-center space-x-2">
                        <Checkbox
                          id={vacuna}
                          checked={formData.vacunas.includes(vacuna)}
                          onCheckedChange={() => toggleVacuna(vacuna)}
                        />
                        <Label htmlFor={vacuna} className="text-sm">{vacuna}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medicamentos Actuales</h2>
              <p className="text-gray-600 mb-4">
                Registre todos los medicamentos que toma actualmente el integrante.
              </p>
              <div className="space-y-4">
                {formData.medicamentos.map((medicamento, index) => (
                  <div key={index} className=" border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <Label className="font-medium">Medicamento {index + 1}</Label>
                      <button
                        type="button"
                        onClick={() => removeMedicamento(index)}
                        className="text-gray-500 hover:text-red-500 p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="font-medium">Nombre</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Nombre del medicamento"
                          value={medicamento.nombre}
                          onChange={(e) => updateMedicamento(index, 'nombre', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Dosis</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ej: 500mg"
                          value={medicamento.dosis}
                          onChange={(e) => updateMedicamento(index, 'dosis', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-medium">Frecuencia</Label>
                        <input
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="ej: Cada 8 horas"
                          value={medicamento.frecuencia}
                          onChange={(e) => updateMedicamento(index, 'frecuencia', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addMedicamento}
                  className="border border-gray-300 rounded w-full p-3 hover:bg-accent flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Medicamento
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Consentimientos y Autorizaciones</h2>
              <p className="text-gray-600 mb-6">
                Los siguientes consentimientos son requeridos para la participación en actividades scout.
              </p>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-orange-800">Todos los consentimientos son obligatorios para garantizar la seguridad del integrante.</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="autorizacionEmergencia"
                    checked={formData.autorizacionEmergencia}
                    onCheckedChange={(checked) => handleInputChange('autorizacionEmergencia', checked === true)}
                    className={errors.autorizacionEmergencia ? 'border-red-500' : ''}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="autorizacionEmergencia" className="font-medium">
                      Autorización para Atención Médica de Emergencia *
                    </Label>
                    <p className="text-sm text-gray-600">
                      Autorizo a la organización scout a buscar atención médica de emergencia para mi hijo/a
                      en caso de accidente o emergencia médica durante las actividades.
                    </p>
                  </div>
                </div>
                {errors.autorizacionEmergencia && (
                  <p className="text-sm text-red-500">{errors.autorizacionEmergencia}</p>
                )}

                <div className="flex items-start space-x-3 p-4 border rounded-lg">
                  <Checkbox
                    id="consentimientoTransporte"
                    checked={formData.consentimientoTransporte}
                    onCheckedChange={(checked) => handleInputChange('consentimientoTransporte', checked === true)}
                    className={errors.consentimientoTransporte ? 'border-red-500' : ''}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="consentimientoTransporte" className="font-medium">
                      Consentimiento para Transporte *
                    </Label>
                    <p className="text-sm text-gray-600">
                      Autorizo el transporte de mi hijo/a durante salidas y actividades organizadas
                      por el grupo scout, incluyendo transporte de emergencia si es necesario.
                    </p>
                  </div>
                </div>
                {errors.consentimientoTransporte && (
                  <p className="text-sm text-red-500">{errors.consentimientoTransporte}</p>
                )}
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              <div className="space-y-2">
                <Label htmlFor="firmaPadre" className="font-medium">Nombre del Padre/Madre/Tutor</Label>
                <input
                  id="firmaPadre"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Nombre completo del responsable"
                  value={formData.firmaPadre}
                  onChange={(e) => handleInputChange('firmaPadre', e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Al completar este campo, confirma que es el padre, madre o tutor legal del integrante.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div className="flex gap-2">

            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`border border-gray-300 px-6 py-2  rounded-md ${currentStep === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-accent'
                  }`}
              >
                Atrás
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={!canProceed()}
                className={`px-6 py-2 rounded-md flex items-center ${canProceed()
                  ? 'bg-primary text-white hover:bg-primary-hover cursor-pointer'
                  : 'bg-accent text-accent-foreground cursor-not-allowed'
                  }`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear Registro
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