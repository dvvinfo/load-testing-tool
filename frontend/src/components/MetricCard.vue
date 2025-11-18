<template>
  <div class="metric">
    <span class="label">{{ label }}:</span>
    <span class="value" :class="valueClass">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  label: string
  value: string | number
  type?: 'success' | 'error' | 'default'
}>()

const valueClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success'
    case 'error':
      return 'error'
    default:
      return ''
  }
})
</script>

<style scoped>
.metric {
  background-color: var(--color-background-card);
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px var(--color-shadow);
}

.label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--color-text-muted);
}

.value {
  font-size: 24px;
  font-weight: bold;
}

.success {
  color: var(--color-success);
}

.error {
  color: var(--color-error);
}
</style>