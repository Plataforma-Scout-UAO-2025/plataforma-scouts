import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import type { Miembro } from '../types/miembro.type';
import { miembroFormSchema, type MiembroFormData } from '../schemas/MiembroForm.schema';

interface EditarMiembroModalProps {
  isOpen: boolean;
  onClose: () => void;
  miembro: Miembro | null;
  onSave: (data: MiembroFormData) => void;
}

export default function EditarMiembroModal({
  isOpen,
  onClose,
  miembro,
  onSave,
}: EditarMiembroModalProps) {
  const form = useForm<MiembroFormData>({
    resolver: zodResolver(miembroFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      tipoDocumento: 'CC',
      identification: '',
      genero: 'Masculino',
      fechaNacimiento: '',
      telefono: '',
      direccion: '',
      rol: '',
      fechaAceptacion: '',
      isActive: true,
      peso: '',
      altura: '',
      hobbies: '',
      deportes: '',
      instrumentos: '',
      contactosEmergencia: [
        {
          nombreCompleto: '',
          relacion: 'Madre',
          telefono: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'contactosEmergencia',
  });

  // Pre-llenar el formulario cuando se abre con un miembro
  useEffect(() => {
    if (miembro && isOpen) {
      form.reset({
        firstName: miembro.firstName,
        lastName: miembro.lastName,
        email: miembro.email,
        tipoDocumento: miembro.tipoDocumento,
        identification: miembro.identification,
        genero: miembro.genero,
        fechaNacimiento: miembro.fechaNacimiento,
        telefono: miembro.telefono,
        direccion: miembro.direccion,
        rol: miembro.rol || '',
        fechaAceptacion: miembro.fechaAceptacion,
        isActive: miembro.isActive,
        peso: miembro.peso || '',
        altura: miembro.altura || '',
        hobbies: miembro.hobbies || '',
        deportes: miembro.deportes || '',
        instrumentos: miembro.instrumentos || '',
        contactosEmergencia: miembro.contactosEmergencia.length > 0 
          ? miembro.contactosEmergencia 
          : [{ nombreCompleto: '', relacion: 'Madre', telefono: '' }],
      });
    }
  }, [miembro, isOpen, form]);

  const onSubmit = (data: MiembroFormData) => {
    try {
      onSave(data);
      toast.success('Miembro actualizado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al actualizar el miembro');
    }
  };

  const addContacto = () => {
    if (fields.length < 5) {
      append({
        nombreCompleto: '',
        relacion: 'Madre',
        telefono: '',
      });
    }
  };

  const removeContacto = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-2xl font-bold text-[#1a4134]">
              Editar Miembro
            </DialogTitle>
            <DialogDescription className="text-base">
              Modifica la información del miembro scout
            </DialogDescription>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Documentación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tipoDocumento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de documento *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="RC">Registro Civil</SelectItem>
                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                        <SelectItem value="PA">Pasaporte</SelectItem>
                        <SelectItem value="PEP">PEP</SelectItem>
                        <SelectItem value="PPT">PPT</SelectItem>
                        <SelectItem value="NIT">NIT</SelectItem>
                        <SelectItem value="NUIP">NUIP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de identificación *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="genero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fechaNacimiento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de nacimiento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+57 3001234567" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="direccion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información Scout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="rol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol/Rango</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="fechaAceptacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de aceptación *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'true')} 
                      defaultValue={field.value ? 'true' : 'false'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">Activo</SelectItem>
                        <SelectItem value="false">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información Física */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="peso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="55 kg" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="altura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="165 cm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Intereses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hobbies</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deportes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deportes</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instrumentos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instrumentos</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contactos de Emergencia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-[#1a4134]" />
                  <span>Contactos de Emergencia</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Contacto {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContacto(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name={`contactosEmergencia.${index}.nombreCompleto`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contactosEmergencia.${index}.relacion`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Relación *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Padre">Padre</SelectItem>
                                <SelectItem value="Madre">Madre</SelectItem>
                                <SelectItem value="Tutor">Tutor</SelectItem>
                                <SelectItem value="Abuelo/a">Abuelo/a</SelectItem>
                                <SelectItem value="Tío/a">Tío/a</SelectItem>
                                <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                                <SelectItem value="Otro">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`contactosEmergencia.${index}.telefono`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="+57 3001234567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
                {fields.length < 5 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addContacto}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar contacto de emergencia
                  </Button>
                )}
              </CardContent>
            </Card>

            <DialogFooter className="space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-[#1a4134] hover:bg-[#29765C] text-white"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}