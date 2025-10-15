import LoginButton from "@/components/auth/LoginButton";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Mountain, Target, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex-col">
      <header className="bg-primary py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <img src="/logo.jpg" alt="Logo" className="h-10 w-auto" />

          <div>
            <LoginButton
              organization="org_6B3k4dao2Wf6eGxa"
              className="border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
            >
              Grupo Centinelas 113
            </LoginButton>
            <LoginButton
              organization="org_povsjufF3TEP1DZ7"
              className="border-secondary text-secondary hover:bg-secondary hover:text-white bg-transparent"
            >
              Grupo Chiminigagua 803
            </LoginButton>
          </div>
        </div>
      </header>

      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                ¡Vive la experiencia Scout!
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Forma parte de nuestra gran familia scout. Aquí encontrarás un
                espacio para crecer, aprender y vivir aventuras que marcan la
                diferencia. A través de valores, servicio y amistad, ayudamos a
                construir líderes para el presente y el futuro.
              </p>
            </div>
            <div className="flex justify-center relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-green-800 rounded-full opacity-20 absolute -top-4 -left-4"></div>
                <div className="w-60 h-60 bg-amber-700 rounded-full opacity-30 absolute top-8 right-8"></div>
                <div className="w-40 h-40 bg-green-600 rounded-full opacity-25 absolute -bottom-8 left-12"></div>
              </div>
              <div className="relative z-10 w-80 h-80 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src="/Kids.png"
                  alt="Tres jóvenes scouts en uniforme con sombreros y pañuelos sonriendo juntos"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-12 py-12">
          <section>
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <p className="text-lg text-gray-500">¿Qué es ser Scout?</p>
                <h2 className="text-4xl font-bold text-gray-900">
                  Más que una aventura, es un estilo de vida
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  es una comunidad que reúne grupos scouts. Promovemos la
                  formación integral de niños, niñas, jóvenes y adultos a través
                  del escultismo, fomentando el respeto, la solidaridad, el
                  liderazgo y el amor por la naturaleza.
                </p>
              </div>
            </div>
          </section>

          <section>
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-8 text-left space-y-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Integridad
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Desarrollamos el carácter y los valores fundamentales que
                      forman líderes íntegros para el futuro.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-8 text-left space-y-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Mountain className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Aventura
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Exploramos la naturaleza y vivimos experiencias únicas que
                      fortalecen el espíritu aventurero.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-8 text-left space-y-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Desafío</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Superamos obstáculos y desarrollamos habilidades que nos
                      preparan para cualquier reto de la vida.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0">
                  <CardContent className="p-8 text-left space-y-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-pink-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Hermandad
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Construimos amistades duraderas y aprendemos el valor del
                      trabajo en equipo y la solidaridad.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-white">
              © {new Date().getFullYear()}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
