import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Trash2, MessageSquare } from "lucide-react";
import { UserLink } from "@/components/UserLink";
import { CommentItem, CommentData } from "./CommentItem";

interface PostData {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

interface PostDetailProps {
  postId: string;
  onBack: () => void;
}

export function PostDetail({ postId, onBack }: PostDetailProps) {
  const { user } = useAuth();
  const { adminMode } = useAdmin();
  const [post, setPost] = useState<PostData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadPost = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (error || !data) {
      toast.error("Post não encontrado.");
      onBack();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", data.user_id)
      .single();

    setPost({ ...data, profile: profile || undefined });
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });

    if (error) return;

    const userIds = [...new Set((data || []).map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", userIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const commentsWithProfiles: CommentData[] = (data || []).map((c) => ({
      ...c,
      profile: profileMap.get(c.user_id) || undefined,
    }));

    // Organize into tree: top-level + replies
    const topLevel: CommentData[] = [];
    const replyMap = new Map<string, CommentData[]>();

    for (const c of commentsWithProfiles) {
      if (c.parent_id) {
        const existing = replyMap.get(c.parent_id) || [];
        existing.push(c);
        replyMap.set(c.parent_id, existing);
      } else {
        topLevel.push(c);
      }
    }

    for (const c of topLevel) {
      c.replies = replyMap.get(c.id) || [];
    }

    setComments(topLevel);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadPost(), loadComments()]).then(() => setLoading(false));

    const channel = supabase
      .channel(`comments-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, () => loadComments())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;
    if (newComment.trim().length > 2000) {
      toast.error("Comentário deve ter no máximo 2000 caracteres.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error("Erro ao comentar: " + error.message);
    } else {
      setNewComment("");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Deletar este post e todos os comentários?")) return;
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast.error("Erro ao deletar: " + error.message);
    } else {
      toast.success("Post deletado!");
      onBack();
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

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!post) return null;

  const totalComments = comments.reduce((sum, c) => sum + 1 + (c.replies?.length || 0), 0);

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-1 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </Button>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <div className="flex items-start gap-3">
          {post.profile?.avatar_url ? (
            <img src={post.profile.avatar_url} alt="" className="h-10 w-10 rounded-full shrink-0" />
          ) : (
            <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-xl font-bold text-foreground">{post.title}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <UserLink userId={post.user_id} name={post.profile?.full_name || null} />
              <span>· {timeAgo(post.created_at)}</span>
            </div>
            <p className="mt-4 text-foreground whitespace-pre-wrap break-words">{post.content}</p>
          </div>
          {(user?.id === post.user_id || adminMode) && (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive shrink-0" onClick={handleDeletePost}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-card">
        <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          {totalComments} comentário{totalComments !== 1 ? "s" : ""}
        </h2>

        <div className="flex flex-col gap-2 mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            rows={2}
            maxLength={2000}
            className="text-sm"
          />
          <Button onClick={handleAddComment} disabled={submitting || !newComment.trim()} className="self-start sm:self-end">
            {submitting ? "..." : "Comentar"}
          </Button>
        </div>

        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhum comentário ainda. Seja o primeiro!</p>
        ) : (
          <div className="divide-y divide-border">
            {comments.map((c) => (
              <CommentItem key={c.id} comment={c} postId={postId} onCommentChanged={loadComments} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
