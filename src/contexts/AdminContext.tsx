import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AdminContextType {
  isAdmin: boolean;
  adminMode: boolean;
  toggleAdminMode: () => void;
}

const AdminContext = createContext<AdminContextType>({ isAdmin: false, adminMode: false, toggleAdminMode: () => {} });

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setAdminMode(false);
      return;
    }

    const checkAdmin = async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!error && !!data);
      if (error || !data) setAdminMode(false);
    };

    checkAdmin();
  }, [user]);

  const toggleAdminMode = () => {
    if (isAdmin) setAdminMode((prev) => !prev);
  };

  return (
    <AdminContext.Provider value={{ isAdmin, adminMode, toggleAdminMode }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
