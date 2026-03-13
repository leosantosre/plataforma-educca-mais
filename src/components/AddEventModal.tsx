import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video, Repeat, Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

type RecurrenceType = "none" | "daily" | "weekly";

const DAILY_MAX = 15;
const WEEKLY_MAX = 4;

const pad = (n: number) => n.toString().padStart(2, "0");

const formatDisplayDateTime = (date: Date) => {
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const parseDisplayDateTime = (value: string): Date | null => {
  if (!value) return null;

  const [datePart, timePart] = value.trim().split(" ");
  if (!datePart || !timePart) return null;

  const [dayStr, monthStr, yearStr] = datePart.split("/");
  const [hourStr, minuteStr] = timePart.split(":");

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);
  const hour = Number(hourStr);
  const minute = Number(minuteStr);

  if (
    [day, month, year, hour, minute].some((n) => Number.isNaN(n)) ||
    day < 1 ||
    day > 31 ||
    month < 1 ||
    month > 12 ||
    year < 1900 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

export function AddEventModal({ open, onClose, onEventAdded }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [recurrenceCount, setRecurrenceCount] = useState(2);
  const [includeWeekends, setIncludeWeekends] = useState(true);
  const [loading, setLoading] = useState(false);

  const maxCount = recurrence === "daily" ? DAILY_MAX : WEEKLY_MAX;

  const parsedStart = start ? parseDisplayDateTime(start) : null;
  const parsedEnd = end ? parseDisplayDateTime(end) : null;

  const handleStartChange = (value: string) => {
    setStart(value);
    const startDate = parseDisplayDateTime(value);
    if (startDate) {
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      setEnd(formatDisplayDateTime(endDate));
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

    const startDate = parseDisplayDateTime(start);
    const endDate = parseDisplayDateTime(end);

    if (!startDate) {
      toast.error("Data de início inválida. Use o formato DD/MM/AAAA HH:MM.");
      return;
    }

    if (!endDate) {
      toast.error("Data de término inválida. Use o formato DD/MM/AAAA HH:MM.");
      return;
    }

    if (endDate <= startDate) {
      toast.error("A data de término deve ser posterior à data de início.");
      return;
    }

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
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
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
            <div className="space-y-1">
              <Label htmlFor="start">Início</Label>
              <div className="relative">
                <Input
                  id="start"
                  type="text"
                  value={start}
                  onChange={(e) => handleStartChange(e.target.value)}
                  placeholder="DD/MM/AAAA HH:MM"
                  className="pr-10"
                  required
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2 space-y-2">
                      <Calendar
                        mode="single"
                        selected={parsedStart ?? undefined}
                        onSelect={(date) => {
                          if (!date) return;
                          const base = parsedStart ?? new Date();
                          const updated = new Date(date);
                          updated.setHours(base.getHours(), base.getMinutes(), 0, 0);
                          handleStartChange(formatDisplayDateTime(updated));
                        }}
                        disabled={(date) => date < new Date()}
                      />
                      <div className="flex items-center gap-2 border-t border-border pt-2">
                        <Label className="text-xs text-muted-foreground">Hora</Label>
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          value={parsedStart ? pad(parsedStart.getHours()) : ""}
                          onChange={(e) => {
                            const hour = Number(e.target.value);
                            if (Number.isNaN(hour) || hour < 0 || hour > 23) return;
                            const base = parsedStart ?? new Date();
                            const updated = new Date(base);
                            updated.setHours(hour);
                            handleStartChange(formatDisplayDateTime(updated));
                          }}
                          className="h-8 w-14 px-2 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={parsedStart ? pad(parsedStart.getMinutes()) : ""}
                          onChange={(e) => {
                            const minute = Number(e.target.value);
                            if (Number.isNaN(minute) || minute < 0 || minute > 59) return;
                            const base = parsedStart ?? new Date();
                            const updated = new Date(base);
                            updated.setMinutes(minute);
                            handleStartChange(formatDisplayDateTime(updated));
                          }}
                          className="h-8 w-14 px-2 text-xs"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="end">Término</Label>
              <div className="relative">
                <Input
                  id="end"
                  type="text"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  placeholder="DD/MM/AAAA HH:MM"
                  className="pr-10"
                  required
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      <CalendarIcon className="h-3.5 w-3.5" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="p-2 space-y-2">
                      <Calendar
                        mode="single"
                        selected={parsedEnd ?? undefined}
                        onSelect={(date) => {
                          if (!date) return;
                          const base = parsedEnd ?? parsedStart ?? new Date();
                          const updated = new Date(date);
                          updated.setHours(base.getHours(), base.getMinutes(), 0, 0);
                          setEnd(formatDisplayDateTime(updated));
                        }}
                        disabled={(date) => {
                          const minDate = parsedStart ?? new Date();
                          return date < minDate;
                        }}
                      />
                      <div className="flex items-center gap-2 border-t border-border pt-2">
                        <Label className="text-xs text-muted-foreground">Hora</Label>
                        <Input
                          type="number"
                          min={0}
                          max={23}
                          value={parsedEnd ? pad(parsedEnd.getHours()) : ""}
                          onChange={(e) => {
                            const hour = Number(e.target.value);
                            if (Number.isNaN(hour) || hour < 0 || hour > 23) return;
                            const base = parsedEnd ?? parsedStart ?? new Date();
                            const updated = new Date(base);
                            updated.setHours(hour);
                            setEnd(formatDisplayDateTime(updated));
                          }}
                          className="h-8 w-14 px-2 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">:</span>
                        <Input
                          type="number"
                          min={0}
                          max={59}
                          value={parsedEnd ? pad(parsedEnd.getMinutes()) : ""}
                          onChange={(e) => {
                            const minute = Number(e.target.value);
                            if (Number.isNaN(minute) || minute < 0 || minute > 59) return;
                            const base = parsedEnd ?? parsedStart ?? new Date();
                            const updated = new Date(base);
                            updated.setMinutes(minute);
                            setEnd(formatDisplayDateTime(updated));
                          }}
                          className="h-8 w-14 px-2 text-xs"
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
