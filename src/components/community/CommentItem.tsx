import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Trash2 } from "lucide-react";
import { UserLink } from "@/components/UserLink";

interface CommentProfile {
  full_name: string | null;
  avatar_url: string | null;
}

export interface CommentData {
  id: string;
  content: string;
  user_id: string;
  parent_id: string | null;
  created_at: string;
  profile?: CommentProfile;
  replies?: CommentData[];
}

interface CommentItemProps {
  comment: CommentData;
  postId: string;
  onCommentChanged: () => void;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, onCommentChanged, isReply = false }: CommentItemProps) {
  const { user } = useAuth();
  const { adminMode } = useAdmin();
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return;
    if (replyContent.trim().length > 2000) {
      toast.error("Resposta deve ter no máximo 2000 caracteres.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      parent_id: comment.id,
      user_id: user.id,
      content: replyContent.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao responder: " + error.message);
    } else {
      setReplyContent("");
      setReplying(false);
      onCommentChanged();
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deletar este comentário?")) return;
    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      onCommentChanged();
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  return (
    <div className={`${isReply ? "ml-8 border-l-2 border-border pl-4" : ""}`}>
      <div className="flex items-start gap-3 py-3">
        {comment.profile?.avatar_url ? (
          <img src={comment.profile.avatar_url} alt="" className="h-7 w-7 rounded-full shrink-0 mt-0.5" />
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <UserLink userId={comment.user_id} name={comment.profile?.full_name || null} className="font-medium text-foreground" />
            <span className="text-muted-foreground text-xs">· {timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground mt-1 whitespace-pre-wrap break-words">{comment.content}</p>
          <div className="flex items-center gap-2 mt-1.5">
            {!isReply && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground" onClick={() => setReplying(!replying)}>
                <MessageSquare className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}
            {(user?.id === comment.user_id || adminMode) && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive" onClick={handleDelete}>
                <Trash2 className="h-3 w-3 mr-1" />
                Deletar
              </Button>
            )}
          </div>
        </div>
      </div>

      {replying && (
        <div className="ml-10 mb-2 flex flex-col gap-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Sua resposta..."
            rows={2}
            maxLength={2000}
            className="text-sm"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleReply} disabled={submitting || !replyContent.trim()}>
              {submitting ? "..." : "Enviar"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {comment.replies?.map((reply) => (
        <CommentItem key={reply.id} comment={reply} postId={postId} onCommentChanged={onCommentChanged} isReply />
      ))}
    </div>
  );
}
