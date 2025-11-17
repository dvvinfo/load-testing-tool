<template>
  <div class="app-input">
    <label :for="id">{{ label }}</label>
    <input 
      :id="id"
      :value="modelValue"
      @input="handleInput"
      :type="type"
      :min="min"
      :max="max"
      :placeholder="placeholder"
    >
  </div>
</template>

<script setup lang="ts">
// Define props
const props = defineProps<{
  id: string
  label: string
  modelValue: number | string
  type?: string
  min?: number | string
  max?: number | string
  placeholder?: string
}>()

// Define emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: number | string): void
}>()

// Handle input event
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? parseFloat(target.value) || 0 : target.value
  emit('update:modelValue', value)
}
</script>

<style scoped>
.app-input {
  margin-bottom: 20px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-sizing: border-box;
  background-color: var(--color-background-card);
}
</style>