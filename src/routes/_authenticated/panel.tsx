import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_authenticated/panel")({
  component: Panel,
  head: () => ({
    meta: [
      { title: "Mi panel — Raíces Chile" },
      {
        name: "description",
        content: "Panel personal de Raíces Chile: revisa tu perfil, tu tipo de cuenta y tus accesos.",
      },
      { property: "og:title", content: "Mi panel — Raíces Chile" },
      {
        property: "og:description",
        content: "Espacio privado para visitantes y emprendedores de la red de turismo comunitario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

const etiquetaRol: Record<string, string> = {
  visitante: "Visitante",
  emprendedor: "Emprendedor anfitrión",
  administrador: "Administrador",
};

function Panel() {
  const { user, perfil, roles } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function cerrarSesion() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Sesión cerrada.");
    void navigate({ to: "/auth", replace: true });
  }

  const rolPrincipal = roles[0] ?? "visitante";

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold uppercase tracking-tight text-primary">
          Raíces Chile
        </Link>
        <button
          onClick={cerrarSesion}
          className="rounded-md border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-surface"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Sesión iniciada correctamente
        </p>
        <h1 className="mb-2 font-display text-4xl">
          Hola, {perfil?.nombre_completo?.trim() || user?.email}
        </h1>
        <p className="mb-10 text-muted-foreground">
          Este es tu espacio privado. Desde aquí gestionarás tus reservas y tu oferta turística.
        </p>

        <div className="grid gap-6 sm:grid-cols-3">
          <Dato titulo="Correo" valor={user?.email ?? "—"} />
          <Dato titulo="Tipo de cuenta" valor={etiquetaRol[rolPrincipal] ?? rolPrincipal} />
          <Dato titulo="Localidad" valor={perfil?.localidad?.trim() || "No indicada"} />
        </div>

        <div className="mt-12 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-2 font-display text-2xl">Próximos pasos</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>· Publicar y administrar tu emprendimiento.</li>
            <li>· Explorar y reservar experiencias por territorio.</li>
            <li>· Gestionar pagos accesibles y confirmaciones.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-lg bg-card p-5 ring-1 ring-border">
      <p className="mb-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {titulo}
      </p>
      <p className="break-words text-sm font-medium">{valor}</p>
    </div>
  );
}
