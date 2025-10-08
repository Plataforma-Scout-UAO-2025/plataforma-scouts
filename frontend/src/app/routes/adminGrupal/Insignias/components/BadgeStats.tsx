import { badgeStats } from "@/lib/mockObjects";

const BadgeStats = () => {
  return (
    <section className="flex flex-wrap w-auto gap-4 mb-4 mx-50">
      {badgeStats.map((stat, index) => (
        <div
          key={index}
          className="flex-1 min-w-2 mx-2 bg-accent rounded-xl shadow-md p-4 md:p-6 flex flex-col items-center text-center"
        >
          <p className="text-2xl md:text-3xl text-primary font-bold">
            {stat.value}
          </p>
          <p className="text-sm md:text-lg text-text font-bold mb-2">
            {stat.label}
          </p>
        </div>
      ))}
    </section>
  );
};

export default BadgeStats;