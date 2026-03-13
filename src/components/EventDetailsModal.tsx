import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Clock, Video, User, Trash2, Users, UserPlus, UserMinus } from "lucide-react";
import { UserLink } from "@/components/UserLink";

export interface EventDetails {
  id: string;
  title: string;
  description: string | null;
  zoom_link: string | null;
  start_time: string;
  end_time: string;
  user_id: string;
  organizer_name: string | null;
  organizer_avatar: string | null;
  participant_count: number;
  is_participating: boolean;
}

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: EventDetails | null;
  onEventDeleted: () => void;
  onParticipationChanged: () => void;
}

export function EventDetailsModal({ open, onClose, event, onEventDeleted, onParticipationChanged }: EventDetailsModalProps) {
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);

  if (!event) return null;

  const isOwner = user?.id === event.user_id;

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;
    const { error } = await supabase.from("events").delete().eq("id", event.id);
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      toast.success("Evento deletado!");
      onEventDeleted();
      onClose();
    }
  };

  const handleJoin = async () => {
    if (!user) return;
    setJoining(true);
    const { error } = await supabase.from("event_participants").insert({
      event_id: event.id,
      user_id: user.id,
    });
    setJoining(false);
    if (error) {
      toast.error("Erro ao participar: " + error.message);
    } else {
      toast.success("Participação confirmada!");
      onParticipationChanged();
      onClose();
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setJoining(true);
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", event.id)
      .eq("user_id", user.id);
    setJoining(false);
    if (error) {
      toast.error("Erro ao cancelar participação: " + error.message);
    } else {
      toast.success("Participação cancelada.");
      onParticipationChanged();
      onClose();
    }
  };

  const fmt = (d: string) => new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {event.organizer_name && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Organizador: <UserLink userId={event.user_id} name={event.organizer_name} className="font-semibold text-foreground" /></span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span><strong className="text-foreground">{event.participant_count}</strong> participante{event.participant_count !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{fmt(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Até {fmt(event.end_time)}</span>
          </div>
          {event.description && (
            <p className="text-sm text-foreground leading-relaxed">{event.description}</p>
          )}
          {event.zoom_link && (
            <a
              href={event.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Video className="h-4 w-4" />
              Entrar na reunião Zoom
            </a>
          )}
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          {!isOwner && !event.is_participating && (
            <Button onClick={handleJoin} disabled={joining} className="gap-1">
              <UserPlus className="h-4 w-4" />
              {joining ? "Entrando..." : "Participar"}
            </Button>
          )}
          {!isOwner && event.is_participating && (
            <Button variant="secondary" onClick={handleLeave} disabled={joining} className="gap-1">
              <UserMinus className="h-4 w-4" />
              {joining ? "Saindo..." : "Cancelar participação"}
            </Button>
          )}
          {isOwner && (
            <Button variant="destructive" onClick={handleDelete} className="gap-1">
              <Trash2 className="h-4 w-4" />
              Deletar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
