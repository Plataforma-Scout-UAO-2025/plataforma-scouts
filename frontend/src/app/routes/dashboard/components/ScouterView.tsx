import { useAuth0 } from "@auth0/auth0-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRoleContext } from "@/hooks/useRoleContext";

const ScouterView = () => {
  const { user } = useAuth0();
  const { currentUserRoleLabel } = useRoleContext();
  const displayName = user?.nickname || "";

  const scouterInfo = {
    nombre: displayName,
    grupo: "Grupo 1",
    rama: "Lobatos",
    subrama: "Manada Amarilla",
    avancePromedio: 75,
  };

  const actividades = [
    "Gran Rally de Aventureros 2025",
    "Desafío de Orientación Nocturna",
    "Carrera de Supervivencia en la Montaña",
  ];

  const retos = [
    "Planear salida de campo",
    "Práctica de nudos con la rama",
    "Actividad de orientación básica",
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary">
          ¡Bienvenido, {currentUserRoleLabel || "Scouter"}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Seguimiento de tu rama, actividades y progreso de scouts
        </p>
      </div>

      {/* Info + Progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Tu Información</CardTitle>
            <CardDescription>Datos básicos de tu rol y rama (placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              <li><strong>Nombre:</strong> {scouterInfo.nombre}</li>
              <li><strong>Grupo:</strong> {scouterInfo.grupo}</li>
              <li><strong>Rama:</strong> {scouterInfo.rama}</li>
              <li><strong>Subrama:</strong> {scouterInfo.subrama}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Avance Promedio</CardTitle>
            <CardDescription>Progreso general de tu rama (placeholder)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
              <div className="bg-primary h-4" style={{ width: `${scouterInfo.avancePromedio}%` }} />
            </div>
            <p className="text-sm mt-2 text-muted-foreground">
              Avance actual: <strong>{scouterInfo.avancePromedio}%</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actividades y Retos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
            <CardDescription>Lo último realizado por tu rama</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              {actividades.map((actividad, index) => (
                <li key={index}>{actividad}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle>Próximos Retos</CardTitle>
            <CardDescription>Lo que viene para tu rama</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm">
              {retos.map((reto, index) => (
                <li key={index}>{reto}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScouterView;
