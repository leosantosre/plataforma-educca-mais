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
import { Plus, RefreshCw } from "lucide-react";

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
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const calendarRef = useRef<FullCalendar>(null);

  const loadEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .select("*, profiles:user_id(full_name, avatar_url)");

    if (!error && data) {
      const mapped: CalendarEvent[] = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        start: e.start_time,
        end: e.end_time,
        classNames: [e.user_id === user?.id ? "fc-event-own" : "fc-event-other"],
        extendedProps: {
          description: e.description,
          zoom_link: e.zoom_link,
          user_id: e.user_id,
          organizer_name: e.profiles?.full_name || null,
          organizer_avatar: e.profiles?.avatar_url || null,
        },
      }));
      setEvents(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEventClick = (info: any) => {
    const props = info.event.extendedProps;
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start_time: info.event.startStr,
      end_time: info.event.endStr,
      description: props.description,
      zoom_link: props.zoom_link,
      user_id: props.user_id,
      organizer_name: props.organizer_name,
      organizer_avatar: props.organizer_avatar,
    });
    setDetailsOpen(true);
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
            events={events}
            eventClick={handleEventClick}
            editable={false}
            dayMaxEvents={3}
            aspectRatio={1.6}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
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
      />
    </div>
  );
}
