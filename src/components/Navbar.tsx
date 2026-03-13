import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Calendar, Users, User, Menu, X } from "lucide-react";

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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="160 210 780 670" className="h-6 w-auto -my-1" aria-label="Educca+">
            <defs>
              <image width="756" height="377" id="img1"
                href="data:image/png;base64,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"/>
            </defs>
            <use href="#img1" x="180" y="492"/>
            <g transform="translate(290 220) scale(25)" stroke="#f97415" fill="none" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/>
              <path d="M22 10v6"/>
              <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>
            </g>
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
            <Button onClick={signInWithGoogle} size="sm">
              Entrar com Google
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && user && (
        <div className="md:hidden border-t bg-card">
          <nav className="container py-3 flex flex-col gap-1">
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
