<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-5xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <BaseButton
          variant="ghost"
          @click="goBack"
        >
          ← Volver
        </BaseButton>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
        <p class="text-gray-600">Cargando datos del socio...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenido -->
      <div v-else-if="memberData" class="space-y-6">
        <!-- Header con nombre y botón editar -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                {{ memberData.nombre }} {{ memberData.apellido }}
              </h1>
              <p class="text-gray-600">DNI: {{ memberData.dni }}</p>
            </div>
            <BaseButton
              variant="primary"
              @click="goToEdit"
            >
              Editar
            </BaseButton>
          </div>
        </div>

        <!-- Tarjetas de Estado -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Estado de Cuota -->
          <div 
            :class="[
              'rounded-lg shadow p-6',
              memberData.estado_cuota === 'vencido' ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'
            ]"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Estado de Cuota</h3>
              <StatusBadge
                :status="memberData.estado_cuota"
                :label="memberData.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
              />
            </div>
            <p :class="memberData.estado_cuota === 'vencido' ? 'text-red-700' : 'text-green-700'">
              {{ memberData.estado_cuota === 'activo' ? 'El socio está al día con sus pagos' : 'El socio tiene la cuota vencida' }}
            </p>
          </div>

          <!-- Estado de Apto Físico -->
          <div 
            :class="[
              'rounded-lg shadow p-6',
              memberData.estado_apto_fisico === 'vencido' ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-blue-50 border-2 border-blue-200'
            ]"
          >
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Apto Físico</h3>
              <StatusBadge
                :status="memberData.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                :label="memberData.estado_apto_fisico === 'vigente' ? 'Vigente' : 'Vencido'"
              />
            </div>
            <p :class="memberData.estado_apto_fisico === 'vencido' ? 'text-yellow-700' : 'text-blue-700'">
              {{ memberData.apto_fisico ? 
                (memberData.estado_apto_fisico === 'vigente' ? 
                  `Apto físico vigente hasta el ${formatDate(memberData.apto_fisico)}` : 
                  `Apto físico vencido el ${formatDate(memberData.apto_fisico)}`) 
                : 'No tiene apto físico registrado' 
              }}
            </p>
          </div>
        </div>

        <!-- Datos Personales -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Datos Personales</h2>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Nacimiento</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(memberData.fecha_nacimiento) || '-' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ memberData.email || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ memberData.telefono || '-' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Alta</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(memberData.created_at) }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- TODO: Historial de Pagos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Historial de Pagos</h2>
          <!-- TODO: Aquí irá la tabla de pagos del socio -->
          <p class="text-gray-500 text-center py-8">
            Próximamente: Historial de pagos
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import BaseButton from '@/components/ui/BaseButton.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const route = useRoute()

const memberData = ref(null)
const loading = ref(false)
const error = ref(null)

async function getMemberWithStatus(id) {
  try {
    loading.value = true
    error.value = null

    // Consultar los datos personales desde la tabla members
    const { data: personalData, error: memberError } = await supabase
      .from('members')
      .select('id, dni, nombre, apellido, email, telefono, fecha_nacimiento, apto_fisico, created_at')
      .eq('id', id)
      .single()

    if (memberError) throw memberError

    // Consultar el estado calculado desde v_socios_estado (fuente de verdad)
    const { data: statusData, error: statusError } = await supabase
      .from('v_socios_estado')
      .select('estado_cuota, estado_apto_fisico')
      .eq('id', id)
      .single()

    if (statusError) throw statusError

    // Combinar ambos resultados
    memberData.value = {
      ...personalData,
      ...statusData
    }
  } catch (err) {
    console.error('Error al obtener socio:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-AR')
}

function goBack() {
  router.push({ name: 'Members' })
}

function goToEdit() {
  router.push({ name: 'EditMember', params: { id: route.params.id } })
}

onMounted(async () => {
  await getMemberWithStatus(route.params.id)
})
</script>
