import { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import { Navbar } from "@/components/Navbar";
import { AddEventModal } from "@/components/AddEventModal";
import { EventDetailsModal, EventDetails } from "@/components/EventDetailsModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, RefreshCw, Filter } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  classNames: string[];
  extendedProps: {
    description: string | null;
    zoom_link: string | null;
    user_id: string;
    organizer_name: string | null;
    organizer_avatar: string | null;
    participant_count: number;
    is_participating: boolean;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterMyEvents, setFilterMyEvents] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const loadEvents = async () => {
    setLoading(true);

    const [eventsRes, participantsRes] = await Promise.all([
      supabase.from("events").select("*"),
      supabase.from("event_participants").select("*"),
    ]);

    if (eventsRes.error) {
      console.error("Error loading events:", eventsRes.error.message);
      setLoading(false);
      return;
    }

    const eventsData = eventsRes.data || [];
    const participantsData = participantsRes.data || [];

    if (eventsData.length === 0) {
      setEvents([]);
      setLoading(false);
      return;
    }

    // Build participant counts and user participation map
    const countMap = new Map<string, number>();
    const userParticipation = new Set<string>();
    for (const p of participantsData) {
      countMap.set(p.event_id, (countMap.get(p.event_id) || 0) + 1);
      if (p.user_id === user?.id) userParticipation.add(p.event_id);
    }

    // Fetch profiles
    const userIds = [...new Set(eventsData.map((e) => e.user_id))];
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profilesMap = new Map(
      (profilesData || []).map((p) => [p.id, p])
    );

    const mapped: CalendarEvent[] = eventsData.map((e) => {
      const profile = profilesMap.get(e.user_id);
      // Count = participants + 1 (organizer always counts)
      const participantCount = (countMap.get(e.id) || 0) + 1;
      const isParticipating = userParticipation.has(e.id);
      return {
        id: e.id,
        title: `${e.title} (${participantCount})`,
        start: e.start_time,
        end: e.end_time,
        classNames: [e.user_id === user?.id ? "fc-event-own" : "fc-event-other"],
        extendedProps: {
          description: e.description,
          zoom_link: e.zoom_link,
          user_id: e.user_id,
          organizer_name: profile?.full_name || null,
          organizer_avatar: profile?.avatar_url || null,
          participant_count: participantCount,
          is_participating: isParticipating,
        },
      };
    });

    setEvents(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();

    const channel = supabase
      .channel("events-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => loadEvents()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_participants" },
        () => loadEvents()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredEvents = filterMyEvents
    ? events.filter(
        (e) =>
          e.extendedProps.user_id === user?.id ||
          e.extendedProps.is_participating
      )
    : events;

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title.replace(/\s*\(\d+\)$/, ""),
      start_time: info.event.startStr,
      end_time: info.event.endStr,
      description: props.description,
      zoom_link: props.zoom_link,
      user_id: props.user_id,
      organizer_name: props.organizer_name,
      organizer_avatar: props.organizer_avatar,
      participant_count: props.participant_count,
      is_participating: props.is_participating,
    });
    setDetailsOpen(true);
  };

  const filterButtonRef = useRef<HTMLButtonElement | null>(null);

  const customButtons = {
    filterMeus: {
      text: filterMyEvents ? "✓ Meus Eventos" : "Meus Eventos",
      click: () => {
        setFilterMyEvents((prev) => !prev);
      },
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
            Meus Workshops
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadEvents} disabled={loading} className="gap-1">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </Button>
            <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
              <Plus className="h-4 w-4" />
              Novo Evento
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-card">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={ptBrLocale}
            events={filteredEvents}
            eventClick={handleEventClick}
            editable={false}
            dayMaxEvents={3}
            aspectRatio={1.6}
            customButtons={customButtons}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek filterMeus",
            }}
            height="auto"
          />
        </div>
      </div>

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} onEventAdded={loadEvents} />
      <EventDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        event={selectedEvent}
        onEventDeleted={loadEvents}
        onParticipationChanged={loadEvents}
      />
    </div>
  );
}
