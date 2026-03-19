'use client'

import { useActionState, useState } from 'react'
import { registro } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, Eye, EyeOff, ShoppingBag, Store } from 'lucide-react'
import Link from 'next/link'

const initialState = {
  error: null,
}

export default function RegistroPage() {
  const [state, formAction, isPending] = useActionState(registro as any, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [rol, setRol] = useState<'cliente' | 'comercio'>('cliente')

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col space-y-2 lg:hidden mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mx-auto">
          <Leaf className="h-7 w-7" />
        </div>
      </div>

      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Únete a YapaSegura</h1>
        <p className="text-muted-foreground">Crea tu cuenta y empieza a combatir el desperdicio.</p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo</Label>
            <Input id="nombre_completo" name="nombre_completo" type="text" placeholder="Juan Pérez" required className="h-12 px-4 bg-muted/50 focus:bg-background transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required className="h-12 px-4 bg-muted/50 focus:bg-background transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña (mínimo 6 caracteres)</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                minLength={6} 
                className="h-12 px-4 bg-muted/50 focus:bg-background transition-colors pr-12" 
              />
              <Button 
                type="button" 
                variant="ghost" 
                className="absolute right-0 top-0 h-12 w-12 px-0 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 pt-2">
            <Label>¿Cómo usarás YapaSegura?</Label>
            <input type="hidden" name="rol" value={rol} />
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRol('cliente')}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  rol === 'cliente' 
                    ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                    : 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <ShoppingBag className={`h-6 w-6 ${rol === 'cliente' ? 'text-primary' : ''}`} />
                <span className="text-sm font-semibold">Soy Cliente</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRol('comercio')}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                  rol === 'comercio' 
                    ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                    : 'border-muted bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <Store className={`h-6 w-6 ${rol === 'comercio' ? 'text-primary' : ''}`} />
                <span className="text-sm font-semibold">Soy Comercio</span>
              </button>
            </div>
          </div>

          {state?.error && (
            <p className="text-sm font-medium text-destructive mt-2">{state.error}</p>
          )}
        </div>

        <div className="space-y-4 pt-2">
          <Button type="submit" className="w-full h-12 text-md shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" disabled={isPending}>
            {isPending ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary hover:underline font-semibold">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
