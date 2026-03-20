/**
 * Simulación de validación IA.
 * En producción, esto llamaría a un servicio ML real.
 */
export function simulateAIValidation(_titulo: string, _fotoUrl: string | null) {
  const score = Math.floor(Math.random() * 31) + 70 // 70-100
  return {
    score,
    aprobado: score >= 75,
    mensaje: score >= 75
      ? '✅ Pack aprobado por IA — cumple estándares de calidad'
      : '⚠️ El pack requiere revisión manual adicional',
  }
}
