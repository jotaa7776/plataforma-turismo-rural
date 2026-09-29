import { createFileRoute, Link } from "@tanstack/react-router";

import { useAuth } from "@/hooks/useAuth";

import heroRuca from "@/assets/hero-ruca.jpg";
import terrOsorno from "@/assets/terr-osorno.jpg";
import terrAltoLoa from "@/assets/terr-altoloa.jpg";
import terrLonquimay from "@/assets/terr-lonquimay.jpg";
import terrSecano from "@/assets/terr-secano.jpg";
import expGreda from "@/assets/exp-greda.jpg";
import expPinon from "@/assets/exp-pinon.jpg";
import expCuranto from "@/assets/exp-curanto.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Raíces Chile — Turismo rural y comunitario directo" },
      {
        name: "description",
        content:
          "Reserva alojamientos, rutas y gastronomía con familias anfitrionas de Mapu Lahual, Alto Loa, Lonquimay y el Secano Costero. Sin intermediarios.",
      },
      { property: "og:title", content: "Raíces Chile — Turismo rural y comunitario directo" },
      {
        property: "og:description",
        content:
          "Experiencias gestionadas por sus propias comunidades, con pagos accesibles y reservas que funcionan con conexión intermitente.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

const territorios = [
  {
    img: terrOsorno,
    nombre: "Costa Osorno",
    cultura: "Cultura Huilliche",
    detalle: "Manquemapu · Caleta Cóndor · Hueyelhue",
  },
  {
    img: terrAltoLoa,
    nombre: "Alto Loa y Huara",
    cultura: "Aymara & Atacameño",
    detalle: "Caspana · Lasana · Ayquina · Miñi Miñi",
  },
  {
    img: terrLonquimay,
    nombre: "Alto Bío-Bío y Lonquimay",
    cultura: "Cultura Pehuenche",
    detalle: "Trapa Trapa · Ralco Lepoy · Liucura",
  },
  {
    img: terrSecano,
    nombre: "Secano Costero",
    cultura: "Cultura Campesina",
    detalle: "Nirivilo · Chanco · Pumanque · Marchigüe",
  },
];

const experiencias = [
  {
    img: expGreda,
    sello: "SELLO COMUNITARIO",
    titulo: "Taller de Greda en Nirivilo",
    precio: "$25.000",
    anfitrion: "Sra. Elena",
    rol: "Anfitriona",
    tags: ["2 Horas", "Maule"],
    delay: "",
  },
  {
    img: expPinon,
    sello: "RESERVA OFFLINE",
    titulo: "Ruta del Piñón Pehuenche",
    precio: "$45.000",
    anfitrion: "Familia Huenchullán",
    rol: "Anfitrión",
    tags: ["Día completo", "Alto Bío-Bío"],
    delay: "[animation-delay:60ms]",
  },
  {
    img: expCuranto,
    sello: "SELLO COMUNITARIO",
    titulo: "Curanto al Hoyo Ancestral",
    precio: "$18.500",
    anfitrion: "Familia Antilef",
    rol: "Anfitrión",
    tags: ["Almuerzo", "Los Lagos"],
    delay: "[animation-delay:120ms]",
  },
];

function Index() {
  const { session, perfil } = useAuth();
  const nombreCorto = perfil?.nombre_completo?.trim().split(" ")[0] ?? "Mi panel";

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-border bg-background/90 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-8">
          <span className="font-display text-2xl font-bold uppercase tracking-tight text-primary">
            Raíces Chile
          </span>
          <div className="hidden gap-6 text-sm font-medium md:flex">
            <a href="#territorios" className="transition-colors hover:text-primary">
              Territorios
            </a>
            <a href="#experiencias" className="transition-colors hover:text-primary">
              Experiencias
            </a>
            <a href="#anfitriones" className="transition-colors hover:text-primary">
              Anfitriones
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-secondary sm:flex">
            <span className="size-2 animate-pulse rounded-full bg-secondary" />
            Modo Baja Señal Activo
          </div>
          {session ? (
            <Link
              to="/panel"
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110"
            >
              {nombreCorto}
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="hidden text-sm font-medium transition-colors hover:text-primary sm:block"
              >
                Ingresar
              </Link>
              <Link
                to="/auth"
                className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:brightness-110"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </nav>

      <header className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2">
        <div className="animate-reveal">
          <h1 className="mb-8 text-balance font-display text-5xl leading-[1.1] md:text-7xl">
            Turismo que <span className="italic text-primary">vuelve a la tierra.</span>
          </h1>
          <p className="mb-10 max-w-md text-lg leading-relaxed text-muted-foreground">
            Conecta directamente con familias y comunidades rurales de Chile. Reservas seguras,
            pago local y respeto cultural.
          </p>

          <form
            className="flex flex-col gap-2 rounded-lg bg-card p-2 shadow-xl ring-1 ring-border md:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="flex-1 px-4 py-3">
              <label
                htmlFor="destino"
                className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Destino
              </label>
              <input
                id="destino"
                type="text"
                placeholder="¿A dónde vamos?"
                className="w-full bg-transparent text-sm outline-hidden placeholder:text-muted-foreground/50"
              />
            </div>
            <div className="flex-1 border-t border-border px-4 py-3 md:border-l md:border-t-0">
              <label
                htmlFor="tipo"
                className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Tipo
              </label>
              <select
                id="tipo"
                className="w-full appearance-none bg-transparent text-sm outline-hidden"
              >
                <option>Hospedaje familiar o ruca</option>
                <option>Ruta patrimonial</option>
                <option>Taller de alfarería</option>
                <option>Gastronomía local</option>
              </select>
            </div>
            <button
              type="submit"
              className="rounded-md bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-primary"
            >
              Buscar
            </button>
          </form>
        </div>

        <div className="animate-reveal [animation-delay:200ms]">
          <img
            src={heroRuca}
            width={1200}
            height={1200}
            alt="Ruca huilliche en el bosque lluvioso de la costa de Osorno"
            className="aspect-square w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-border"
          />
        </div>
      </header>

      <section id="territorios" className="bg-surface px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl">Explora por Territorio</h2>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              4 Comunidades Base
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {territorios.map((t) => (
              <div key={t.nombre} className="group cursor-pointer">
                <img
                  src={t.img}
                  width={800}
                  height={1000}
                  loading="lazy"
                  alt={`Paisaje de ${t.nombre}`}
                  className="mb-4 aspect-[4/5] w-full rounded-lg object-cover ring-primary transition-all group-hover:ring-2"
                />
                <h3 className="mb-1 font-display text-xl">{t.nombre}</h3>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {t.cultura}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{t.detalle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experiencias" className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row">
          <div className="max-w-xl">
            <h2 className="mb-4 font-display text-4xl">Experiencias Destacadas</h2>
            <p className="text-muted-foreground">
              Vividas y gestionadas por sus propios habitantes. Sin intermediarios, valor directo
              al territorio.
            </p>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-3">
          {experiencias.map((e) => (
            <article key={e.titulo} className={`flex animate-reveal flex-col ${e.delay}`}>
              <div className="relative mb-5">
                <img
                  src={e.img}
                  width={800}
                  height={600}
                  loading="lazy"
                  alt={e.titulo}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <div className="absolute left-4 top-4 rounded-full border border-border bg-background px-3 py-1 font-mono text-[10px] font-bold">
                  {e.sello}
                </div>
              </div>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="font-display text-2xl">{e.titulo}</h3>
                <span className="font-mono font-medium text-primary">{e.precio}</span>
              </div>
              <div className="mb-4 flex items-center gap-3">
                <div className="size-8 rounded-full bg-surface-strong outline-1 outline-border" />
                <p className="text-sm font-medium">
                  {e.rol}: <span className="text-muted-foreground">{e.anfitrion}</span>
                </p>
              </div>
              <div className="mt-auto flex gap-2">
                {e.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface px-2 py-1 text-[10px] text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-foreground px-6 py-20 text-background">
        <div className="mx-auto grid max-w-7xl items-center gap-20 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-4xl">Paga como te sea más cómodo.</h2>
            <p className="mb-8 leading-relaxed text-background/70">
              Sabemos que en el campo el efectivo y la transferencia son ley. Por eso permitimos
              pagos directos a CuentaRUT y en cualquier CajaVecina del país. Sin tarjetas de
              crédito obligatorias.
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div className="rounded-lg border border-background/15 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase text-primary">Opción A</div>
                <div className="font-medium">Transferencia Directa</div>
              </div>
              <div className="rounded-lg border border-background/15 p-4">
                <div className="mb-2 font-mono text-[10px] uppercase text-primary">Opción B</div>
                <div className="font-medium">Depósito CajaVecina</div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-background/15 bg-background/5 p-8">
            <p className="mb-4 font-display text-5xl italic text-primary">
              “Sin comisiones abusivas.”
            </p>
            <p className="italic text-background/80">
              El pago por la experiencia queda en la comunidad. Nosotros solo facilitamos el
              encuentro.
            </p>
          </div>
        </div>
      </section>

      <section id="anfitriones" className="px-6 py-24 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-display text-5xl">¿Eres anfitrión en tu localidad?</h2>
          <p className="mb-10 text-lg text-muted-foreground">
            Únete a la red nacional de turismo comunitario. Es gratis, simple y funciona incluso
            con internet intermitente.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to={session ? "/panel" : "/auth"}
              className="rounded-md bg-primary px-10 py-5 text-lg font-medium text-primary-foreground shadow-lg transition-all hover:-translate-y-0.5"
            >
              Quiero publicar mi oferta
            </Link>
            <button className="rounded-md border border-border bg-transparent px-10 py-5 text-lg font-medium transition-all hover:bg-surface">
              Ver guía paso a paso
            </button>
          </div>
          <p className="mt-8 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Apoyado por el Catálogo Nacional de Desafíos 2026
          </p>
        </div>
      </section>

      <footer className="border-t border-border bg-surface px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 md:flex-row">
          <p className="font-display text-xl font-bold text-primary">RAÍCES CHILE</p>
          <div className="flex gap-8 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            <a href="#territorios">Términos</a>
            <a href="#experiencias">Privacidad</a>
            <a href="#anfitriones">Manual Offline</a>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            © 2026 — Ingeniería de Software I
          </p>
        </div>
      </footer>
    </div>
  );
}
