import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Users,
  Video,
  ArrowRight,
  BookOpen,
  Shield,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const features = [
  {
    icon: Calendar,
    title: "Calendário Interativo",
    description:
      "Visualize todos os workshops em um calendário completo. Organize e gerencie seus eventos com facilidade.",
  },
  {
    icon: Video,
    title: "Videoconferência Integrada",
    description:
      "Adicione links de videoconferência diretamente nos seus eventos. Seus participantes terão acesso fácil às reuniões.",
  },
  {
    icon: Users,
    title: "Comunidade de Professores",
    description:
      "Conecte-se com outros educadores. Participe de workshops e amplie sua rede de conhecimento.",
  },
  {
    icon: BookOpen,
    title: "Gestão de Eventos",
    description:
      "Crie, edite e delete seus workshops com total controle. Gerencie tudo de forma simples e intuitiva.",
  },
  {
    icon: Shield,
    title: "Acesso Seguro",
    description:
      "Login rápido e seguro com sua conta Google. Seus dados protegidos com autenticação moderna.",
  },
  {
    icon: Zap,
    title: "Rápido e Responsivo",
    description:
      "Plataforma moderna e ágil que funciona em qualquer dispositivo, desktop ou mobile.",
  },
];

export default function Landing() {
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setInfoMessage(null);

    if (mode === "login") {
      if (!email || !password) {
        setEmailError("Preencha e-mail e senha para entrar.");
        return;
      }
    } else {
      if (!fullName.trim()) {
        setEmailError("Preencha seu nome completo.");
        return;
      }
      if (!email || !password || !confirmPassword) {
        setEmailError("Preencha todos os campos para criar sua conta.");
        return;
      }
      if (password.length < 6) {
        setEmailError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setEmailError("As senhas não conferem.");
        return;
      }
    }

    setEmailLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, fullName.trim());
        setInfoMessage(
          "Conta criada! Verifique seu e-mail para confirmar o acesso.",
        );
      }
    } catch (err: any) {
      setEmailError(
        err?.message ||
          (mode === "login"
            ? "Não foi possível entrar com e-mail e senha."
            : "Não foi possível criar sua conta."),
      );
    } finally {
      setEmailLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setEmailError(null);
    setInfoMessage(null);

    if (!email) {
      setEmailError("Informe seu e-mail para redefinir a senha.");
      return;
    }

    setResetLoading(true);
    try {
      await resetPassword(email);
      setInfoMessage(
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha.",
      );
    } catch (err: any) {
      setEmailError(
        err?.message ||
          "Não foi possível enviar o e-mail de redefinição de senha.",
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 landing-gradient opacity-[0.04]" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-5xl grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
            <div className="text-center lg:text-left">
              <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up">
                A plataforma de <span className="text-primary">workshops</span>{" "}
                para educadores
              </h1>
              <p
                className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0 animate-fade-up"
                style={{ animationDelay: "0.1s" }}
              >
                Crie e gerencie reuniões por videoconferência, organize seus
                eventos em um calendário interativo e conecte-se com outros
                professores na plataforma <strong>Educca+</strong>.
              </p>
              <div
                className="mt-10 flex flex-col sm:flex-row items-center lg:items-start lg:justify-start justify-center gap-4 animate-fade-up"
                style={{ animationDelay: "0.2s" }}
              >
                <Button
                  size="lg"
                  className="text-base px-8 gap-2"
                  onClick={signInWithGoogle}
                >
                  Entrar com Google
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base px-8"
                  onClick={() =>
                    document
                      .getElementById("features")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Saiba Mais
                </Button>
              </div>
            </div>

            <div
              className="w-full max-w-md mx-auto lg:mx-0 bg-card/80 border rounded-2xl shadow-card backdrop-blur-sm p-6 animate-fade-up lg:mt-4"
              id="auth-card"
            >
              <h2 className="font-serif text-xl font-semibold text-foreground mb-2">
                {mode === "login"
                  ? "Entrar com e-mail e senha"
                  : "Criar conta com e-mail e senha"}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {mode === "login"
                  ? "Use seu e-mail institucional para acessar a plataforma ou entre rapidamente com Google."
                  : "Crie sua conta usando e-mail e senha. Você também pode continuar usando o login com Google."}
              </p>
              <form className="space-y-4" onSubmit={handleEmailAuth}>
                {mode === "signup" && (
                  <div className="space-y-1">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Seu nome completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {mode === "signup" && (
                  <div className="space-y-1">
                    <Label htmlFor="confirm-password">Confirmar senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                )}
                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                    >
                      {resetLoading ? "Enviando..." : "Esqueci minha senha"}
                    </button>
                  </div>
                )}
                {emailError && (
                  <p className="text-sm text-destructive">{emailError}</p>
                )}
                {infoMessage && !emailError && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    {infoMessage}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={emailLoading}
                >
                  {emailLoading
                    ? mode === "login"
                      ? "Entrando..."
                      : "Criando conta..."
                    : mode === "login"
                      ? "Entrar com e-mail"
                      : "Criar conta"}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  {mode === "login" ? (
                    <>
                      Não tem conta?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium"
                        onClick={() => setMode("signup")}
                      >
                        Criar conta
                      </button>
                    </>
                  ) : (
                    <>
                      Já tem conta?{" "}
                      <button
                        type="button"
                        className="text-primary hover:underline font-medium"
                        onClick={() => setMode("login")}
                      >
                        Entrar
                      </button>
                    </>
                  )}
                </p>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      ou continue com
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={signInWithGoogle}
                >
                  Entrar com Google
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
              Tudo que você precisa para seus workshops
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
              Ferramentas poderosas e simples para professores que querem ir
              além.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-xl border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl landing-gradient px-8 py-16 text-center">
            <h2 className="font-serif text-3xl font-bold text-primary-foreground sm:text-4xl">
              Pronto para começar?
            </h2>
            <p className="mt-4 text-primary-foreground/80 text-lg max-w-lg mx-auto">
              Junte-se à comunidade de professores que já utilizam o Educca+
              para organizar seus workshops.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="mt-8 text-base px-8 gap-2"
              onClick={signInWithGoogle}
            >
              Entrar com Google
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Educca+. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
