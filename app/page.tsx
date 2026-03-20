import Link from "next/link";
import { ArrowRight, Leaf, ShieldCheck, MapPin } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
      {/* Navbar Minimalista */}
      <header className="absolute top-0 z-50 flex w-full items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          </div>
          <span className="hidden sm:inline-block text-xl font-bold tracking-tight text-foreground">YapaSegura</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <Link href="/login" className="text-xs sm:text-sm font-medium hover:text-primary transition-colors">
            Iniciar Sesión
          </Link>
          <Link 
            href="/registro" 
            className="rounded-full bg-foreground px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-background transition-transform hover:scale-105"
          >
            Únete
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative flex flex-1 flex-col items-center pt-32 pb-16 lg:pt-48 lg:justify-center">
        {/* Background Gradients */}
        <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="absolute top-1/4 -left-64 -z-10 h-96 w-96 rounded-full bg-secondary/30 blur-3xl mix-blend-multiply"></div>
        <div className="absolute bottom-1/4 -right-64 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl mix-blend-multiply"></div>

        <div className="container px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              Rescatando la comida del Ecuador
            </div>
            
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Menos desperdicio, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-emerald-400">
                más ahorro.
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
              Conecta comercios que tienen excedentes alimentarios en perfecto estado con clientes listos para rescatarlos a un precio reducido. Gana dinero, ahorra y cuida el planeta.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/registro"
                className="group flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-medium text-primary-foreground shadow-xl transition-all hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-1 sm:w-auto"
              >
                Comenzar ahora
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#como-funciona"
                className="flex h-14 w-full items-center justify-center rounded-full border-2 border-muted px-8 text-lg font-medium transition-colors hover:border-foreground hover:bg-muted/50 sm:w-auto"
              >
                Saber más
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Cards Floating */}
        <div className="mt-16 lg:mt-24 grid w-full max-w-5xl grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          <div className="flex flex-col items-center rounded-3xl border bg-background/50 p-6 text-center shadow-lg backdrop-blur-md transition-transform hover:-translate-y-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/20">
              <MapPin className="h-7 w-7 text-secondary-foreground" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Ubica packs cercanos</h3>
            <p className="text-muted-foreground">Encuentra comercios cerca de ti con comida deliciosa lista para rescatar mediante nuestro mapa interactivo.</p>
          </div>
          <div className="flex flex-col items-center rounded-3xl border bg-background/50 p-6 text-center shadow-lg backdrop-blur-md transition-transform hover:-translate-y-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <Leaf className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Impacto Positivo</h3>
            <p className="text-muted-foreground">Al rescatar packs, evitas que comida en perfecto estado termine en la basura, ayudando al medio ambiente.</p>
          </div>
          <div className="flex flex-col items-center rounded-3xl border bg-background/50 p-6 text-center shadow-lg backdrop-blur-md transition-transform hover:-translate-y-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10">
              <ShieldCheck className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="mb-2 text-xl font-bold">Retiro Seguro (OTP)</h3>
            <p className="text-muted-foreground">Reserva tu código único de 6 dígitos que garantiza un rescate seguro, validado al instante por el comercio.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
