import { homeCards } from "@/lib/mockObjects";

const HomeCard = () => (
  <>
    {homeCards.map((item) => (
      <div
        className={`border rounded-xl shadow-sm p-3 flex items-center w-1/4`}
      >
        <div className="p-4 w-full">
          <div className="pb-4 flex justify-between">
            <p className="text-md md:text-xl text-text font-bold pr-12">
              {item.label}
            </p>
            <item.icon className="text-primary flex-shrink-0 w-12 h-12" />
          </div>
          <p className="text-md md:text-xl text-primary mb-2">
            {item.value}
            {item.label2 && (
              <p className="text-sm md:text-base text-accent-foreground font-normal">
                {item.label2}
              </p>
            )}
          </p>
        </div>
      </div>
    ))}
  </>
);
export default HomeCard;
