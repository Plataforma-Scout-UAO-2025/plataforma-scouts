import { FaShieldAlt, FaMountain, FaUsers, FaArrowRight, FaShip } from "react-icons/fa";
import { useEffect, useState } from "react";
import home from "@/assets/Home.png";
import cachorros from "@/assets/cachorros.jpg";
import lobatos from "@/assets/lobatos.jpeg";
import webelos from "@/assets/webelos.jpg";
import scout from "@/assets/scout.jpg";

const values = [
  {
    icon: <FaShieldAlt  size={32} className="text-green-600" />,
    title: "Integridad",
    desc: "Desarrollamos el carácter y los valores fundamentales que forman líderes íntegros para el futuro.",
  },
  {
    icon: <FaShip  size={32} className="text-blue-600" />,
    title: "Aventura",
    desc: "Exploramos la naturaleza y vivimos experiencias únicas que fortalecen el espíritu aventurero.",
  },
  {
    icon: <FaMountain size={32} className="text-yellow-600" />,
    title: "Desafío",
    desc: "Fomentamos el compromiso y la Superamos obstáculos y desarrollamos habilidades que nos preparan para cualquier reto de la vida.",
  },
  {
    icon: <FaUsers size={32} className="text-purple-600" />,
    title: "Hermandad",
    desc: "Construimos amistades duraderas y aprendemos el valor del trabajo en equipo y la solidaridad.",
  },
   
];

const grupos = [
  {
    section: "Sección Menor",
    image: cachorros,
    title: "Cachorros (5–7 años)",
    desc: "Primeros pasos en el mundo scout a través de juegos, cuentos y actividades divertidas."
  },
  {
    section: "Sección Menor",
    image: lobatos,
    title: "Lobatos (7–10 años)",
    desc: "Desarrollo de habilidades básicas y aventuras al aire libre en un ambiente seguro y divertido."
  },
  {
    section: "Sección Intermedia",
    image: webelos,
    title: "Webelos (11–12 años)",
    desc: "Exploración y aventuras más desafiantes, desarrollando independencia y liderazgo."
  },
  {
    section: "Sección Mayor",
    image: scout,
    title: "Scout (13–17 años)",
    desc: "Preparación para la vida adulta a través de proyectos de servicio comunitario y liderazgo."
  }
];

export default function Home() {
  const [activeSection, setActiveSection] = useState("inicio");

//para el efecto en el boton del navbar
useEffect(() => {
  const handleScroll = () => {
    const sections = ["inicio", "about", "grupos", "contact"];
    let current = "inicio";
    let minDistance = Infinity;

    for (const sec of sections) {
      const el = document.getElementById(sec);
      if (el) {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - 80); 
        if (distance < minDistance && rect.bottom > 100) {
          minDistance = distance;
          current = sec;
        }
      }
    }
    setActiveSection(current);
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll();
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  const navBtnClass = (section: string) => {
    const base =
      "rounded-md px-7 py-1 font-regular transition-colors";

    if (activeSection === section) {
      // Botón activo → degradado fijo
      return `${base} bg-gradient-to-r from-[#23614C] to-[#1A4134] text-white shadow`;
    }

    // Botón inactivo → normal, pero con hover y active degradado
    return `${base} bg-[#1A4134] text-[rgba(255,250,243,1)] 
      hover:bg-gradient-to-r hover:from-[#23614C] hover:to-[#1A4134]
      active:bg-gradient-to-r active:from-[#23614C] border-[#1A4134]`;
  };

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Navbar fija */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 shadow-sm bg-[rgba(26,65,52,1)]">
        <div className="flex items-center gap-2">
          <FaShieldAlt size={28} className="text-[#419679]" />
          <span className="font-bold text-xl text-[#FFFAF3] ">
            ASRP
          </span>
        </div>
        <div className="flex gap-8">
          <a href="#inicio" className={navBtnClass("inicio")}>
            Inicio
          </a>
          <a href="#about" className={navBtnClass("about")}>
            About
          </a>
          <a href="#grupos" className={navBtnClass("grupos")}>
            Grupo
          </a>
          <a href="#contact" className={navBtnClass("contact")}>
            Contacto
          </a>
        </div>
        <div className="flex gap-3">
          <a
            href="/login"
            className="border border-[#916E5A] text-[#916E5A] px-7 py-1 rounded-[8px] hover:bg-green-50 font-regular"
          >
            Login
          </a>
          <a
            href="/register"
            className="bg-[#113227] text-[#FFFAF3] px-7 py-1 rounded-[8px] hover:bg-[#18614a] font-regular"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="inicio"
        className="pt-28 flex flex-col md:flex-row items-center justify-between px-8 py-16 bg-[#F0F3F2]"
      >
        <div className="md:w-1/2">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#282828] mb-8">
            Asociación scouts región pacifico
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            Forma parte de nuestra gran familia scout. Aquí encontrarás un espacio para crecer, aprender y vivir aventuras que marcan la diferencia. A través de valores,
            servicio y amistad, ayudamos a construir líderes para el presente y el futuro.
          </p>
          <div className="flex gap-4 mb-8">
          <a
            href="/register"
            className="bg-[#113227] rounded-[8px] text-[#FFFAF3] px-6 py-3 font-medium flex items-center gap-2 
                      hover:bg-[#154737] hover:scale-95 hover:shadow-inner 
                      transition-transform duration-200"
          >
            Únete a ser un Scout
            <FaArrowRight className="text-[#FFFAF3]" />
          </a>
            <a
              href="#about"
              className="border border-[#916E5A] text-[#916E5A] px-6 py-3 rounded-[8px] font-semibold
                        hover:bg-[#ebebeb] hover:scale-95 hover:shadow-inner 
                        transition-transform duration-200"
            >
              Conoce más
            </a>
          </div>
         
        </div>
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <img
            src={home}
            alt="Scout"
            className="w-593.42 h-auto rounded-xl "
          />
        </div>
      </section>

      {/* quines somos */}
      <section id="about" className="pt-8 scroll-mt-28 px-8 py-16 bg-[#FFFAF3]">
      <div className="flex justify-center  mb-3">
        <span className="inline-block bg-[#f7f7f7] text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
          ¿Qué es ser Scout?
        </span>
      </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Más que una aventura, un estilo de vida
        </h2>
        <div className="flex justify-center">
          <p className="text-lg text-gray-700 text-justify max-w-2xl mb-8">
            Ser scout es formar parte de una comunidad global que promueve el
            desarrollo personal, el liderazgo y el servicio. Cada experiencia te
            prepara para enfrentar los desafíos de la vida con valentía y
            solidaridad.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-white rounded-xl p-6 flex flex-col items-center shadow-xl hover:shadow-2xl transition"
            >
              {v.icon}
              <h3 className="mt-4 text-xl font-semibold text-gray-800">
                {v.title}
              </h3>
              <p className="mt-2 text-gray-600 text-center">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Grupos */}
      <section id="grupos" className="pt-8 scroll-mt-28 px-8 py-16 bg-[#F0F3F2] ">
      <div className="flex justify-center  mb-3">
        <span className="inline-block bg-[#f7f7f7] text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
          Nuestros Grupos
        </span>
      </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
          Grupo Centinelas 118 y  803 chiminigagua
        </h2>
        <div className="flex justify-center">
          <p className="text-lg text-gray-700 text-justify max-w-2xl mb-8">
            Desde los más pequeños hasta jóvenes adultos, tenemos Grupos diseñados 
            específicamente para cada edad y nivel de desarrollo.
          </p>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-200 mx-40">
        {grupos.map((v) => (
          <div
            key={v.title}
            className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition overflow-hidden"
          >
            <img
              src={v.image}
              alt={v.title}
              className="h-48 w-full object-cover"
            />

            {/* Contenido inferior */}
            <div className="p-6">
              <span className="inline-block px-3 py-1 text-xs font-medium text-white bg-[#113227] rounded-full">
                {v.section}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-800">
                {v.title}
              </h3>
              <p className="mt-2 text-gray-600">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>
      </section>

     {/* Contacto */}
      <section id="contact" className="pt-8 scroll-mt-28 px-8 py-16 bg-[#FFFAF3]">
  <div className="flex justify-center mb-3">
    <span className="inline-block bg-[#f7f7f7] text-gray-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm">
      ¡Únete hoy!
    </span>
  </div>
  <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">
    ¿Listo para tu próxima aventura?
  </h2>
  <div className="flex justify-center">
    <p className="text-lg text-gray-700 text-justify max-w-2xl mb-8">
      Desde los más pequeños hasta jóvenes adultos, tenemos Grupos diseñados 
      específicamente para cada edad y nivel de desarrollo.
    </p>
  </div>
  <div className="flex flex-col md:flex-row gap-12 justify-center items-start max-w-4xl mx-auto">
    {/* Bloque de formulario */}
    <div className="bg-white rounded-xl shadow-xl p-8 flex-1 w-full mb-8 md:mb-0">
      <h3 className="text-xl font-semibold text-[#113227] mb-6 text-center">Si deceas unirte déjanos tu información</h3>    
      <div className="mb-4 flex justify-center">   
<a
  href="/inscription"
  className="bg-gradient-to-r from-[#23614C] to-[#1A4134] text-white font-semibold py-2 px-7 rounded mt-2 hover:scale-95 transition text-center"
>
  Llena el formulario
</a>
</div>
  
    </div>
    {/* Bloque de información de contacto */}
    <div className="bg-white rounded-xl shadow-xl p-8 flex-1 w-full">
      <h3 className="text-xl font-semibold text-[#113227] mb-6 text-center">Información de contacto</h3>
      <div className="flex flex-col gap-4 text-gray-700">
        <div>
          <span className="font-bold">Teléfono:</span> +57 312 345 6789
        </div>
        <div>
          <span className="font-bold">Email:</span> scouts.pacifico@email.com
        </div>
        <div>
          <span className="font-bold">Ubicación:</span> Calle 123 #45-67, Cali, Colombia
        </div>
      </div>
    </div>
  </div>
</section>
</div>
  );
}

