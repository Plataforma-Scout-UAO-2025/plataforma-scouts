import {
  Award,
  Calendar,
  CircleDollarSign,
  Users,
} from "lucide-react";

interface HomeCardProps {
  stats: {
    totalScouts: number;
    scoutsActivos: number;
    totalRamas: number;
    nuevosEsteMes: number;
  };
}

const HomeCard = ({ stats }: HomeCardProps) => {
  const cards = [
    {
      icon: Users,
      label: "Total Scouts",
      value: stats.totalScouts.toString(),
      label2: `${stats.scoutsActivos} activos`,
    },
    {
      icon: Calendar,
      label: "Ramas",
      label2: "ramas del grupo",
      value: stats.totalRamas.toString(),
    },
    {
      icon: Award,
      label: "Nuevos Miembros",
      label2: "este mes",
      value: stats.nuevosEsteMes.toString(),
    },
    {
      icon: CircleDollarSign,
      label: "Ingresos Mensuales",
      label2: "próximamente",
      value: "$0",
    },
  ];

  return (
    <>
      {cards.map((item, index) => (
        <div
          key={index}
          className={`border rounded-xl shadow-sm p-3 flex items-center w-1/4`}
        >
          <div className="p-4 w-full">
            <div className="pb-4 flex justify-between">
              <p className="text-md md:text-xl text-text font-bold pr-12">
                {item.label}
              </p>
              <item.icon className="text-primary flex-shrink-0 w-12 h-12" />
            </div>
            <div className="text-md md:text-xl text-primary mb-2">
              <p className="font-bold">{item.value}</p>
              {item.label2 && (
                <p className="text-sm md:text-base text-accent-foreground font-normal">
                  {item.label2}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default HomeCard;
