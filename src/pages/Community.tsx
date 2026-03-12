import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, MessageSquare } from "lucide-react";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { PostDetail } from "@/components/community/PostDetail";

interface PostListItem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  comment_count: number;
  profile?: { full_name: string | null; avatar_url: string | null };
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);

    const [postsRes, commentsRes] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("comments").select("id, post_id"),
    ]);

    if (postsRes.error) {
      setLoading(false);
      return;
    }

    const postsData = postsRes.data || [];
    const commentsData = commentsRes.data || [];

    // Count comments per post
    const countMap = new Map<string, number>();
    for (const c of commentsData) {
      countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1);
    }

    // Fetch profiles
    const userIds = [...new Set(postsData.map((p) => p.user_id))];
    const { data: profiles } = userIds.length > 0
      ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", userIds)
      : { data: [] };

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const mapped: PostListItem[] = postsData.map((p) => ({
      ...p,
      comment_count: countMap.get(p.id) || 0,
      profile: profileMap.get(p.user_id) || undefined,
    }));

    setPosts(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();

    const channel = supabase
      .channel("community-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => loadPosts())
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => loadPosts())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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

  if (selectedPostId) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-8 max-w-3xl">
          <PostDetail postId={selectedPostId} onBack={() => { setSelectedPostId(null); loadPosts(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Comunidade</h1>
          <Button size="sm" onClick={() => setCreateOpen(true)} className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Discussão
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">Nenhuma discussão ainda</h2>
            <p className="text-sm text-muted-foreground">Seja o primeiro a criar uma discussão!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <button
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="w-full text-left rounded-xl border bg-card p-5 shadow-card hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {post.profile?.avatar_url ? (
                    <img src={post.profile.avatar_url} alt="" className="h-9 w-9 rounded-full shrink-0 mt-0.5" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-muted shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{post.profile?.full_name || "Usuário"}</span>
                      <span>· {timeAgo(post.created_at)}</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {post.comment_count}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} onPostCreated={loadPosts} />
    </div>
  );
}
