import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Home, Users, Calendar, DollarSign, HelpCircle, LogOut } from "lucide-react";

interface FormData {
    nombrePadre: string;
    apellidosPadre: string;
    correoPadre: string;
    profesionPadre: string;
    empresaPadre: string;
    contactoPadre: string;
    nombreMadre: string;
    apellidosMadre: string;
    correoMadre: string;
    profesionMadre: string;
    empresaMadre: string;
    contactoMadre: string;
}

const RegistroAcudientePadres = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<FormData>({
        nombrePadre: "",
        apellidosPadre: "",
        correoPadre: "",
        profesionPadre: "",
        empresaPadre: "",
        contactoPadre: "",
        nombreMadre: "",
        apellidosMadre: "",
        correoMadre: "",
        profesionMadre: "",
        empresaMadre: "",
        contactoMadre: "",
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleContinue = () => {
        console.log("Navegando a emergencia...", formData);
        navigate("/registro-acudiente-emergencia");
    };

    const handleAtras = () => {
        console.log("Navegando atrás...");
        navigate(-1);
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
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#1a4134] mb-2">Datos Acudiente</h1>
                        <p className="text-gray-600">Los campos (*) son obligatorios</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>

                <div className="space-y-8">
                    {/* --------------------------- Datos del Padre --------------------------- */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del padre *
                            </label>
                            <input
                                type="text"
                                placeholder="Ingrese el nombre del padre"
                                value={formData.nombrePadre}
                                onChange={(e) => handleInputChange("nombrePadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellidos del padre *
                            </label>
                            <input
                                type="text"
                                placeholder="Ingrese los apellidos del padre"
                                value={formData.apellidosPadre}
                                onChange={(e) => handleInputChange("apellidosPadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                placeholder="Ingrese el correo electrónico"
                                value={formData.correoPadre}
                                onChange={(e) => handleInputChange("correoPadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profesión
                            </label>
                            <input
                                type="text"
                                value={formData.profesionPadre}
                                onChange={(e) => handleInputChange("profesionPadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa
                            </label>
                            <input
                                type="text"
                                value={formData.empresaPadre}
                                onChange={(e) => handleInputChange("empresaPadre", e.target.value)}
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
                                value={formData.contactoPadre}
                                onChange={(e) => handleInputChange("contactoPadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-300"></div>

                    {/* --------------------------- Datos de la Madre --------------------------- */}
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de la madre *
                            </label>
                            <input
                                type="text"
                                placeholder="Ingrese el nombre de la madre"
                                value={formData.nombreMadre}
                                onChange={(e) => handleInputChange("nombreMadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Apellidos de la madre *
                            </label>
                            <input
                                type="text"
                                placeholder="Ingrese los apellidos de la madre"
                                value={formData.apellidosMadre}
                                onChange={(e) => handleInputChange("apellidosMadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Correo electrónico *
                            </label>
                            <input
                                type="email"
                                placeholder="Ingrese el correo electrónico"
                                value={formData.correoMadre}
                                onChange={(e) => handleInputChange("correoMadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profesión
                            </label>
                            <input
                                type="text"
                                value={formData.profesionMadre}
                                onChange={(e) => handleInputChange("profesionMadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa
                            </label>
                            <input
                                type="text"
                                value={formData.empresaMadre}
                                onChange={(e) => handleInputChange("empresaMadre", e.target.value)}
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
                                value={formData.contactoMadre}
                                onChange={(e) => handleInputChange("contactoMadre", e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a4134] focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* --------------------------- Botones --------------------------- */}
                    <div className="flex justify-between pt-6">
                        <button
                            type="button"
                            onClick={handleAtras}
                            className="px-8 py-2 border border-[#1a4134] text-[#1a4134] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Atrás
                        </button>
                        <button
                            type="button"
                            onClick={handleContinue}
                            className="px-8 py-2 border border-[#1a4134] text-[#1a4134] rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                        >
                            <span>Continuar</span>
                            <span>→</span>
                        </button>
                    </div>

                    {/* --------------------------- Indicador de Progreso --------------------------- */}
                    <div className="flex justify-center mt-6">
                        <div className="flex space-x-2">
                            <div className="w-8 h-2 bg-[#1a4134] rounded"></div>
                            <div className="w-8 h-2 bg-gray-300 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegistroAcudientePadres;