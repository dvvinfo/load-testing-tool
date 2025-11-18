<template>
  <div class="container">
    <h1 class="title">Инструмент нагрузочного тестирования</h1>

    <ParametersForm>
      <AppInput id="requestsCount" label="Количество запросов:" v-model="requestsCount" type="number" :min="1"
        :max="10000" placeholder="Введите количество запросов" />

      <AppInput id="delayMs" label="Задержка между запросами (мс):" v-model="delayMs" type="number" :min="0"
        :max="10000" placeholder="Введите задержку в миллисекундах" />

      <AppInput id="concurrentRequests" label="Параллельные запросы:" v-model="concurrentRequests" type="number"
        :min="1" :max="100" placeholder="Введите количество параллельных запросов" />
    </ParametersForm>

    <AppButton @click="startLoadTest" :disabled="isLoading" variant="primary">
      {{ isLoading ? 'Тестирование...' : 'Начать нагрузочный тест' }}
    </AppButton>

    <AppButton v-if="isLoading" @click="stopLoadTest" variant="danger">
      Остановить тест
    </AppButton>

    <TestResults v-if="isLoading || hasResults">
      <Metrics>
        <MetricCard label="Отправлено" :value="sentRequests" />
        <MetricCard label="Успешно" :value="successfulRequests" type="success" />
        <MetricCard label="Ошибки" :value="failedRequests" type="error" />
        <MetricCard label="Время" :value="elapsedTime + ' мс'" />
        <MetricCard label="RPS (Среднее)" :value="requestsPerSecond" />
      </Metrics>

      <Chart :chart-data="chartData" />

      <ProgressBar v-if="isLoading" :progress-percentage="progressPercentage" />
    </TestResults>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppInput from '@/components/AppInput.vue'
import AppButton from '@/components/AppButton.vue'
import ParametersForm from '@/components/ParametersForm.vue'
import TestResults from '@/components/TestResults.vue'
import Metrics from '@/components/Metrics.vue'
import MetricCard from '@/components/MetricCard.vue'
import Chart from '@/components/Chart.vue'
import ProgressBar from '@/components/ProgressBar.vue'

// Form inputs
const requestsCount = ref(100)
const delayMs = ref(100)
const concurrentRequests = ref(5)

// Test state
const isLoading = ref(false)
const hasResults = ref(false)
const shouldStop = ref(false)

// Metrics
const sentRequests = ref(0)
const successfulRequests = ref(0)
const failedRequests = ref(0)
const startTime = ref(0)
const endTime = ref(0)

// Chart data
interface ChartPoint {
  time: number
  success: number
  failed: number
  height: number
}

const chartData = ref<ChartPoint[]>([])

const elapsedTime = computed(() => {
  if (startTime.value === 0) return 0
  if (endTime.value === 0) {
    // Still running
    return Date.now() - startTime.value
  }
  return endTime.value - startTime.value
})

const requestsPerSecond = computed(() => {
  if (elapsedTime.value === 0) return 0
  return (successfulRequests.value / (elapsedTime.value / 1000)).toFixed(2)
})

const progressPercentage = computed(() => {
  if (requestsCount.value === 0) return 0
  return (sentRequests.value / requestsCount.value) * 100
})

// Methods
const startLoadTest = async () => {
  // Reset metrics
  sentRequests.value = 0
  successfulRequests.value = 0
  failedRequests.value = 0
  startTime.value = Date.now()
  endTime.value = 0
  hasResults.value = true
  isLoading.value = true
  shouldStop.value = false
  chartData.value = []

  // Run the load test
  await runLoadTest()

  endTime.value = Date.now()
  isLoading.value = false
}

const stopLoadTest = () => {
  shouldStop.value = true
}

const updateChartData = () => {
  if (startTime.value === 0) return

  const elapsedSeconds = Math.floor((Date.now() - startTime.value) / 1000)

  // If we don't have a data point for this second, create one
  if (chartData.value.length <= elapsedSeconds) {
    chartData.value.push({
      time: elapsedSeconds,
      success: successfulRequests.value,
      failed: failedRequests.value,
      height: 0
    })
  } else {
    // Update the current second's data
    const point = chartData.value[elapsedSeconds]
    if (point) {
      point.success = successfulRequests.value
      point.failed = failedRequests.value
    }
  }

  // Calculate heights for all bars (as percentage of max requests in any second)
  const maxRequests = Math.max(
    1,
    ...chartData.value.map(point => point.success + point.failed)
  )

  chartData.value.forEach(point => {
    point.height = ((point.success + point.failed) / maxRequests) * 100
  })
}

const runLoadTest = async () => {
  // Update chart data every 500ms
  const chartInterval = setInterval(() => {
    if (!isLoading.value) {
      clearInterval(chartInterval)
      return
    }
    updateChartData()
  }, 500)

  // Create an array of promises for all requests
  const promises = []

  // Process requests in batches based on concurrency level
  for (let i = 0; i < requestsCount.value; i += concurrentRequests.value) {
    // Check if we should stop
    if (shouldStop.value) break

    // Create a batch of requests
    const batchSize = Math.min(concurrentRequests.value, requestsCount.value - i)
    const batchPromises = []

    for (let j = 0; j < batchSize; j++) {
      // Add a small delay between requests if specified
      if (delayMs.value > 0 && (i + j) > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs.value))
      }

      // Check if we should stop
      if (shouldStop.value) break

      // Send request
      sentRequests.value++

      // Create promise for this request
      const promise = fetch('/api/items?limit=10&offset=0')
        .then(async response => {
          if (response.ok) {
            successfulRequests.value++
            // Read response body to complete the request
            await response.text()
          } else {
            failedRequests.value++
          }
          updateChartData()
        })
        .catch(error => {
          console.error('Request failed:', error)
          failedRequests.value++
          updateChartData()
        })

      batchPromises.push(promise)
    }

    // Add batch promises to main promises array
    promises.push(...batchPromises)

    await Promise.all(batchPromises)
  }

  await Promise.all(promises)

  // Final chart update
  updateChartData()
  clearInterval(chartInterval)
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  font-size: 30px;
  margin-bottom: 20px;
}
</style>