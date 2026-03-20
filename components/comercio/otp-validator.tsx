'use client'

import { useState, useRef, useEffect } from 'react'
import { validarOTP } from '@/actions/reservas'
import { CheckCircle2, KeyRound, AlertCircle, Loader2 } from 'lucide-react'

export function OTPValidator() {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; mensaje?: string; error?: string } | null>(null)
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    setResult(null)
    if (value && index < 5) {
      inputs.current[index + 1]?.focus()
    }
    // Auto-submit when all filled
    if (next.filter(Boolean).length === 6) {
      handleValidar(next.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      handleValidar(pasted)
    }
  }

  async function handleValidar(codeOverride?: string) {
    const toValidate = codeOverride ?? code
    if (toValidate.length !== 6) return
    setLoading(true)
    setResult(null)
    const res = await validarOTP(toValidate)
    setResult(res)
    setLoading(false)
    if (res.success) {
      // Reset after short delay on success
      setTimeout(() => {
        setDigits(['', '', '', '', '', ''])
        setResult(null)
        inputs.current[0]?.focus()
      }, 3000)
    } else {
      // On error, clear digits and refocus
      setDigits(['', '', '', '', '', ''])
      setTimeout(() => inputs.current[0]?.focus(), 50)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Icon header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <KeyRound className="h-7 w-7" />
        </div>
        <p className="text-sm text-muted-foreground">
          Ingresa o pega el código de 6 dígitos que presenta el cliente
        </p>
      </div>

      {/* OTP digit inputs */}
      <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => { inputs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleInput(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={loading}
            className={`
              h-14 w-12 rounded-xl border-2 text-center text-2xl font-bold font-mono
              bg-background transition-all focus:outline-none focus:ring-2 focus:ring-primary/50
              ${result?.error ? 'border-destructive bg-destructive/5 text-destructive' : ''}
              ${result?.success ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'border-border focus:border-primary'}
              disabled:opacity-50
            `}
          />
        ))}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Validando código...
        </div>
      )}

      {/* Success */}
      {result?.success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              ¡Entrega confirmada!
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-0.5">{result.mensaje}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-destructive">{result.error}</p>
        </div>
      )}

      {/* Manual submit button */}
      {!result?.success && (
        <button
          onClick={() => handleValidar()}
          disabled={code.length !== 6 || loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Confirmar entrega
        </button>
      )}
    </div>
  )
}
