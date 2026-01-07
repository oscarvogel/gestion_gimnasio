<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <BaseButton
            variant="ghost"
            @click="goBack"
          >
            ← Volver
          </BaseButton>
        </div>
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Analíticas Detalladas</h1>
        <p class="text-gray-400">Vista detallada de métricas y estadísticas del gimnasio</p>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm p-1 mb-6 inline-flex gap-1">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="activeTab = tab.value"
          :class="[
            'px-6 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === tab.value
              ? 'bg-emerald-500 text-white'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-xl shadow-sm p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">
          {{ currentTabLabel }}
        </h2>
        <p class="text-gray-500 text-center py-12">
          Gráficos detallados próximamente...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'

const router = useRouter()
const route = useRoute()

const activeTab = ref('revenue')

const tabs = [
  { label: 'Ingresos', value: 'revenue' },
  { label: 'Socios', value: 'members' },
  { label: 'Asistencia', value: 'attendance' },
  { label: 'Planes', value: 'plans' }
]

const currentTabLabel = computed(() => {
  return tabs.find(t => t.value === activeTab.value)?.label || 'Analíticas'
})

function goBack() {
  router.push('/')
}

onMounted(() => {
  // Si viene un tab por query string, usarlo
  if (route.query.tab) {
    activeTab.value = route.query.tab
  }
})
</script>
