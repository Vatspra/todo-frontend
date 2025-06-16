<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <div class="warning-icon">⚠️</div>
        <h3>{{ title }}</h3>
      </div>
      
      <div class="modal-body">
        <p>{{ message }}</p>
      </div>
      
      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-secondary">
          Cancel
        </button>
        <button @click="$emit('confirm')" class="btn btn-danger">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  isOpen: boolean
  title: string
  message: string
}

const props = defineProps<Props>()
const emits = defineEmits<{
  close: []
  confirm: []
}>()

const handleOverlayClick = () => {
  emits('close')
}

// Handle escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emits('close')
  }
}

// Add/remove event listener for escape key
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 16px 24px;
}

.warning-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-body {
  padding: 0 24px 24px 24px;
}

.modal-body p {
  margin: 0;
  color: #6b7280;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 0 24px 24px 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
}

.btn-danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 16px 20px;
  }
  
  .modal-body {
    padding: 0 20px 20px 20px;
  }
  
  .modal-actions {
    padding: 0 20px 20px 20px;
    flex-direction: column;
  }
  
  .modal-actions .btn {
    width: 100%;
  }
}
</style> 