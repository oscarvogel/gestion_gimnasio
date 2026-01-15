<template>
  <div 
    @click="handleClick"
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary-100"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-gray-400 text-sm font-medium mb-2">{{ title }}</p>
        <p class="text-gray-800 text-3xl font-bold mb-1">{{ value }}</p>
        <div v-if="trend" class="flex items-center gap-1">
          <span 
            :class="[
              'text-sm font-semibold',
              trendIsPositive ? 'text-emerald-600' : 'text-red-600'
            ]"
          >
            {{ trend }}
          </span>
          <span class="text-gray-400 text-xs">vs mes anterior</span>
        </div>
      </div>
      
      <div 
        :class="[
          'p-3 rounded-lg',
          iconBgColor || 'bg-primary-50'
        ]"
      >
        <component 
          :is="icon" 
          :class="[
            'w-6 h-6',
            iconColor || 'text-primary-600'
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  trend: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    required: true
  },
  route: {
    type: String,
    default: ''
  },
  iconBgColor: {
    type: String,
    default: 'bg-primary-50'
  },
  iconColor: {
    type: String,
    default: 'text-primary-600'
  }
})

const router = useRouter()

const trendIsPositive = computed(() => {
  return props.trend.startsWith('+')
})

function handleClick() {
  if (props.route) {
    router.push(props.route)
  }
}
</script>
