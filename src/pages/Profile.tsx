import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Save, User, GraduationCap, FileText, Trash2 } from "lucide-react";
import { ProfileWorkshops } from "@/components/profile/ProfileWorkshops";

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
  const navigate = useNavigate();
  const viewingUserId = userId || user?.id;
  const isOwnProfile = !userId || userId === user?.id;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [educationLevels, setEducationLevels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
          const metaFullName =
            d.full_name ||
            (user?.user_metadata as any)?.full_name ||
            (user?.user_metadata as any)?.name ||
            "";
          setFullName(metaFullName);
          setDescription(d.description || "");
          setEducationLevels(levels);
        }
      } else if (isOwnProfile && user) {
        // Perfil ainda não existe no banco: usar nome vindo do provedor (Google) ou cadastro
        const metaFullName =
          (user.user_metadata as any)?.full_name ||
          (user.user_metadata as any)?.name ||
          "";
        setFullName(metaFullName);
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
      .upsert(
        {
          id: user.id,
          full_name: trimmedName,
          description: trimmedDesc,
          education_level: educationLevels.length > 0 ? educationLevels.join(", ") : null,
        } as any,
        { onConflict: "id" }
      );

    setSaving(false);

    if (error) {
      toast.error("Erro ao salvar perfil.");
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) {
        toast.error("Erro ao encerrar conta.");
        setDeleting(false);
        return;
      }
      toast.success("Conta encerrada com sucesso.");
      await supabase.auth.signOut();
      navigate("/");
    } catch {
      toast.error("Erro ao encerrar conta.");
      setDeleting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Erro ao enviar imagem: " + uploadError.message);
        return;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from("avatars")
        .createSignedUrl(filePath, 60 * 60 * 24 * 7); // 7 dias

      if (signedError || !signedData?.signedUrl) {
        toast.error("Erro ao gerar URL da foto de perfil.");
        return;
      }

      const signedUrl = signedData.signedUrl;

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            avatar_url: signedUrl,
          } as any,
          { onConflict: "id" }
        );

      if (profileError) {
        toast.error("Erro ao salvar foto de perfil: " + profileError.message);
        return;
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: signedUrl },
      });

      if (authError) {
        toast.error("Erro ao atualizar dados de usuário: " + authError.message);
        return;
      }

      setProfile((prev) =>
        prev ? { ...prev, avatar_url: signedUrl } : { full_name, avatar_url: signedUrl, description, education_level: educationLevels.join(", ") || null }
      );

      toast.success("Foto de perfil atualizada!");
    } catch (err: any) {
      toast.error("Erro ao atualizar foto de perfil: " + (err.message || "Erro desconhecido"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
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
        <main className="container max-w-2xl py-10 space-y-6">
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

          <ProfileWorkshops profileUserId={viewingUserId!} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-10 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="relative">
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload" className="cursor-pointer group block">
                <Avatar className="h-16 w-16 ring-2 ring-primary/10 group-hover:ring-primary/40 transition">
                  <AvatarImage src={profile?.avatar_url || user?.user_metadata?.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition text-[11px] text-white">
                  {avatarUploading ? "Enviando..." : "Trocar foto"}
                </div>
              </label>
            </div>
            <div>
              <CardTitle className="text-2xl">Meu Perfil</CardTitle>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {fullName && (
                <p className="text-sm text-foreground mt-1">{fullName}</p>
              )}
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

        <Card className="border-destructive/30">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-destructive mb-2">Zona de perigo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ao encerrar sua conta, todos os seus dados serão permanentemente removidos. Esta ação não pode ser desfeita.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Encerrar minha conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tem certeza que deseja encerrar sua conta?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os seus dados, eventos e publicações serão permanentemente removidos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Encerrando..." : "Sim, encerrar conta"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
