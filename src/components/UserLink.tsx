import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface UserLinkProps {
  userId: string;
  name: string | null;
  className?: string;
}

export function UserLink({ userId, name, className = "" }: UserLinkProps) {
  const { user } = useAuth();
  const href = userId === user?.id ? "/profile" : `/profile/${userId}`;

  return (
    <Link
      to={href}
      onClick={(e) => e.stopPropagation()}
      className={`hover:underline hover:text-primary transition-colors ${className}`}
    >
      {name || "Usuário"}
    </Link>
  );
}
