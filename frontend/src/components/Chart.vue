<template>
  <div class="chart-container">
    <h3>Запросы по времени</h3>
    <div class="chart">
      <div v-for="(point, index) in chartData" :key="index" class="chart-bar" :style="{ height: point.height + '%' }"
        :title="`Время: ${point.time}с\nУспешно: ${point.success}\nОшибки: ${point.failed}`"></div>
    </div>
    <div class="chart-labels">
      <span>Начало</span>
      <span>Конец</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ChartPoint {
  time: number
  success: number
  failed: number
  height: number
}

defineProps<{
  chartData: ChartPoint[]
}>()
</script>

<style scoped>
.chart-container {
  margin: 30px 0;
}

.chart-container h3 {
  text-align: center;
  margin-bottom: 15px;
}

.chart {
  display: flex;
  align-items: end;
  height: 200px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 10px;
  background-color: var(--color-background-card);
  margin-bottom: 5px;
}

.chart-bar {
  flex: 1;
  background-color: var(--color-chart-bar);
  margin: 0 1px;
  min-width: 4px;
  position: relative;
}

.chart-bar:before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background-color: var(--color-chart-bar-failed);
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>