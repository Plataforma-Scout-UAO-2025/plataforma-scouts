import { Progress } from "@/components/ui/index";
import { badgeStats, badgeProgressData } from "@/lib/mockObjects";

const Badges = () => {
  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Insignias</p>
        <p className="text-2xl text-text font-medium my-5">
          Registra avances y gestiona las insignias de los miembros
        </p>
      </header>

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

      <section>
        {badgeProgressData.map((member) => (
          <div key={member.memberId} className="rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {member.memberName} ({member.branch})
                </h3>
                <p className="text-sm text-gray-600">
                  {member.branch}-{member.age} años
                </p>
              </div>
              <p className="text-sm text-gray-500">
                {member.completedBadges} de {member.totalBadges} insignias
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 flex-wrap">
              {member.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="bg-gray-50 rounded-lg p-4 shadow-md flex-1 min-w-0 md:flex-none md:w-[calc(33.333%-0.67rem)]"
                >
                  <h4 className="font-bold text-primary mb-2">{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {badge.description}
                  </p>
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Progreso</span>
                      <span className="text-sm font-medium">
                        {badge.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <Progress value={badge.progress} className="mt-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Badges;
