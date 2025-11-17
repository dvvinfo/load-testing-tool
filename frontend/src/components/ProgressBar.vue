<template>
  <div class="progress">
    <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
  </div>
</template>

<script setup lang="ts">
// Define props
defineProps<{
  progressPercentage: number
}>()
</script>

<style scoped>
.progress {
  width: 100%;
  height: 20px;
  background-color: var(--color-background-progress);
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}
</style>