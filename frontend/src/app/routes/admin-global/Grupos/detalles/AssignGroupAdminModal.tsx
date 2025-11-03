import { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/index";
import type { GroupResponseDTO as Group } from "@/types/group.type";
import type { EmergencyContact } from "@/types/groupAdmin.type";
import { createGroupAdminSchema, type CreateGroupAdminFormData, calculateAge, isOver18, isNotFutureDate } from "@/schemas/groupAdmin.schema";
import { createGroupAdmin } from "@/api/groupsApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { fetchGroupsAction } from "@/store/groups/groupsActions";
import { Trash2, Plus } from "lucide-react";

interface AssignGroupAdminModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    group: Group | null;
}

const AssignGroupAdminModal = ({ open, onOpenChange, group }: AssignGroupAdminModalProps) => {
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

    // Refs para debounce
    const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const memberEmailDebounceRef = useRef<NodeJS.Timeout | null>(null);

    const [formData, setFormData] = useState<CreateGroupAdminFormData>({
        email: "",
        password: "",
        confirmPassword: "",
        username: "",
        firstName: "",
        lastName: "",
        age: 18,
        role: "SCOUT",
        identification: "",
        documentType: "CC",
        memberEmail: "",
        gender: "Masculino",
        birthDate: "",
        address: "",
        phone: "",
        weight: "",
        height: "",
        hobbies: "",
        sports: "",
        instruments: "",
        relationship: "",
        acceptanceDate: new Date().toISOString().split("T")[0],
        emergencyContacts: [],
        acceptTreatment: false,
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                username: "",
                firstName: "",
                lastName: "",
                age: 18,
                role: "SCOUT",
                identification: "",
                documentType: "CC",
                memberEmail: "",
                gender: "Masculino",
                birthDate: "",
                address: "",
                phone: "",
                weight: "",
                height: "",
                hobbies: "",
                sports: "",
                instruments: "",
                relationship: "",
                acceptanceDate: new Date().toISOString().split("T")[0],
                emergencyContacts: [],
                acceptTreatment: false,
            });
            setEmergencyContacts([]);
            setErrors({});
        }
    }, [open]);

    // Limpiar timers al desmontar
    useEffect(() => {
        return () => {
            if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
            if (memberEmailDebounceRef.current) clearTimeout(memberEmailDebounceRef.current);
        };
    }, []);

    // Handler para cambio de fecha de nacimiento con cálculo automático de edad
    const handleBirthDateChange = useCallback((dateString: string) => {
        setFormData((prev) => {
            const newData = { ...prev, birthDate: dateString };

            if (dateString) {
                // Validar que no sea fecha futura
                if (!isNotFutureDate(dateString)) {
                    setErrors((prev) => ({ ...prev, birthDate: "La fecha de nacimiento no puede ser futura" }));
                    return newData;
                }

                // Calcular edad automáticamente
                const calculatedAge = calculateAge(dateString);
                newData.age = calculatedAge;

                // Validar edad mínima
                if (!isOver18(dateString)) {
                    setErrors((prev) => ({ ...prev, birthDate: "Debe ser mayor de 18 años" }));
                } else if (calculatedAge > 100) {
                    setErrors((prev) => ({ ...prev, birthDate: "La edad no puede ser mayor a 100 años" }));
                } else {
                    // Limpiar errores si es válido
                    setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.birthDate;
                        delete newErrors.age;
                        return newErrors;
                    });
                }
            }

            return newData;
        });
    }, []);

    // Handler con debounce para email de usuario
    const handleEmailChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, email: value }));

        // Limpiar timeout anterior
        if (emailDebounceRef.current) {
            clearTimeout(emailDebounceRef.current);
        }

        // Validar después de 500ms de inactividad
        emailDebounceRef.current = setTimeout(() => {
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setErrors((prev) => ({ ...prev, email: "Email inválido" }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                });
            }
        }, 500);
    }, []);

    // Handler con debounce para email del miembro
    const handleMemberEmailChange = useCallback((value: string) => {
        setFormData((prev) => ({ ...prev, memberEmail: value }));

        // Limpiar timeout anterior
        if (memberEmailDebounceRef.current) {
            clearTimeout(memberEmailDebounceRef.current);
        }

        // Validar después de 500ms de inactividad
        memberEmailDebounceRef.current = setTimeout(() => {
            if (value && value !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                setErrors((prev) => ({ ...prev, memberEmail: "Email inválido" }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.memberEmail;
                    return newErrors;
                });
            }
        }, 500);
    }, []);

    // Handler para validar confirmación de contraseña en tiempo real
    const handlePasswordChange = useCallback((value: string) => {
        setFormData((prev) => {
            const newData = { ...prev, password: value };

            // Si ya hay confirmación, validar que coincidan
            if (prev.confirmPassword && value !== prev.confirmPassword) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    confirmPassword: "Las contraseñas no coinciden"
                }));
            } else if (prev.confirmPassword && value === prev.confirmPassword) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors.confirmPassword;
                    return newErrors;
                });
            }

            return newData;
        });
    }, []);

    const handleConfirmPasswordChange = useCallback((value: string) => {
        setFormData((prev) => {
            const newData = { ...prev, confirmPassword: value };

            // Validar que coincida con la contraseña
            if (value && prev.password !== value) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    confirmPassword: "Las contraseñas no coinciden"
                }));
            } else if (value && prev.password === value) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors.confirmPassword;
                    return newErrors;
                });
            }

            return newData;
        });
    }, []);

    const handleInputChange = (field: keyof CreateGroupAdminFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const addEmergencyContact = () => {
        setEmergencyContacts([...emergencyContacts, { name: "", relationship: "", phone: "" }]);
    };

    const removeEmergencyContact = (index: number) => {
        setEmergencyContacts(emergencyContacts.filter((_, i) => i !== index));
    };

    const updateEmergencyContact = (index: number, field: keyof EmergencyContact, value: string) => {
        const updated = [...emergencyContacts];
        updated[index] = { ...updated[index], [field]: value };
        setEmergencyContacts(updated);
    };

    const handleSubmit = async () => {
        if (!group) return;

        setLoading(true);
        setErrors({});

        try {
            // Preparar datos con contactos de emergencia
            const dataToValidate = {
                ...formData,
                emergencyContacts: emergencyContacts.filter(
                    (contact) => contact.name && contact.relationship && contact.phone
                ),
            };

            // Validar con Zod
            const validatedData = createGroupAdminSchema.parse(dataToValidate);

            // Transformar a formato backend (snake_case)
            const requestData = {
                email: validatedData.email,
                password: validatedData.password,
                username: validatedData.username,
                member: {
                    tenant_id: group.tenantId,
                    first_name: validatedData.firstName,
                    last_name: validatedData.lastName,
                    age: validatedData.age,
                    role: validatedData.role,
                    identification: validatedData.identification,
                    document_type: validatedData.documentType,
                    email: validatedData.memberEmail || undefined,
                    gender: validatedData.gender,
                    birth_date: validatedData.birthDate,
                    address: validatedData.address || undefined,
                    phone: validatedData.phone || undefined,
                    weight: validatedData.weight || undefined,
                    height: validatedData.height || undefined,
                    hobbies: validatedData.hobbies || undefined,
                    sports: validatedData.sports || undefined,
                    instruments: validatedData.instruments || undefined,
                    is_active: true,
                    relationship: validatedData.relationship || undefined,
                    status: "APPROVED" as const,
                    acceptance_date: validatedData.acceptanceDate || undefined,
                    emergency_contacts: validatedData.emergencyContacts,
                    accept_treatment: validatedData.acceptTreatment,
                },
            };

            console.log(group);

            // Enviar al backend
            await createGroupAdmin(group.tenantId, group.slug, requestData);

            // Recargar grupos
            dispatch(fetchGroupsAction());

            // Cerrar modal
            onOpenChange(false);
        } catch (error: any) {
            if (error.errors) {
                // Errores de validación de Zod
                const zodErrors: Record<string, string> = {};
                error.errors.forEach((err: any) => {
                    if (err.path) {
                        zodErrors[err.path.join(".")] = err.message;
                    }
                });
                setErrors(zodErrors);
            } else if (error.response?.data?.message) {
                // Error del backend
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: "Error al crear el administrador del grupo" });
            }
            console.error("Error creando administrador:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear Administrador del Grupo</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {group && (
                        <div className="mb-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                                Grupo: <span className="font-semibold text-foreground">{group.name}</span>
                            </p>
                        </div>
                    )}

                    {errors.general && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{errors.general}</p>
                        </div>
                    )}

                    {/* Datos de Usuario Auth0 */}
                    <div className="space-y-4 border-b pb-4">
                        <h3 className="font-semibold text-lg">Datos de Acceso</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleEmailChange(e.target.value)}
                                    placeholder="admin@example.com"
                                />
                                {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange("username", e.target.value)}
                                    placeholder="admin.grupo"
                                />
                                {errors.username && <p className="text-sm text-red-600">{errors.username}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Contraseña *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => handlePasswordChange(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                />
                                {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Debe contener mayúsculas, minúsculas, números y caracteres especiales
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                    placeholder="Repite la contraseña"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Datos Personales del Miembro */}
                    <div className="space-y-4 border-b pb-4">
                        <h3 className="font-semibold text-lg">Datos Personales</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                />
                                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                />
                                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="identification">Identificación *</Label>
                                <Input
                                    id="identification"
                                    value={formData.identification}
                                    onChange={(e) => handleInputChange("identification", e.target.value)}
                                />
                                {errors.identification && (
                                    <p className="text-sm text-red-600">{errors.identification}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documentType">Tipo de Documento *</Label>
                                <Select
                                    value={formData.documentType}
                                    onValueChange={(value) => handleInputChange("documentType", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                                        <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                                        <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                                        <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                                        <SelectItem value="RC">Registro Civil</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                                <Input
                                    id="birthDate"
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => handleBirthDateChange(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                />
                                {errors.birthDate && <p className="text-sm text-red-600">{errors.birthDate}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Debe ser mayor de 18 años
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="age">Edad (Calculada automáticamente)</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={formData.age}
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                />
                                {errors.age && <p className="text-sm text-red-600">{errors.age}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Género *</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleInputChange("gender", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Masculino">Masculino</SelectItem>
                                        <SelectItem value="Femenino">Femenino</SelectItem>
                                        <SelectItem value="Otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="memberEmail">Email del Miembro</Label>
                                <Input
                                    id="memberEmail"
                                    type="email"
                                    value={formData.memberEmail}
                                    onChange={(e) => handleMemberEmailChange(e.target.value)}
                                />
                                {errors.memberEmail && <p className="text-sm text-red-600">{errors.memberEmail}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Teléfono</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange("phone", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Dirección</Label>
                                <Input
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => handleInputChange("address", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contactos de Emergencia */}
                    <div className="space-y-4 border-b pb-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Contactos de Emergencia</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addEmergencyContact}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Contacto
                            </Button>
                        </div>

                        {emergencyContacts.map((contact, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Contacto {index + 1}</span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeEmergencyContact(index)}
                                    >
                                        <Trash2 className="w-4 h-4 text-red-600" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <Input
                                        placeholder="Nombre"
                                        value={contact.name}
                                        onChange={(e) => updateEmergencyContact(index, "name", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Relación"
                                        value={contact.relationship}
                                        onChange={(e) => updateEmergencyContact(index, "relationship", e.target.value)}
                                    />
                                    <Input
                                        placeholder="Teléfono"
                                        value={contact.phone}
                                        onChange={(e) => updateEmergencyContact(index, "phone", e.target.value)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Aceptación de Tratamiento */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="acceptTreatment"
                            checked={formData.acceptTreatment}
                            onChange={(e) => handleInputChange("acceptTreatment", e.target.checked)}
                            className="w-4 h-4"
                        />
                        <Label htmlFor="acceptTreatment" className="text-sm">
                            Acepto el tratamiento de datos personales *
                        </Label>
                    </div>
                    {errors.acceptTreatment && (
                        <p className="text-sm text-red-600">{errors.acceptTreatment}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Creando..." : "Crear Administrador"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignGroupAdminModal;
