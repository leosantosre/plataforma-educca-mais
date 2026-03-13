import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Calendar, Clock, Users, UserPlus, UserMinus, Video } from "lucide-react";

interface WorkshopEvent {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  zoom_link: string | null;
  participant_count: number;
  is_participating: boolean;
}

interface ProfileWorkshopsProps {
  profileUserId: string;
}

export function ProfileWorkshops({ profileUserId }: ProfileWorkshopsProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<WorkshopEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);

    const [eventsRes, participantsRes] = await Promise.all([
      supabase.from("events").select("*").eq("user_id", profileUserId),
      supabase.from("event_participants").select("*"),
    ]);

    if (eventsRes.error) {
      setLoading(false);
      return;
    }

    const eventsData = eventsRes.data || [];
    const participantsData = participantsRes.data || [];

    const countMap = new Map<string, number>();
    const userParticipation = new Set<string>();
    for (const p of participantsData) {
      countMap.set(p.event_id, (countMap.get(p.event_id) || 0) + 1);
      if (p.user_id === user?.id) userParticipation.add(p.event_id);
    }

    const mapped: WorkshopEvent[] = eventsData.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      start_time: e.start_time,
      end_time: e.end_time,
      zoom_link: e.zoom_link,
      participant_count: (countMap.get(e.id) || 0) + 1,
      is_participating: userParticipation.has(e.id),
    }));

    // Sort by start_time descending for past, ascending for upcoming
    mapped.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    setEvents(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadEvents();
  }, [profileUserId]);

  const handleJoin = async (eventId: string) => {
    if (!user) return;
    setJoiningId(eventId);
    const { error } = await supabase.from("event_participants").insert({
      event_id: eventId,
      user_id: user.id,
    });
    setJoiningId(null);
    if (error) {
      toast.error("Erro ao participar: " + error.message);
    } else {
      toast.success("Participação confirmada!");
      loadEvents();
    }
  };

  const handleLeave = async (eventId: string) => {
    if (!user) return;
    setJoiningId(eventId);
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", user.id);
    setJoiningId(null);
    if (error) {
      toast.error("Erro ao cancelar participação: " + error.message);
    } else {
      toast.success("Participação cancelada.");
      loadEvents();
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  const now = new Date();
  const upcoming = events.filter((e) => new Date(e.end_time) >= now);
  const past = events.filter((e) => new Date(e.end_time) < now).reverse();

  const isOwnProfile = user?.id === profileUserId;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted-foreground text-center">
            Este usuário ainda não organizou nenhum workshop.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderEventCard = (event: WorkshopEvent, showActions: boolean) => (
    <div
      key={event.id}
      className="rounded-lg border bg-card p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-foreground">{event.title}</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Users className="h-3.5 w-3.5" />
          <span>{event.participant_count}</span>
        </div>
      </div>

      {event.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {fmt(event.start_time)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          Até {fmt(event.end_time)}
        </span>
      </div>

      {event.zoom_link && (
        <a
          href={event.zoom_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Video className="h-3.5 w-3.5" />
          Entrar na reunião Zoom
        </a>
      )}

      {showActions && !isOwnProfile && (
        <div className="pt-1">
          {!event.is_participating ? (
            <Button
              size="sm"
              onClick={() => handleJoin(event.id)}
              disabled={joiningId === event.id}
              className="gap-1"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {joiningId === event.id ? "Entrando..." : "Participar"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleLeave(event.id)}
              disabled={joiningId === event.id}
              className="gap-1"
            >
              <UserMinus className="h-3.5 w-3.5" />
              {joiningId === event.id ? "Saindo..." : "Cancelar participação"}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximos Workshops</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((e) => renderEventCard(e, true))}
          </CardContent>
        </Card>
      )}

      {past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Workshops realizados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {past.map((e) => renderEventCard(e, false))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
