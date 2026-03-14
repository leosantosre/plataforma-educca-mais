import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Users, User, Menu, X, Shield, ShieldOff } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";

import { NotificationBell } from "@/components/NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const { isAdmin, adminMode, toggleAdminMode } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const handleLoginClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById("auth-card")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-1.5 shrink-0">
          <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 779 622" className="h-6 w-auto -my-1" aria-label="Educca+">
            <path fill="#251d18" d="m93.96 272.59c-0.84 0.27-2.64 2.39-4 4.7l-2.46 4.21c-0.9 247.97-1.25 274.65-2.3 275.7-1 1-9.83 1.42-38.35 1.8-35.77 0.48-37.09 0.57-38.1 2.5-0.65 1.24-0.84 6.02-0.51 12.5 0.49 9.48 0.89 11.2 4.15 17.75 1.99 3.99 5.52 9.11 7.86 11.38 2.34 2.28 6.5 5.66 9.25 7.51l5 3.37 711 0.07c10.08-7.19 14.25-10.7 15.78-12.43 1.54-1.73 4.35-6.19 6.25-9.9 3.11-6.04 3.54-7.88 4.12-17.5 0.42-6.86 0.27-11.47-0.4-12.75-1.01-1.93-2.33-2.02-38.56-2.5-20.64-0.27-37.74-0.72-38.01-1-0.27-0.27-0.79-32.45-1.16-71.5-0.65-68.93-0.73-71.06-2.65-73-1.1-1.11-4.06-2.31-6.67-2.69-2.59-0.38-8.07-0.71-12.2-0.74-4.12-0.02-8.4 0.18-9.5 0.46-1.1 0.28-3.12 2.41-4.5 4.74l-2.5 4.23-1 105c-477.8 0-526.64-0.24-527.7-1.3-1.05-1.05-1.4-25.16-1.8-123.89l-0.5-122.59c-4.56-3.49-7.13-3.9-17-4.23-6.6-0.22-12.69-0.17-13.54 0.1z"/>
            <path fill="none" stroke="#f97415" strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" d="m661.77 194.68c5.13-2.26 9.48-5.98 12.52-10.69 3.04-4.71 4.62-10.21 4.57-15.82-0.06-5.6-1.76-11.07-4.9-15.72-3.13-4.64-7.56-8.27-12.73-10.43l-245.58-111.85c-3.72-1.7-7.61-2.99-11.61-3.86-4-0.87-8.08-1.31-12.17-1.31-4.09 0-8.17 0.44-12.16 1.31-4 0.87-7.9 2.16-11.62 3.86l-245.54 111.74c-5.1 2.23-9.44 5.9-12.49 10.57-3.04 4.66-4.67 10.1-4.67 15.67 0 5.57 1.63 11.02 4.67 15.68 3.05 4.66 7.39 8.33 12.49 10.57l245.54 111.97c3.72 1.7 7.62 2.99 11.62 3.86 3.99 0.87 8.07 1.31 12.16 1.31 4.09 0 8.17-0.44 12.17-1.31 4-0.87 7.89-2.16 11.61-3.86z"/>
            <path fill="none" stroke="#f97415" strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" fillRule="evenodd" d="m678.39 169.37v173.22"/>
            <path fill="none" stroke="#f97415" strokeLinecap="round" strokeLinejoin="round" strokeWidth="30" fillRule="evenodd" d="m219.96 239.9v100.28c0 22.79 18.12 44.66 50.36 60.78 32.23 16.12 75.96 25.17 121.55 25.17 45.6 0 89.32-9.05 121.56-25.17 32.24-16.12 50.35-37.99 50.35-60.78v-100.28"/>
          </svg>
          <span className="font-serif text-xl font-bold text-foreground">Educca<span className="text-primary">+</span></span>
        </Link>

        {/* Desktop nav */}
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
            </>
          )}
        </nav>

        <div className="flex items-center gap-1">
          {user ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <button
                  onClick={toggleAdminMode}
                  className={`p-2 rounded-full transition-colors ${adminMode ? "bg-destructive/10 text-destructive" : "hover:bg-accent text-muted-foreground"}`}
                  aria-label="Modo admin"
                  title={adminMode ? "Desativar modo admin" : "Ativar modo admin"}
                >
                  {adminMode ? <Shield className="h-5 w-5" /> : <ShieldOff className="h-5 w-5" />}
                </button>
              )}
              <NotificationBell />

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full hover:bg-accent transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden md:flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent transition-colors cursor-pointer outline-none">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="" className="h-8 w-8 rounded-full ring-2 ring-primary/20" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-primary/20">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer gap-2">
                    <User className="h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={handleLoginClick} size="sm">
              Entrar
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t bg-card">
          <nav className="container py-3 flex flex-col gap-4">
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Users className="h-4 w-4" />
              Comunidade
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
            >
              <User className="h-4 w-4" />
              Perfil
            </Link>
            <button
              onClick={() => { setMobileOpen(false); handleLogout(); }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
