import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, GraduationCap, Users, UserCircle } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";

export function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-serif text-xl font-bold text-foreground">Educca<span className="text-primary">+</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {user && (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Dashboard
              </Link>
              <Link to="/community" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <Users className="h-4 w-4" />
                Comunidade
              </Link>
              <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                <UserCircle className="h-4 w-4" />
                Perfil
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <NotificationBell />
              {user.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="" className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
              )}
              <span className="hidden sm:block text-sm font-medium text-foreground">
                {user.user_metadata?.full_name || user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button onClick={signInWithGoogle} size="sm">
              Entrar com Google
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
