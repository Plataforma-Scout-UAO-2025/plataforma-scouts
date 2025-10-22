import type { Member } from "@/types/member.type";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useMemo } from "react";

interface GenderChartProps {
  members: Member[];
}

ChartJS.register(ArcElement, Tooltip, Legend);

const GenderChart = ({ members }: GenderChartProps) => {
  const genderCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    const normalize = (g: string | undefined) => {
      if (!g) return "No especificado";
      const s = g.trim().toLowerCase();
      if (s === "male" || s === "m" || s === "masculino") return "Masculino";
      if (s === "female" || s === "f" || s === "femenino") return "Femenino";
      return "No especificado";
    };

    members.forEach((m) => {
      const label = normalize(m.gender);
      counts[label] = (counts[label] || 0) + 1;
    });

    return counts;
  }, [members]);

  const data = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        label: "Cantidad de Scouts",
        data: Object.values(genderCounts),
        backgroundColor: [
          "rgba(255, 206, 86, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: ["#fff"],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="border rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <p className="text-xl font-bold text-text">Distribución por género</p>
        <p className="text-accent-foreground text-sm">
          Cantidad de scouts según su género
        </p>
      </div>

      <Pie data={data} />
    </div>
  );
};

export default GenderChart;
