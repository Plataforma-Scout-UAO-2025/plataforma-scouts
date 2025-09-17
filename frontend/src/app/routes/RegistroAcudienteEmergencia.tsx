import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../lib/api";
import { User, Home, Users, Calendar, DollarSign, HelpCircle, LogOut, Plus } from "lucide-react";

interface ContactoEmergencia {
    id: number;
    nombreCompleto: string;
    parentesco: string;
    contacto: string;
}

const RegistroAcudienteEmergencia = () => {
    const navigate = useNavigate();

    const [contactosEmergencia, setContactosEmergencia] = useState<ContactoEmergencia[]>([
        { id: 1, nombreCompleto: '', parentesco: '', contacto: '' },
        { id: 2, nombreCompleto: '', parentesco: '', contacto: '' }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (id: number, field: keyof ContactoEmergencia, value: string) => {
        if (field === 'id') return; // No permitir cambiar el id

        setContactosEmergencia(prev =>
            prev.map(contacto =>
                contacto.id === id ? { ...contacto, [field]: value } : contacto
            )
        );
    };

    const handleAtras = () => {
        console.log('Navegando atrás...');
        navigate("/registro-acudiente");
    };

    // Función para validar que los campos requeridos estén completos
    const validarContactos = (): boolean => {
        for (const contacto of contactosEmergencia) {
            if (!contacto.nombreCompleto.trim() || !contacto.parentesco.trim() || !contacto.contacto.trim()) {
                setError('Todos los campos marcados con (*) son obligatorios');
                return false;
            }
        }
        setError(null);
        return true;
    };

    const handleAgregarAcudiente = async () => {
        // Validar campos antes de enviar
        if (!validarContactos()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Enviar cada contacto de emergencia por separado
            for (const contacto of contactosEmergencia) {
                await apiClient.post('/contacto-emergencia', {
                    nombreCompleto: contacto.nombreCompleto,
                    parentesco: contacto.parentesco,
                    contacto: contacto.contacto
                });
            }

            console.log('Contactos de emergencia guardados correctamente');
            
            // Navegar a la siguiente página o mostrar mensaje de éxito
            alert('¡Contactos de emergencia agregados correctamente!');
            
            // Aquí podrías navegar a otra página o resetear el formulario
            // navigate("/siguiente-paso");
            
        } catch (error) {
            console.error('Error guardando contactos de emergencia:', error);
            setError('Error al guardar los contactos de emergencia. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#fffaf3]">
            {/* --------------------------- SIDEBAR --------------------------- */}
            <div className="w-64 bg-[#1a4134] text-white flex flex-col">
                <div className="p-4 border-b border-white/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-white">Juan Esteban Torres</h3>
                            <p className="text-xs text-white/70">YAMAHA KUMA</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                        <li>
                            <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-[#EDEDED] text-[#717171] hover:bg-white/90 transition-colors">
                                <Home size={18} />
                                <span className="text-sm">Inicio</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-[#EDEDED] text-[#717171] hover:bg-white/90 transition-colors">
                                <Users size={18} />
                                <span className="text-sm">Tropa</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-[#EDEDED] text-[#717171] hover:bg-white/90 transition-colors">
                                <Calendar size={18} />
                                <span className="text-sm">Eventos</span>
                            </button>
                        </li>
                        <li>
                            <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-white text-[#1a4134] hover:bg-white/90 transition-colors">
                                <DollarSign size={18} />
                                <span className="text-sm">Financiero</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className="p-4 border-t border-white/20">
                    <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-[#EDEDED] text-[#717171] hover:bg-white/90 transition-colors mb-2">
                        <HelpCircle size={18} />
                        <span className="text-sm">Ayuda</span>
                    </button>
                    <button className="flex items-center space-x-3 w-full text-left p-2 rounded bg-[#EDEDED] text-[#717171] hover:bg-white/90 transition-colors">
                        <LogOut size={18} />
                        <span className="text-sm">Cerrar sesión</span>
                    </button>
                </div>
            </div>

            {/* --------------------------- CONTENIDO PRINCIPAL --------------------------- */}
            <div className="flex-1 p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a4134] mb-2">Datos Acudiente</h1>
                        <p className="text-gray-600">Los campos (*) son obligatorios</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>

                {/* Subtitle */}
                <div className="mb-6">
                    <p className="text-lg text-gray-700 font-medium">En caso de emergencia comunicarse con</p>
                    <div className="w-full h-px bg-gray-300 mt-4"></div>
                </div>

                {/* Form */}
                <div className="space-y-6">
                    {contactosEmergencia.map((contacto) => (
                        <div key={contacto.id} className="grid grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre completo *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ingrese su nombre completo"
                                    value={contacto.nombreCompleto}
                                    onChange={(e) => handleInputChange(contacto.id, 'nombreCompleto', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Parentesco *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Tío, Abuelo, etc."
                                    value={contacto.parentesco}
                                    onChange={(e) => handleInputChange(contacto.id, 'parentesco', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contacto *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ingrese su número de contacto"
                                    value={contacto.contacto}
                                    onChange={(e) => handleInputChange(contacto.id, 'contacto', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Mensaje de error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex justify-between pt-8">
                        <button
                            type="button"
                            onClick={handleAtras}
                            className="px-8 py-2 border border-[#1a4134] text-[#1a4134] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Atrás
                        </button>
                        <button
                            type="button"
                            onClick={handleAgregarAcudiente}
                            disabled={isLoading}
                            className="px-8 py-2 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: isLoading ? '#6b7280' : '#29765C',
                                color: 'white',
                                border: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#1a4134';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isLoading) {
                                    e.currentTarget.style.backgroundColor = '#29765C';
                                }
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span style={{ color: 'white' }}>Guardando...</span>
                                </>
                            ) : (
                                <>
                                    <Plus size={16} style={{ color: 'white' }} />
                                    <span style={{ color: 'white' }}>Agregar Acudiente</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-2">
                            <div className="w-8 h-2 bg-[#1a4134] rounded"></div>
                            <div className="w-8 h-2 bg-[#1a4134] rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroAcudienteEmergencia;