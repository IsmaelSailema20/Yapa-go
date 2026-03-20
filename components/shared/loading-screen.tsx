import { Loader2, PackageOpen } from 'lucide-react'

export function LoadingScreen({ message = "Cargando datos..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in duration-500">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior girando rápido */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" style={{ animationDuration: '1s' }} />
        {/* Anillo interior girando lento en sentido contrario */}
        <div className="absolute inset-2 rounded-full border-4 border-emerald-500/20 border-b-emerald-500 animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
        {/* Ícono central */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background shadow-sm z-10">
          <PackageOpen className="h-7 w-7 text-primary animate-pulse" />
        </div>
      </div>
      <p className="font-medium text-muted-foreground animate-pulse text-sm tracking-wide">
        {message}
      </p>
    </div>
  )
}
