import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Save, User } from "lucide-react";

const EDUCATION_LEVELS = [
  "Educação Infantil",
  "Educação Especial",
  "Ensino Fundamental (I e II)",
  "Ensino Médio",
  "Ensino Superior (Graduação)",
  "Pós-Graduação",
] as const;

export default function Profile() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [description, setDescription] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, description, education_level")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setFullName(data.full_name || "");
        setDescription((data as any).description || "");
        setEducationLevel((data as any).education_level || "");
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

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
        education_level: educationLevel || null,
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

            <div className="space-y-2">
              <Label htmlFor="educationLevel">Nível de escolaridade que leciona</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger id="educationLevel">
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
