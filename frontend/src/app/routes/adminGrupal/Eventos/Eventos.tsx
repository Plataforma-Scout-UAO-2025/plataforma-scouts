import { useState, useMemo } from "react";
import { eventsData } from "@/lib/mockObjects";
import { format } from "date-fns";
import EventsFilter from "./components/EventsFilter";
import EventCard from "./components/EventCard";

const Events = () => {
  const [date, setDate] = useState<Date>();
  const [nameFilter, setNameFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const filteredEvents = useMemo(() => {
    return eventsData.filter((event) => {
      const matchesName =
        nameFilter === "" ||
        event.name.toLowerCase().includes(nameFilter.toLowerCase());

      const matchesLocation =
        locationFilter === "" ||
        event.location.toLowerCase().includes(locationFilter.toLowerCase());

      const matchesDate = !date || event.date === format(date, "dd/MM/yyyy");

      return matchesName && matchesLocation && matchesDate;
    });
  }, [nameFilter, locationFilter, date]);

  return (
    <div className="mx-4">
      <EventsFilter
        nameFilter={nameFilter}
        setNameFilter={setNameFilter}
        locationFilter={locationFilter}
        setLocationFilter={setLocationFilter}
        date={date}
        setDate={setDate}
      />
      <section className="flex flex-col md:flex-row">
        <div className="w-full h-auto mt-4">
          <p className="text-2xl text-primary mx-10 my-5">
            Próximos eventos ({filteredEvents.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-10">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-text text-lg">
                  No se encontraron eventos que coincidan con los filtros.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;
