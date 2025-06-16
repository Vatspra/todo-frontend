<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ title }}</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="title" class="form-label">Title *</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            class="form-input"
            placeholder="Enter todo title"
            required
            ref="titleInput"
          />
        </div>
        
        <div class="form-group">
          <label for="description" class="form-label">Description</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="form-input form-textarea"
            placeholder="Enter todo description (optional)"
            rows="4"
          ></textarea>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="!formData.title.trim()">
            {{ todo ? 'Update' : 'Add' }} Todo
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/Todo'

interface Props {
  isOpen: boolean
  title: string
  todo?: Todo
}

const props = defineProps<Props>()
const emits = defineEmits<{
  close: []
  save: [data: CreateTodoRequest | UpdateTodoRequest]
}>()

const titleInput = ref<HTMLInputElement>()
const formData = reactive({
  title: '',
  description: ''
})

// Reset form when modal opens/closes or todo changes
watch([() => props.isOpen, () => props.todo], ([isOpen, todo]) => {
  console.log('Modal watch triggered:', { isOpen, todo })
  if (isOpen) {
    if (todo) {
      // Edit mode - prefill with existing todo data
      console.log('Prefilling form with todo:', todo)
      formData.title = todo.title
      formData.description = todo.description || ''
    } else {
      // Add mode - clear form
      console.log('Clearing form for new todo')
      formData.title = ''
      formData.description = ''
    }
    
    // Focus the title input after form is populated
    nextTick(() => {
      titleInput.value?.focus()
    })
  }
}, { immediate: true })

// Also watch the todo prop separately to handle updates
watch(() => props.todo, (newTodo) => {
  console.log('Todo prop changed:', newTodo)
  if (props.isOpen && newTodo) {
    formData.title = newTodo.title
    formData.description = newTodo.description || ''
  }
}, { immediate: true })

const handleSubmit = () => {
  if (!formData.title.trim()) return
  
  const data = {
    title: formData.title.trim(),
    description: formData.description.trim() || undefined
  }
  
  emits('save', data)
}

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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-form {
  padding: 0 24px 24px 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #6366f1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5b21b6;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px 20px 0 20px;
  }
  
  .modal-form {
    padding: 0 20px 20px 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions .btn {
    width: 100%;
  }
}
</style> 