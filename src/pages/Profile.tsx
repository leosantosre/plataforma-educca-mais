import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Save, User, GraduationCap, FileText } from "lucide-react";

const EDUCATION_LEVELS = [
  "Educação Infantil",
  "Educação Especial",
  "Ensino Fundamental (I e II)",
  "Ensino Médio",
  "Ensino Superior (Graduação)",
  "Pós-Graduação",
] as const;

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  description: string | null;
  education_level: string | null;
}

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const viewingUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [educationLevels, setEducationLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!viewingUserId) return;

    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, description, education_level")
        .eq("id", viewingUserId)
        .single();

      if (!error && data) {
        const d = data as any;
        const rawLevel = d.education_level || "";
        const levels = rawLevel ? rawLevel.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        setProfile({ full_name: d.full_name, avatar_url: d.avatar_url, description: d.description, education_level: d.education_level });
        if (isOwnProfile) {
          setFullName(d.full_name || "");
          setDescription(d.description || "");
          setEducationLevels(levels);
        }
      }
      setLoading(false);
    };

    fetchProfile();
  }, [viewingUserId, isOwnProfile]);

  const handleSave = async () => {
    if (!user) return;

    const trimmedName = fullName.trim();
    const trimmedDesc = description.trim();

    if (!trimmedName) {
      toast.error("O nome não pode estar vazio.");
      return;
    }
    if (trimmedName.length > 100) {
      toast.error("O nome deve ter no máximo 100 caracteres.");
      return;
    }
    if (trimmedDesc.length > 500) {
      toast.error("A descrição deve ter no máximo 500 caracteres.");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        description: trimmedDesc,
        education_level: educationLevels.length > 0 ? educationLevels.join(", ") : null,
      } as any)
      .eq("id", user.id);

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // View-only profile for other users
  if (!isOwnProfile && profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container max-w-2xl py-10">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.full_name || "Usuário"}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.description && (
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground whitespace-pre-wrap">{profile.description}</p>
                </div>
              )}
              {profile.education_level && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-foreground">{profile.education_level}</span>
                </div>
              )}
              {!profile.description && !profile.education_level && (
                <p className="text-sm text-muted-foreground">Este usuário ainda não preencheu seu perfil.</p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-10">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Meu Perfil</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/500
              </p>
            </div>

            <div className="space-y-3">
              <Label>Nível de escolaridade que leciona</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {EDUCATION_LEVELS.map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={educationLevels.includes(level)}
                      onCheckedChange={(checked) => {
                        setEducationLevels((prev) =>
                          checked ? [...prev, level] : prev.filter((l) => l !== level)
                        );
                      }}
                    />
                    <span className="text-sm">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
