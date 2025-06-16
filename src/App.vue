<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import TodoList from '@/components/TodoList.vue'

const todoStore = useTodoStore()
const connectionStatus = ref<{type: string, message: string} | null>(null)

const testBackendConnection = async () => {
  try {
    const result = await todoStore.testConnection()
    if (result) {
      connectionStatus.value = {
        type: 'success',
        message: '✅ Connected to backend successfully'
      }
    } else {
      connectionStatus.value = {
        type: 'error',
        message: '❌ Failed to connect to backend'
      }
    }
  } catch (error) {
    connectionStatus.value = {
      type: 'error',
      message: '❌ Backend connection error'
    }
  }
  
  // Hide the status message after 3 seconds
  setTimeout(() => {
    connectionStatus.value = null
  }, 3000)
}

onMounted(async () => {
  await testBackendConnection()
})
</script>

<template>
  <div id="app">
    <div class="container">
      <!-- Connection Status -->
      <div v-if="connectionStatus" class="connection-status" :class="connectionStatus.type">
        {{ connectionStatus.message }}
      </div>

      <!-- Global Error Message -->
      <div v-if="todoStore.error" class="error-message">
        {{ todoStore.error }}
        <button @click="todoStore.clearError" class="btn btn-small">
          Dismiss
        </button>
      </div>

      <!-- Main Todo List Component -->
      <TodoList />
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.connection-status {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.connection-status.success {
  background: #d1f2eb;
  color: #0e6b4a;
  border: 1px solid #7dcea0;
}

.connection-status.error {
  background: #fadbd8;
  color: #a93226;
  border: 1px solid #f1948a;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  margin: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #b91c1c;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small {
  background: #f3f4f6;
  color: #374151;
}

.btn-small:hover {
  background: #e5e7eb;
}

@media (max-width: 768px) {
  .connection-status {
    top: 10px;
    right: 10px;
    left: 10px;
    text-align: center;
  }
  
  .error-message {
    margin: 10px;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
</style>
