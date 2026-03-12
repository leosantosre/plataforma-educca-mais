import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export function CreatePostModal({ open, onClose, onPostCreated }: CreatePostModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle || trimmedTitle.length > 200) {
      toast.error("O título deve ter entre 1 e 200 caracteres.");
      return;
    }
    if (!trimmedContent || trimmedContent.length > 5000) {
      toast.error("O conteúdo deve ter entre 1 e 5000 caracteres.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("posts").insert({
      title: trimmedTitle,
      content: trimmedContent,
      user_id: user.id,
    });
    setLoading(false);

    if (error) {
      toast.error("Erro ao criar post: " + error.message);
    } else {
      toast.success("Post criado!");
      setTitle("");
      setContent("");
      onPostCreated();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Nova Discussão</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="post-title">Assunto</Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Ex: Melhores práticas de estudo"
            />
          </div>
          <div>
            <Label htmlFor="post-content">Descrição</Label>
            <Textarea
              id="post-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              maxLength={5000}
              placeholder="Descreva o tema da discussão..."
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
