<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">Gestión de Caja</h1>
            <p class="text-gray-400">Control de ingresos y egresos diarios</p>
          </div>
          
          <!-- Selector de Fecha -->
          <div class="w-full md:w-64">
            <BaseInput
              v-model="selectedDate"
              type="date"
              label="Fecha"
              @change="handleDateChange"
            />
          </div>
        </div>
      </div>

      <!-- Grid de Resumen (4 tarjetas) -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Saldo Anterior -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-sm font-medium mb-2">Saldo Anterior</p>
              <p class="text-gray-800 text-3xl font-bold mb-1">
                {{ formatCurrency(balanceAnterior) }}
              </p>
              <span class="text-sm text-gray-500">Al inicio del día</span>
            </div>
            <div class="p-3 rounded-lg bg-gray-50">
              <Calendar class="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <!-- Ingresos -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-sm font-medium mb-2">Ingresos</p>
              <p class="text-gray-800 text-3xl font-bold mb-1">
                {{ formatCurrency(ingresosDia) }}
              </p>
              <span class="text-sm font-semibold text-emerald-600">
                +{{ transactions.filter(t => t.tipo === 'INGRESO').length }} movimientos
              </span>
            </div>
            <div class="p-3 rounded-lg bg-emerald-50">
              <ArrowDownCircle class="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <!-- Egresos -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-sm font-medium mb-2">Egresos</p>
              <p class="text-gray-800 text-3xl font-bold mb-1">
                {{ formatCurrency(egresosDia) }}
              </p>
              <span class="text-sm font-semibold text-red-600">
                -{{ transactions.filter(t => t.tipo === 'EGRESO').length }} movimientos
              </span>
            </div>
            <div class="p-3 rounded-lg bg-red-50">
              <ArrowUpCircle class="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <!-- Saldo Final -->
        <div class="bg-white rounded-xl shadow-sm p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <p class="text-gray-400 text-sm font-medium mb-2">Saldo Final</p>
              <p class="text-gray-800 text-3xl font-bold mb-1">
                {{ formatCurrency(saldoFinal) }}
              </p>
              <span class="text-sm text-blue-600 font-semibold">En caja ahora</span>
            </div>
            <div class="p-3 rounded-lg bg-blue-50">
              <Wallet class="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <BaseButton
          variant="primary"
          size="lg"
          @click="openModal"
          class="flex items-center justify-center gap-2"
        >
          <Plus class="w-5 h-5" />
          Registrar Movimiento
        </BaseButton>

        <BaseButton
          variant="secondary"
          size="lg"
          @click="copyReport"
          class="flex items-center justify-center gap-2"
        >
          <Copy class="w-5 h-5" />
          Copiar Reporte
        </BaseButton>
      </div>

      <!-- Tabla de Movimientos -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-800">
            Movimientos del Día ({{ transactions.length }})
          </h2>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary-600"></div>
          <p class="mt-4 text-gray-500">Cargando movimientos...</p>
        </div>

        <div v-else-if="transactions.length === 0" class="p-12 text-center">
          <FileText class="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p class="text-gray-500">No hay movimientos registrados en este día</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hora
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Concepto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
                <!-- Hora -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatTime(transaction.created_at) }}
                </td>

                <!-- Concepto -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ transaction.categoria }}</p>
                      <p v-if="transaction.descripcion" class="text-sm text-gray-500">
                        {{ transaction.descripcion }}
                      </p>
                    </div>
                    <!-- Badge si está vinculado a un pago -->
                    <span
                      v-if="transaction.payment_id"
                      class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      <CreditCard class="w-3 h-3" />
                      Cuota
                    </span>
                  </div>
                </td>

                <!-- Tipo -->
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    v-if="transaction.tipo === 'INGRESO'"
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                  >
                    <ArrowDownCircle class="w-4 h-4" />
                    Ingreso
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                  >
                    <ArrowUpCircle class="w-4 h-4" />
                    Egreso
                  </span>
                </td>

                <!-- Monto -->
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold"
                    :class="transaction.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-red-600'"
                >
                  {{ transaction.tipo === 'INGRESO' ? '+' : '-' }}{{ formatCurrency(transaction.monto) }}
                </td>

                <!-- Usuario -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded">
                    {{ transaction.created_by ? transaction.created_by.substring(0, 8) : 'N/A' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Transacción -->
    <TransactionModal
      v-if="showModal"
      @close="closeModal"
      @submit="handleSubmit"
    />

    <!-- Modal de Éxito -->
    <div v-if="showSuccessModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <CheckCircle class="h-6 w-6 text-emerald-600" />
          </div>
          <h3 class="text-xl font-bold mb-2">Movimiento Registrado</h3>
          <p class="text-gray-600 mb-6">El movimiento se ha guardado correctamente</p>
          <BaseButton variant="primary" full-width @click="showSuccessModal = false">
            Aceptar
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCashRegister } from '@/composables/useCashRegister'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import TransactionModal from './TransactionModal.vue'
import {
  Calendar,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Plus,
  Copy,
  FileText,
  CreditCard,
  CheckCircle
} from 'lucide-vue-next'

const {
  transactions,
  balanceAnterior,
  ingresosDia,
  egresosDia,
  saldoFinal,
  loading,
  loadDailyData,
  addManualTransaction,
  generateReport
} = useCashRegister()

// Estado local
const selectedDate = ref(new Date().toISOString().split('T')[0])
const showModal = ref(false)
const showSuccessModal = ref(false)

// Formateo
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(amount)
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Métodos
const handleDateChange = () => {
  const date = new Date(selectedDate.value + 'T12:00:00')
  loadDailyData(date)
}

const openModal = () => {
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSubmit = async (formData) => {
  const result = await addManualTransaction(formData)
  
  if (result.success) {
    closeModal()
    showSuccessModal.value = true
  } else {
    alert('Error al registrar el movimiento: ' + result.error)
  }
}

const copyReport = async () => {
  const date = new Date(selectedDate.value + 'T12:00:00')
  const report = generateReport(date)
  
  try {
    await navigator.clipboard.writeText(report)
    alert('✅ Reporte copiado al portapapeles')
  } catch (err) {
    console.error('Error al copiar:', err)
    alert('❌ Error al copiar el reporte')
  }
}

// Inicialización
onMounted(() => {
  const today = new Date()
  loadDailyData(today)
})
</script>
