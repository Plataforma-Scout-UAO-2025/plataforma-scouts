import { Button } from "@/components/ui/index";
import type { Event } from "../types/event.type";

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <div className="bg-accent rounded-xl shadow-md p-6">
      <div className="flex mb-4">
        <div>
          <p className="text-lg text-text font-bold mb-2">
            Nombre del evento: {event.name}
          </p>
          <p className="text-sm text-primary mb-1">
            Evento #{event.id}
          </p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-sm text-text">
          <span className="font-medium">Lugar del evento:</span>{" "}
          {event.location}
        </p>
        <p className="text-sm text-text">
          <span className="font-medium">Hora de inicio:</span>{" "}
          {event.startTime}
        </p>
        <p className="text-sm text-text">
          <span className="font-medium">Fecha del evento:</span>{" "}
          {event.date}
        </p>
      </div>
      <Button variant="primary" className="mt-3">
        Inscribirme
      </Button>
    </div>
  );
};

export default EventCard;