import { badgeProgressData } from "@/lib/mockObjects";
import BadgeStats from "./components/BadgeStats";
import MemberBadges from "./components/MemberBadges";

const Insignias = () => {
  return (
    <div className="mx-4">
      <header className="flex flex-col mb-4">
        <p className="text-5xl font-bold text-primary">Insignias</p>
        <p className="text-2xl text-text font-medium my-5">
          Registra avances y gestiona las insignias de los miembros
        </p>
      </header>

      <BadgeStats />

      <section>
        {badgeProgressData.map((member) => (
          <MemberBadges key={member.memberId} member={member} />
        ))}
      </section>
    </div>
  );
};

export default Insignias;
