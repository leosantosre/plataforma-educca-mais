import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, MessageSquare, Search, SlidersHorizontal, X } from "lucide-react";
import { UserLink } from "@/components/UserLink";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { PostDetail } from "@/components/community/PostDetail";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostListItem {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  comment_count: number;
  profile?: { full_name: string | null; avatar_url: string | null };
}

type PeriodFilter = "all" | "hour" | "today" | "week" | "month" | "year";

const periodLabels: Record<PeriodFilter, string> = {
  hour: "Da última hora",
  today: "Hoje",
  week: "Última semana",
  month: "Último mês",
  year: "Último ano",
  all: "Desde sempre",
};

function getPeriodDate(period: PeriodFilter): Date | null {
  const now = new Date();
  switch (period) {
    case "hour":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "week":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "month":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "year":
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case "all":
    default:
      return null;
  }
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [commentTexts, setCommentTexts] = useState<Map<string, string[]>>(new Map());

  const loadPosts = async () => {
    setLoading(true);

    const [postsRes, commentsRes] = await Promise.all([
      supabase.from("posts").select("*").order("created_at", { ascending: false }),
      supabase.from("comments").select("id, post_id, content"),
    ]);

    if (postsRes.error) {
      setLoading(false);
      return;
    }

    const postsData = postsRes.data || [];
    const commentsData = commentsRes.data || [];

    const countMap = new Map<string, number>();
    const commentsByPost = new Map<string, string[]>();
    for (const c of commentsData) {
      countMap.set(c.post_id, (countMap.get(c.post_id) || 0) + 1);
      const arr = commentsByPost.get(c.post_id) || [];
      arr.push((c.content || "").toLowerCase());
      commentsByPost.set(c.post_id, arr);
    }

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
    setCommentTexts(commentsByPost);
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

  const filteredPosts = useMemo(() => {
    let result = posts;

    // Filter by period
    const periodDate = getPeriodDate(period);
    if (periodDate) {
      result = result.filter((p) => new Date(p.created_at) >= periodDate);
    }

    // Filter by search
    const term = search.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.content.toLowerCase().includes(term) ||
          (commentTexts.get(p.id) || []).some((c) => c.includes(term))
      );
    }

    return result;
  }, [posts, search, period, commentTexts]);

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

        {/* Search and filter bar */}
        <div className="flex items-center gap-2 mb-5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar discussões..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={period !== "all" ? "default" : "outline"}
                size="sm"
                className="gap-1.5 shrink-0"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {period === "all" ? "Período" : periodLabels[period]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuRadioGroup value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
                {(Object.keys(periodLabels) as PeriodFilter[]).map((key) => (
                  <DropdownMenuRadioItem key={key} value={key}>
                    {periodLabels[key]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-medium text-foreground mb-1">
              {search || period !== "all" ? "Nenhuma discussão encontrada" : "Nenhuma discussão ainda"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {search || period !== "all"
                ? "Tente ajustar os filtros ou termos de pesquisa."
                : "Seja o primeiro a criar uma discussão!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
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
