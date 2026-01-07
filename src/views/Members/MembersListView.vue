<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Socios</h1>
        <p class="text-gray-500">Gestiona los miembros del gimnasio</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="bg-white rounded-xl shadow-sm p-8 text-center">
        <p class="text-gray-600">Cargando socios...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ error }}
      </div>

      <!-- Contenedor principal -->
      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <!-- Header de la tarjeta -->
        <div class="px-6 py-4 border-b border-gray-100">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 class="text-lg font-semibold text-gray-800">Lista de Socios</h2>
            <div class="flex flex-col sm:flex-row gap-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar por nombre, apellido o DNI..."
                class="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
              <button
                @click="goToNewMember"
                class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-sm whitespace-nowrap"
              >
                + Nuevo Socio
              </button>
            </div>
          </div>
        </div>

        <!-- Tabla Desktop -->
        <div v-if="filteredMembers.length > 0" class="hidden md:block overflow-x-auto">
          <table class="min-w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Socio
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DNI
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado Cuota
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apto Físico
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              <tr
                v-for="member in filteredMembers"
                :key="member.id"
                class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                @click="goToMemberDetail(member.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0">
                      <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <span class="text-sm font-semibold text-slate-600">
                          {{ getInitials(member.nombre, member.apellido) }}
                        </span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ member.nombre }} {{ member.apellido }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.dni }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ member.email || '-' }}</div>
                  <div class="text-sm text-gray-500">{{ member.telefono || '-' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    :status="member.estado_cuota"
                    :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
                  />
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <StatusBadge
                    :status="member.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                    :label="member.estado_apto_fisico === 'vigente' ? 'Vigente' : 'Vencido'"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cards Mobile -->
        <div v-if="filteredMembers.length > 0" class="md:hidden">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors last:border-b-0"
            @click="goToMemberDetail(member.id)"
          >
            <div class="flex items-start mb-3">
              <div class="h-10 w-10 flex-shrink-0">
                <div class="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <span class="text-sm font-semibold text-slate-600">
                    {{ getInitials(member.nombre, member.apellido) }}
                  </span>
                </div>
              </div>
              <div class="ml-3 flex-1">
                <h3 class="text-sm font-medium text-gray-900">
                  {{ member.nombre }} {{ member.apellido }}
                </h3>
                <p class="text-sm text-gray-500">DNI: {{ member.dni }}</p>
              </div>
            </div>
            <div class="flex gap-2">
              <StatusBadge
                :status="member.estado_cuota"
                :label="member.estado_cuota === 'activo' ? 'Al día' : 'Vencido'"
              />
              <StatusBadge
                :status="member.estado_apto_fisico === 'vigente' ? 'vigente' : 'vencido_apto'"
                :label="member.estado_apto_fisico === 'vigente' ? 'Apto OK' : 'Apto Vencido'"
              />
            </div>
          </div>
        </div>

        <!-- Sin resultados -->
        <div v-if="filteredMembers.length === 0" class="p-8 text-center">
          <p class="text-gray-500">No se encontraron socios</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMembers } from '@/composables/useMembers'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const router = useRouter()
const { members, loading, error, getMembers } = useMembers()

const searchQuery = ref('')

// Función para obtener iniciales
function getInitials(nombre, apellido) {
  const firstInitial = nombre ? nombre.charAt(0).toUpperCase() : ''
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  return firstInitial + lastInitial
}

// Filtrar socios por búsqueda
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value

  const query = searchQuery.value.toLowerCase()
  return members.value.filter(member => {
    const fullName = `${member.nombre} ${member.apellido}`.toLowerCase()
    const dni = member.dni?.toString() || ''
    return fullName.includes(query) || dni.includes(query)
  })
})

function goToNewMember() {
  router.push({ name: 'NewMember' })
}

function goToMemberDetail(id) {
  router.push({ name: 'MemberDetail', params: { id } })
}

onMounted(async () => {
  await getMembers()
})
</script>
