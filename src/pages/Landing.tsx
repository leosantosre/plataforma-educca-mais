import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Video, ArrowRight, BookOpen, Shield, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const features = [
  {
    icon: Calendar,
    title: "Calendário Interativo",
    description: "Visualize todos os workshops em um calendário completo. Organize e gerencie seus eventos com facilidade.",
  },
  {
    icon: Video,
    title: "Integração com Zoom",
    description: "Adicione links do Zoom diretamente nos seus eventos. Seus participantes terão acesso fácil às reuniões.",
  },
  {
    icon: Users,
    title: "Comunidade de Professores",
    description: "Conecte-se com outros educadores. Participe de workshops e amplie sua rede de conhecimento.",
  },
  {
    icon: BookOpen,
    title: "Gestão de Eventos",
    description: "Crie, edite e delete seus workshops com total controle. Gerencie tudo de forma simples e intuitiva.",
  },
  {
    icon: Shield,
    title: "Acesso Seguro",
    description: "Login rápido e seguro com sua conta Google. Seus dados protegidos com autenticação moderna.",
  },
  {
    icon: Zap,
    title: "Rápido e Responsivo",
    description: "Plataforma moderna e ágil que funciona em qualquer dispositivo, desktop ou mobile.",
  },
];

export default function Landing() {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 landing-gradient opacity-[0.04]" />
        <div className="container relative py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl animate-fade-up">
              A plataforma de{" "}
              <span className="text-primary">workshops</span>{" "}
              para educadores
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: "0.1s" }}>
              Crie e gerencie reuniões via Zoom, organize seus eventos em um calendário interativo
              e conecte-se com outros professores na plataforma <strong>Educca+</strong>.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" className="text-base px-8 gap-2" onClick={signInWithGoogle}>
                Começar Agora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                Saiba Mais
              </Button>
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
            <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
              Ferramentas poderosas e simples para professores que querem ir além.
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
                <h3 className="font-serif text-xl font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{f.description}</p>
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
              Junte-se à comunidade de professores que já utilizam o Educca+ para organizar seus workshops.
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
