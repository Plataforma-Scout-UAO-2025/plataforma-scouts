import { Boxes, Users } from "lucide-react";

type HeaderCardProps = {
  total_members_count: number;
  active_groups_count: number;
  inactive_groups_count: number;
};

const HeaderCard = ({ total_members_count, active_groups_count, inactive_groups_count }: HeaderCardProps) => {
  const total_groups = active_groups_count + inactive_groups_count;
  const cards = [
    {
      icon: Boxes,
      label: "Total grupos",
      value: total_groups.toString(),
      label2: `${active_groups_count} activos`,
      label3: `${inactive_groups_count} inactivos`,
    },
    {
      icon: Users,
      label: "Número de miembros",
      label2: "Miembros registrados",
      value: total_members_count.toString(),
    }
  ];

  return (
    <>
      {cards.map((item, index) => (
        <div
          key={index}
          className={`${index < cards.length - 1 ? 'mb-4' : ''} border rounded-xl shadow-sm p-3 flex items-center`}
        >
          <div className="p-4 w-full">
            <div className="flex justify-between">
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
              {item.label3 !== undefined && inactive_groups_count > 0 && (
                <p className="text-sm md:text-base text-accent-foreground font-normal">
                  {item.label3} 
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default HeaderCard;
