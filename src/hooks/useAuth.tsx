import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type TipoCuenta = "visitante" | "emprendedor" | "administrador";

export type Perfil = {
  id: string;
  nombre_completo: string;
  localidad: string | null;
};

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  perfil: Perfil | null;
  roles: TipoCuenta[];
  cargando: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  perfil: null,
  roles: [],
  cargando: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [roles, setRoles] = useState<TipoCuenta[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCargando(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (!userId) {
      setPerfil(null);
      setRoles([]);
      return;
    }

    let activo = true;

    void (async () => {
      const [perfilRes, rolesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, nombre_completo, localidad")
          .eq("id", userId)
          .maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (!activo) return;
      setPerfil((perfilRes.data as Perfil | null) ?? null);
      setRoles(((rolesRes.data ?? []) as { role: TipoCuenta }[]).map((r) => r.role));
    })();

    return () => {
      activo = false;
    };
  }, [userId]);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, perfil, roles, cargando }),
    [session, perfil, roles, cargando],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
