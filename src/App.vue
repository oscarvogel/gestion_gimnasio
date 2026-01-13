<template>
  <div id="app" class="min-h-screen">
    <!-- Mostrar loading mientras se inicializa la sesión -->
    <div v-if="userStore.loading" class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="text-center">
        <div class="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
        <p class="text-gray-600">Cargando...</p>
      </div>
    </div>
    <!-- Una vez inicializado, mostrar el contenido -->
    <router-view v-else />
    
    <!-- Toaster Global para notificaciones -->
    <Toaster position="top-center" :richColors="true" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { Toaster } from 'vue-sonner'
import { useUserStore } from './stores/userStore'

const userStore = useUserStore()

// Inicializar la sesión al cargar la app
onMounted(async () => {
  await userStore.initSession()
})
</script>

<style scoped>
/* Estilos específicos del componente principal si son necesarios */
</style>
