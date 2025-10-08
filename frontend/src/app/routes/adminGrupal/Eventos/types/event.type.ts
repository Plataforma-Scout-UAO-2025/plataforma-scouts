export interface Event {
  id: number;
  name: string;
  location: string;
  startTime: string;
  date: string;
}

export interface EventFilters {
  search?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  completedEvents: number;
  eventsByLocation: Record<string, number>;
}
