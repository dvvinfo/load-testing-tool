<template>
  <div class="load-tester">
    <h1>Load Testing Tool</h1>
    
    <div class="form-group">
      <label for="requestsCount">Number of Requests:</label>
      <input 
        id="requestsCount" 
        v-model.number="requestsCount" 
        type="number" 
        min="1" 
        max="10000"
        placeholder="Enter number of requests"
      >
    </div>
    
    <div class="form-group">
      <label for="delayMs">Delay Between Requests (ms):</label>
      <input 
        id="delayMs" 
        v-model.number="delayMs" 
        type="number" 
        min="0" 
        max="10000"
        placeholder="Enter delay in milliseconds"
      >
    </div>
    
    <div class="form-group">
      <label for="concurrentRequests">Concurrent Requests:</label>
      <input 
        id="concurrentRequests" 
        v-model.number="concurrentRequests" 
        type="number" 
        min="1" 
        max="100"
        placeholder="Enter concurrent requests"
      >
    </div>
    
    <button 
      @click="startLoadTest" 
      :disabled="isLoading"
      class="start-button"
    >
      {{ isLoading ? 'Testing...' : 'Start Load Test' }}
    </button>
    
    <button 
      v-if="isLoading"
      @click="stopLoadTest" 
      class="stop-button"
    >
      Stop Test
    </button>
    
    <div v-if="isLoading || hasResults" class="results">
      <h2>Test Results</h2>
      <div class="metrics">
        <div class="metric">
          <span class="label">Sent:</span>
          <span class="value">{{ sentRequests }}</span>
        </div>
        <div class="metric">
          <span class="label">Successful:</span>
          <span class="value success">{{ successfulRequests }}</span>
        </div>
        <div class="metric">
          <span class="label">Failed:</span>
          <span class="value error">{{ failedRequests }}</span>
        </div>
        <div class="metric">
          <span class="label">Elapsed Time:</span>
          <span class="value">{{ elapsedTime }} ms</span>
        </div>
        <div class="metric">
          <span class="label">RPS (Avg):</span>
          <span class="value">{{ requestsPerSecond }}</span>
        </div>
      </div>
      
      <div class="chart-container">
        <h3>Requests Over Time</h3>
        <div class="chart">
          <div 
            v-for="(point, index) in chartData" 
            :key="index"
            class="chart-bar"
            :style="{ height: point.height + '%' }"
            :title="`Time: ${point.time}s\nSuccess: ${point.success}\nFailed: ${point.failed}`"
          ></div>
        </div>
        <div class="chart-labels">
          <span>Start</span>
          <span>End</span>
        </div>
      </div>
      
      <div v-if="isLoading" class="progress">
        <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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

// Computed
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
  
  // Finish
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
    
    // Wait for this batch to complete before moving to the next
    await Promise.all(batchPromises)
  }
  
  // Wait for all requests to complete (this is redundant but safe)
  await Promise.all(promises)
  
  // Final chart update
  updateChartData()
  clearInterval(chartInterval)
}
</script>

<style scoped>
.load-tester {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
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
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.start-button {
  background-color: #42b883;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-right: 10px;
}

.start-button:hover:not(:disabled) {
  background-color: #359c6d;
}

.start-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.stop-button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.stop-button:hover {
  background-color: #c0392b;
}

.results {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.metric {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
  color: #666;
}

.value {
  font-size: 24px;
  font-weight: bold;
}

.success {
  color: #42b883;
}

.error {
  color: #e74c3c;
}

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
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  background-color: white;
  margin-bottom: 5px;
}

.chart-bar {
  flex: 1;
  background-color: #3498db;
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
  background-color: #e74c3c;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.progress {
  width: 100%;
  height: 20px;
  background-color: #eee;
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #42b883;
  transition: width 0.3s ease;
}
</style>