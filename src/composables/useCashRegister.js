import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export function useCashRegister() {
  const transactions = ref([])
  const balanceAnterior = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Computed: Totales del día
  const ingresosDia = computed(() => {
    return transactions.value
      .filter(t => t.tipo === 'INGRESO')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0)
  })

  const egresosDia = computed(() => {
    return transactions.value
      .filter(t => t.tipo === 'EGRESO')
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0)
  })

  const saldoFinal = computed(() => {
    return balanceAnterior.value + ingresosDia.value - egresosDia.value
  })

  /**
   * Carga los movimientos del día y el saldo anterior
   * @param {Date} date - Fecha a consultar
   */
  async function loadDailyData(date) {
    try {
      loading.value = true
      error.value = null

      // Convertir fecha a formato ISO (solo fecha, sin hora)
      const dateStr = date.toISOString().split('T')[0]

      // Consulta 1: Saldo Anterior (RPC)
      const { data: balanceData, error: balanceError } = await supabase
        .rpc('get_previous_balance', { check_date: dateStr })

      if (balanceError) throw balanceError

      balanceAnterior.value = balanceData || 0

      // Consulta 2: Movimientos del día
      const startDate = `${dateStr}T00:00:00`
      const endDate = `${dateStr}T23:59:59`

      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })

      if (transError) throw transError

      transactions.value = transData || []

      return { success: true }
    } catch (err) {
      console.error('Error cargando datos de caja:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Registra una transacción manual
   * @param {Object} form - { tipo, categoria, descripcion, monto }
   */
  async function addManualTransaction(form) {
    try {
      loading.value = true
      error.value = null

      // Obtener usuario actual (created_by)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert({
          tipo: form.tipo,
          categoria: form.categoria,
          descripcion: form.descripcion || null,
          monto: parseFloat(form.monto),
          created_by: user.id,
          payment_id: null
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Recargar datos del día actual
      await loadDailyData(new Date())

      return { success: true, data }
    } catch (err) {
      console.error('Error registrando transacción:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Genera reporte en texto plano para copiar
   */
  function generateReport(selectedDate) {
    const dateStr = selectedDate.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const formatMoney = (amount) => {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
      }).format(amount)
    }

    let report = `📊 REPORTE DE CAJA - ${dateStr}\n`
    report += `${'='.repeat(50)}\n\n`
    report += `💰 Saldo Anterior: ${formatMoney(balanceAnterior.value)}\n`
    report += `📈 Ingresos del día: ${formatMoney(ingresosDia.value)}\n`
    report += `📉 Egresos del día: ${formatMoney(egresosDia.value)}\n`
    report += `${'-'.repeat(50)}\n`
    report += `💵 SALDO FINAL: ${formatMoney(saldoFinal.value)}\n\n`

    // Detalle de movimientos
    if (transactions.value.length > 0) {
      report += `DETALLE DE MOVIMIENTOS:\n`
      report += `${'-'.repeat(50)}\n\n`

      transactions.value.forEach((t) => {
        const time = new Date(t.created_at).toLocaleTimeString('es-AR', {
          hour: '2-digit',
          minute: '2-digit'
        })
        const tipo = t.tipo === 'INGRESO' ? '✅' : '❌'
        const monto = formatMoney(t.monto)
        
        report += `${time} | ${tipo} ${t.categoria}\n`
        if (t.descripcion) {
          report += `   └─ ${t.descripcion}\n`
        }
        report += `   └─ Monto: ${monto}\n\n`
      })
    }

    return report
  }

  function clearError() {
    error.value = null
  }

  return {
    // Estado
    transactions,
    balanceAnterior,
    ingresosDia,
    egresosDia,
    saldoFinal,
    loading,
    error,
    // Métodos
    loadDailyData,
    addManualTransaction,
    generateReport,
    clearError
  }
}
