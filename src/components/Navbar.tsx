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
          <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 779 622" className="h-6 w-auto -my-1" aria-label="Educca+">
            <defs>
              <image width="39" height="141" id="nav-logo-img" href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAACNCAMAAAAD+pOPAAAAAXNSR0IB2cksfwAAAKJQTFRFAAAAJBwYJh0XJB0YJR0YJR4YJR0YJRwYJh0ZJh4YJR0ZKBwXJB0ZJR0YJR0YJR0YJh0ZJR0YJR4YKBsbJR0YJR0YJB0YJR0YJRwYICAgJR0YJRwYIiIRJR0YLhcXGhoaHBwcJCQkKioqMzMAQAAAAAAAAAAAAAAAJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR0YJR4YJR0YipDPFwAAADZ0Uk5TAD9XjYKswLycgGgthv/rnj1gkiadzJNhiAjldQ/wCwoJBwYFBAMCAf79/Pv6+fj39vX08/LxMGEX9AAAAOlJREFUeJzt18cKQjEQBdBkISLqQkRE7L13/f/fsPfesSHiwldEVNCXReCK5m6GgQNDJtmEEjVUCXmI0lJ6uHVqMT2RF765O8vlHZOjW92c9fyJEaJfqM52+uyIYSY7+1GDEWKUnIPuNJ0817nVZpJzKefWdu9X9+zMLIxQzxrjvCuM8y0xzrHHONZ34F/wdYE5xgVn3+1CU76O9X7DE4yLjDEuOuLrWPf8My42xLj4AOMSfYxL9jAu1cW4dAfjMm2+LtvCuFwT4/INjCvU+bpiDeNKVYwrV/g6N8s3RTjhhBNOOOGE+yN3BXLAjYGv+eB0AAAAAElFTkSuQmCC"/>
            </defs>
            <path fill="#251d18" d="m92.98 244.99c-0.83 0.55-2.53 2.92-3.77 5.26l-2.26 4.25c0.5 273.38 0.31 301.64-0.75 302.7-1.02 1.02-9.37 1.3-38.79 1.3-32.2 0-37.62 0.21-38.49 1.5-0.58 0.86-0.87 6.37-0.68 13 0.18 6.33 0.8 12.4 1.39 13.5 0.59 1.1 1.93 3.8 2.97 5.99 1.05 2.2 2.43 4.67 3.08 5.5 0.65 0.83 2.45 3.03 4 4.88 1.55 1.86 5.52 5.14 8.82 7.29l6 3.91h711c9.3-6.06 13.27-9.34 14.82-11.2 1.55-1.85 3.35-4.05 4-4.88 0.65-0.83 2.03-3.3 3.08-5.5 1.04-2.19 2.38-4.89 2.97-5.99 0.59-1.1 1.21-7.17 1.39-13.5 0.19-6.63-0.1-12.14-0.68-13-0.87-1.29-6.28-1.5-38.46-1.5-20.6 0-37.83-0.38-38.29-0.83-0.45-0.46-0.83-36.46-0.83-80 0-72.92-0.14-79.54-1.75-83.92-0.96-2.61-3.21-6.09-5-7.72-2.92-2.67-3.93-2.97-10-3-4.47-0.02-7.94 0.56-10.27 1.72-1.94 0.96-3.51 2.09-3.5 2.5 0.01 0.41-0.54 0.74-1.23 0.74-0.69-0.01-2.04 2.12-3 4.75-1.61 4.35-1.76 10.08-1.75 66.26 0.01 53.16-0.19 61.81-1.49 63.75l-1.51 2.25c-495.44 0-526.17-0.17-527.5-1.5-1.32-1.32-1.5-17.94-1.5-137.5v-136c-4.78-5.45-5.05-5.5-17.66-5.76-7.46-0.15-13.48 0.16-14.36 0.75z"/>
            <use href="#nav-logo-img" x="654" y="382"/>
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
