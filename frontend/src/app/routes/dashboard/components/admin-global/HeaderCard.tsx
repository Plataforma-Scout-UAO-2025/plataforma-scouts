import { Boxes, Users } from "lucide-react";

const HeaderCard = () => {
  const cards = [
    {
      icon: Boxes,
      label: "Total grupos",
      value: "5",
      label2: "4 activos",
    },
    {
      icon: Users,
      label: "Número de miembros",
      label2: "Miembros registrados",
      value: "120",
    },
    {
      icon: Users,
      label: "Número de miembros",
      label2: "Miembros registrados",
      value: "120",
    },
  ];

  return (
    <>
      {cards.map((item, index) => (
        <div
          key={index}
          className={`border rounded-xl shadow-sm p-3 flex items-center w-1/3`}
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

export default HeaderCard;
