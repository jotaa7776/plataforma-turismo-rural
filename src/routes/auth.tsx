import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Ingresar — Raíces Chile" },
      {
        name: "description",
        content:
          "Ingresa o crea tu cuenta en Raíces Chile para reservar experiencias o publicar la oferta de tu emprendimiento rural.",
      },
      { property: "og:title", content: "Ingresar — Raíces Chile" },
      {
        property: "og:description",
        content: "Accede a tu cuenta de visitante o emprendedor en la red de turismo comunitario.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

type Modo = "ingresar" | "registrar";

function mensajeError(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials")) return "El correo o la contraseña no son correctos.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "Ya existe una cuenta con este correo. Intenta ingresar.";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (m.includes("pwned") || m.includes("compromised"))
    return "Esa contraseña apareció en filtraciones conocidas. Elige otra.";
  if (m.includes("email address") && m.includes("invalid")) return "Ese correo no parece válido.";
  return mensaje;
}

function AuthPage() {
  const navigate = useNavigate();
  const { session, cargando } = useAuth();
  const [modo, setModo] = useState<Modo>("ingresar");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [localidad, setLocalidad] = useState("");
  const [tipoCuenta, setTipoCuenta] = useState("visitante");
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!cargando && session) {
      void navigate({ to: "/panel", replace: true });
    }
  }, [cargando, session, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (enviando) return;

    if (!correo.trim() || !password) {
      toast.error("Completa tu correo y contraseña.");
      return;
    }
    if (modo === "registrar" && !nombre.trim()) {
      toast.error("Escribe tu nombre para crear la cuenta.");
      return;
    }

    setEnviando(true);
    try {
      if (modo === "ingresar") {
        const { error } = await supabase.auth.signInWithPassword({
          email: correo.trim(),
          password,
        });
        if (error) throw error;
        toast.success("¡Bienvenido de vuelta!");
        void navigate({ to: "/panel", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: correo.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              nombre_completo: nombre.trim(),
              localidad: localidad.trim(),
              tipo_cuenta: tipoCuenta,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Cuenta creada. ¡Bienvenido!");
          void navigate({ to: "/panel", replace: true });
        } else {
          toast.success("Cuenta creada. Revisa tu correo para confirmarla.");
          setModo("ingresar");
        }
      }
    } catch (error) {
      toast.error(mensajeError(error instanceof Error ? error.message : "Algo salió mal."));
    } finally {
      setEnviando(false);
    }
  }

  async function onGoogle() {
    setEnviando(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("No pudimos conectar con Google. Intenta con tu correo.");
        return;
      }
      if (result.redirected) return;
      void navigate({ to: "/panel", replace: true });
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-body text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <Link to="/" className="font-display text-xl font-bold uppercase tracking-tight text-primary">
          Raíces Chile
        </Link>
        <Link to="/" className="text-sm text-muted-foreground transition-colors hover:text-primary">
          Volver al inicio
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-14">
        <div className="w-full max-w-md">
          <h1 className="mb-2 font-display text-4xl">
            {modo === "ingresar" ? "Ingresa a tu cuenta" : "Crea tu cuenta"}
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            {modo === "ingresar"
              ? "Accede para gestionar tus reservas o tu emprendimiento."
              : "Únete como visitante o como anfitrión de tu localidad."}
          </p>

          <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-card p-6 ring-1 ring-border">
            {modo === "registrar" && (
              <>
                <Campo
                  id="nombre"
                  label="Nombre y apellido"
                  value={nombre}
                  onChange={setNombre}
                  placeholder="Elena Riquelme"
                  autoComplete="name"
                />
                <Campo
                  id="localidad"
                  label="Localidad (opcional)"
                  value={localidad}
                  onChange={setLocalidad}
                  placeholder="Nirivilo, Maule"
                />
                <div>
                  <label
                    htmlFor="tipo_cuenta"
                    className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                  >
                    Tipo de cuenta
                  </label>
                  <select
                    id="tipo_cuenta"
                    value={tipoCuenta}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-hidden focus:ring-2 focus:ring-ring"
                  >
                    <option value="visitante">Visitante — quiero reservar experiencias</option>
                    <option value="emprendedor">Emprendedor — quiero publicar mi oferta</option>
                  </select>
                </div>
              </>
            )}

            <Campo
              id="correo"
              label="Correo electrónico"
              type="email"
              value={correo}
              onChange={setCorreo}
              placeholder="tucorreo@ejemplo.cl"
              autoComplete="email"
            />
            <Campo
              id="password"
              label="Contraseña"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Mínimo 6 caracteres"
              autoComplete={modo === "ingresar" ? "current-password" : "new-password"}
            />

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:opacity-60"
            >
              {enviando
                ? "Un momento…"
                : modo === "ingresar"
                  ? "Ingresar"
                  : "Crear mi cuenta"}
            </button>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                o
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button
              type="button"
              onClick={onGoogle}
              disabled={enviando}
              className="w-full rounded-md border border-input bg-background px-5 py-3 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-60"
            >
              Continuar con Google
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {modo === "ingresar" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button
              type="button"
              onClick={() => setModo(modo === "ingresar" ? "registrar" : "ingresar")}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {modo === "ingresar" ? "Regístrate aquí" : "Ingresa aquí"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}

function Campo({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-hidden placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
