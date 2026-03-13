import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Repeat } from "lucide-react";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

type RecurrenceType = "none" | "daily" | "weekly";

export function AddEventModal({ open, onClose, onEventAdded }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [loading, setLoading] = useState(false);

  const now = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }, [open]);

  const handleStartChange = (value: string) => {
    setStart(value);
    // Auto-fill end with same date, 1 hour later
    if (value) {
      const startDate = new Date(value);
      startDate.setHours(startDate.getHours() + 1);
      const endValue = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEnd(endValue);
    }
  };

  const recurrenceLabel = useMemo(() => {
    if (recurrence === "daily") return "Diária (máx. 15 dias)";
    if (recurrence === "weekly") return "Semanal (máx. 4 semanas)";
    return "Sem recorrência";
  }, [recurrence]);

  const occurrenceCount = useMemo(() => {
    if (recurrence === "none") return 1;
    if (recurrence === "daily") return 15;
    if (recurrence === "weekly") return 4;
    return 1;
  }, [recurrence]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const startDate = new Date(start);
    if (startDate < new Date()) {
      toast.error("A data de início não pode ser anterior à data atual.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-zoom-meeting", {
        body: {
          title,
          description: description || null,
          start_time: new Date(start).toISOString(),
          end_time: new Date(end).toISOString(),
          recurrence: recurrence !== "none" ? recurrence : undefined,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erro ao criar evento: " + (error.message || JSON.stringify(error)));
      } else {
        const count = data?.events_created || 1;
        toast.success(
          count > 1
            ? `${count} workshops criados com reuniões Zoom!`
            : "Workshop criado com reunião Zoom!"
        );
        resetForm();
        onEventAdded();
        onClose();
      }
    } catch (err: any) {
      console.error("Catch error:", err);
      toast.error("Erro ao criar evento: " + (err.message || "Erro desconhecido"));
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStart("");
    setEnd("");
    setRecurrence("none");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Novo Workshop</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título do evento</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Workshop de React" />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva seu workshop..." rows={3} />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            <Video className="h-4 w-4 text-primary" />
            O link do Zoom será criado automaticamente
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start">Início</Label>
              <Input
                id="start"
                type="datetime-local"
                value={start}
                onChange={(e) => handleStartChange(e.target.value)}
                min={now}
                required
              />
            </div>
            <div>
              <Label htmlFor="end">Término</Label>
              <Input
                id="end"
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                min={start || now}
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="recurrence" className="flex items-center gap-1.5">
              <Repeat className="h-3.5 w-3.5" />
              Recorrência
            </Label>
            <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
              <SelectTrigger id="recurrence" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem recorrência</SelectItem>
                <SelectItem value="daily">Diária (máx. 15 dias)</SelectItem>
                <SelectItem value="weekly">Semanal (máx. 4 semanas)</SelectItem>
              </SelectContent>
            </Select>
            {recurrence !== "none" && (
              <p className="mt-1 text-xs text-muted-foreground">
                Serão criados {occurrenceCount} eventos no total
              </p>
            )}
          </div>
          <DialogFooter className="flex-col-reverse gap-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : recurrence !== "none" ? `Criar ${occurrenceCount} Workshops` : "Criar Workshop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
