'use client'

import { useActionState, useState } from 'react'
import { login } from '@/actions/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Leaf, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const initialState = {
  error: null,
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login as any, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col space-y-2 lg:hidden mb-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mx-auto">
          <Leaf className="h-7 w-7" />
        </div>
      </div>
      
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-muted-foreground">Ingresa tus datos para acceder a tu cuenta.</p>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" name="email" type="email" placeholder="correo@ejemplo.com" required className="h-12 px-4 bg-muted/50 focus:bg-background transition-colors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Input 
                id="password" 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
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
          {state?.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}
        </div>
        
        <div className="space-y-4 pt-2">
          <Button type="submit" className="w-full h-12 text-md shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" disabled={isPending}>
            {isPending ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/registro" className="text-primary hover:underline font-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}
