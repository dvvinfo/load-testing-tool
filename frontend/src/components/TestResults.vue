<template>
  <div class="results">
    <h2>Результаты теста</h2>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.results {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid var(--color-border-light);
  border-radius: 4px;
  background-color: var(--color-background-light);
}
</style>