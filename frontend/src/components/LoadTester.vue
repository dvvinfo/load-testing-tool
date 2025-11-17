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
    
    <button 
      @click="startLoadTest" 
      :disabled="isLoading"
      class="start-button"
    >
      {{ isLoading ? 'Testing...' : 'Start Load Test' }}
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

// Test state
const isLoading = ref(false)
const hasResults = ref(false)

// Metrics
const sentRequests = ref(0)
const successfulRequests = ref(0)
const failedRequests = ref(0)
const startTime = ref(0)
const endTime = ref(0)

// Computed
const elapsedTime = computed(() => {
  if (startTime.value === 0) return 0
  if (endTime.value === 0) {
    // Still running
    return Date.now() - startTime.value
  }
  return endTime.value - startTime.value
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
  
  // Run the load test
  await runLoadTest()
  
  // Finish
  endTime.value = Date.now()
  isLoading.value = false
}

const runLoadTest = async () => {
  const promises = []
  
  for (let i = 0; i < requestsCount.value; i++) {
    // Add a small delay between requests if specified
    if (delayMs.value > 0 && i > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs.value))
    }
    
    // Send request
    sentRequests.value++
    
    // Create promise for this request
    const promise = fetch('http://localhost:3000/items?limit=10&offset=0')
      .then(response => {
        if (response.ok) {
          successfulRequests.value++
        } else {
          failedRequests.value++
        }
      })
      .catch(error => {
        console.error('Request failed:', error)
        failedRequests.value++
      })
    
    // Add to promises array
    promises.push(promise)
  }
  
  // Wait for all requests to complete
  await Promise.all(promises)
}
</script>

<style scoped>
.load-tester {
  max-width: 600px;
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
}

.start-button:hover:not(:disabled) {
  background-color: #359c6d;
}

.start-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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