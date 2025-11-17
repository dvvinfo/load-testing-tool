<template>
  <button 
    :class="['app-button', variant, { disabled: disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
// Define props
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}>()

// Define emits
const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

// Handle click event
const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.app-button {
  padding: 12px 24px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

.app-button.primary {
  background-color: var(--color-primary);
  color: white;
}

.app-button.primary:hover:not(.disabled) {
  background-color: var(--color-primary-dark);
}

.app-button.secondary {
  background-color: var(--color-secondary);
  color: #333;
}

.app-button.secondary:hover:not(.disabled) {
  background-color: var(--color-secondary-dark);
}

.app-button.danger {
  background-color: var(--color-danger);
  color: white;
}

.app-button.danger:hover:not(.disabled) {
  background-color: var(--color-danger-dark);
}

.app-button.disabled {
  background-color: var(--color-disabled);
  cursor: not-allowed;
}
</style>