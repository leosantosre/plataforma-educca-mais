import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Repeat } from "lucide-react";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

type RecurrenceType = "none" | "daily" | "weekly";

const DAILY_MAX = 15;
const WEEKLY_MAX = 4;

export function AddEventModal({ open, onClose, onEventAdded }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [recurrenceCount, setRecurrenceCount] = useState(2);
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [loading, setLoading] = useState(false);

  const now = useMemo(() => {
    const d = new Date();
    d.setSeconds(0, 0);
    return d.toISOString().slice(0, 16);
  }, [open]);

  const maxCount = recurrence === "daily" ? DAILY_MAX : WEEKLY_MAX;

  const handleStartChange = (value: string) => {
    setStart(value);
    if (value) {
      const startDate = new Date(value);
      startDate.setHours(startDate.getHours() + 1);
      const endValue = new Date(startDate.getTime() - startDate.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setEnd(endValue);
    }
  };

  const handleRecurrenceChange = (value: RecurrenceType) => {
    setRecurrence(value);
    if (value === "daily") setRecurrenceCount(Math.min(recurrenceCount, DAILY_MAX));
    if (value === "weekly") setRecurrenceCount(Math.min(recurrenceCount, WEEKLY_MAX));
    if (value === "none") setRecurrenceCount(2);
  };

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 2) setRecurrenceCount(2);
    else if (val > maxCount) setRecurrenceCount(maxCount);
    else setRecurrenceCount(val);
  };

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
          recurrence_count: recurrence !== "none" ? recurrenceCount : undefined,
          include_weekends: recurrence === "daily" ? includeWeekends : undefined,
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
    setRecurrenceCount(2);
    setIncludeWeekends(true);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Novo evento</DialogTitle>
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

          {/* Recurrence */}
          <div className="space-y-3 rounded-lg border border-border p-3">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <Repeat className="h-3.5 w-3.5" />
              Recorrência
            </Label>
            <Select value={recurrence} onValueChange={(v) => handleRecurrenceChange(v as RecurrenceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem recorrência</SelectItem>
                <SelectItem value="daily">Diária</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
              </SelectContent>
            </Select>

            {recurrence !== "none" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="recurrence-count" className="text-xs text-muted-foreground">
                    {recurrence === "daily"
                      ? `Quantidade de dias (máx. ${DAILY_MAX})`
                      : `Quantidade de semanas (máx. ${WEEKLY_MAX})`}
                  </Label>
                  <Input
                    id="recurrence-count"
                    type="number"
                    min={2}
                    max={maxCount}
                    value={recurrenceCount}
                    onChange={handleCountChange}
                    className="mt-1"
                  />
                </div>

                {recurrence === "daily" && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="include-weekends"
                      checked={includeWeekends}
                      onCheckedChange={(checked) => setIncludeWeekends(checked === true)}
                    />
                    <Label htmlFor="include-weekends" className="text-sm font-normal cursor-pointer">
                      Incluir finais de semana
                    </Label>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Serão criados {recurrenceCount} eventos no total
                  {recurrence === "daily" && !includeWeekends && " (pulando sábados e domingos)"}
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col-reverse gap-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Criando..."
                : recurrence !== "none"
                  ? `Criar ${recurrenceCount} Workshops`
                  : "Criar Workshop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
