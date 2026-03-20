'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Package, ClipboardList, BarChart3, Map, Ticket, Bell, Menu, X, LogOut, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { logout } from '@/actions/auth'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { NotificationBell } from '@/components/shared/notification-bell'

const comercioLinks = [
  { href: '/comercio', label: 'Dashboard', icon: BarChart3 },
  { href: '/comercio/packs', label: 'Mis Packs', icon: Package },
  { href: '/comercio/reservas', label: 'Reservas', icon: ClipboardList },
  { href: '/comercio/reportes', label: 'Reportes', icon: BarChart3 },
  { href: '/comercio/perfil', label: 'Mi Perfil', icon: UserIcon },
]

const clienteLinks = [
  { href: '/cliente', label: 'Mapa', icon: Map },
  { href: '/cliente/reservas', label: 'Mis Reservas', icon: Ticket },
  { href: '/cliente/perfil', label: 'Mi Perfil', icon: UserIcon },
]

export function Navbar({ rol, userId }: { rol: string | null; userId?: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = rol === 'comercio' ? comercioLinks : clienteLinks

  return (
    <>
      {/* Desktop & Tablet top bar */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={rol === 'comercio' ? '/comercio' : '/cliente'} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:inline">YapaSegura</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userId && <NotificationBell userId={userId} />}
            <form action={logout}>
              <Button type="submit" variant="ghost" size="sm" className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Salir</span>
              </Button>
            </form>

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="border-t bg-background md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {links.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                )
              })}
              <form action={logout} className="mt-2 border-t pt-3">
                <Button type="submit" variant="ghost" className="w-full justify-start gap-3 text-muted-foreground px-4 py-3">
                  <LogOut className="h-5 w-5" />
                  Cerrar Sesión
                </Button>
              </form>
            </nav>
          </div>
        )}
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur-lg md:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2">
          {links.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <link.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
