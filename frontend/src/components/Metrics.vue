<template>
  <div class="metrics">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}
</style>