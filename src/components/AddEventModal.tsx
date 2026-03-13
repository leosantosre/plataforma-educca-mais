import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Video } from "lucide-react";

interface AddEventModalProps {
  open: boolean;
  onClose: () => void;
  onEventAdded: () => void;
}

export function AddEventModal({ open, onClose, onEventAdded }: AddEventModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-zoom-meeting", {
        body: {
          title,
          description: description || null,
          start_time: new Date(start).toISOString(),
          end_time: new Date(end).toISOString(),
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erro ao criar evento: " + (error.message || JSON.stringify(error)));
      } else {
        console.log("Event created successfully:", data);
        toast.success("Workshop criado com reunião Zoom!");
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
              <Input id="start" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="end">Término</Label>
              <Input id="end" type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-4 sm:flex-row">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Workshop"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
