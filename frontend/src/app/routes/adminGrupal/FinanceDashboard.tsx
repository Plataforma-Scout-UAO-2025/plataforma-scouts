import {
  Rss,
  TrendingUp,
  ChartColumn,
  BanknoteArrowDown,
} from "lucide-react";
import { Button, Progress } from "@/components/ui/index";
import { paymentMetrics } from "@/lib/mockObjects";
import { useNavigate } from "react-router-dom";

const progressValue = 75;

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 md:space-y-8 mx-2 md:mx-4">
      {/* Título */}
      <header className="flex flex-col md:flex-row items-start md:items-center mb-6 md:mb-8 justify-between gap-4">
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
          Dashboard
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant={"secondary"} className="text-xs md:text-sm">
            <Rss className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">Notificaciones</span>
            <span className="sm:hidden ml-1">Notif.</span>
          </Button>
          <Button variant={"primary"} className="text-xs md:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="ml-1">Reportes</span>
          </Button>
        </div>
      </header>

      {/* Métricas rápidas */}
      <section className="flex flex-col md:flex-row flex-wrap gap-4 min-h-[128px]">
        {paymentMetrics.map((item) => (
          <div
            key={item.label}
            className="bg-accent rounded-xl shadow-md p-4 md:p-6 flex items-center gap-3 md:gap-4 flex-1 min-w-[250px]"
          >
            <div className="bg-primary/20 p-2 md:p-3 rounded-lg flex-shrink-0">
              {<item.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm md:text-lg text-text font-bold truncate">
                {item.label}
              </p>
              <p className="text-sm md:text-lg text-primary">{item.value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Actividad reciente */}
      <section className="flex flex-col lg:flex-row gap-4">
        <div className="flex-[2] bg-accent rounded-xl shadow-md p-6 md:p-12">
          <p className="text-base md:text-lg text-primary font-bold mb-4">
            Cumplimiento de Pagos
          </p>
          <p className="text-base md:text-lg text-primary">
            Progreso de pagos: {progressValue}%
          </p>
          <Progress value={progressValue} className="mt-4" />
        </div>
        <div className="flex-1 bg-accent rounded-xl shadow-md p-6 md:p-12">
          <p className="text-base md:text-lg text-primary font-bold mb-4">
            Acciones
          </p>
          <div className="space-y-3 md:space-y-4">
            <Button variant={"primary"} className="w-full text-xs md:text-sm" onClick={() => navigate('/app/adminGrupal/finanzas/estados')}>
              <ChartColumn className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">
                Revisar Estados de Cuenta
              </span>
              <span className="ml-1 sm:hidden">Estados</span>
            </Button>
            <Button variant={"secondary"} className="w-full text-xs md:text-sm" onClick={() => navigate('/app/adminGrupal/finanzas/registro')}>
              <BanknoteArrowDown className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">Registrar Pagos</span>
              <span className="ml-1 sm:hidden">Pagos</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
