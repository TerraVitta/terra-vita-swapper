import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

type AppRole = "admin" | "seller" | "buyer" | null;

export const useUserRole = (user: User | null) => {
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase as any)
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setRole("buyer"); // Default fallback
      } else if (data) {
        setRole(data.role as AppRole);
      } else {
        setRole("buyer"); // Default fallback if no data
      }
      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { role, loading };
};
