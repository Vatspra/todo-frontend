<template>
  <div class="todo-item" :class="{ completed: todo.completed }">
    <div class="todo-content">
      <!-- Checkbox -->
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="handleToggleComplete"
        class="todo-checkbox"
        :disabled="todoStore.loading"
      />
      
      <!-- Todo Info -->
      <div class="todo-info" v-if="!isEditing">
        <div class="todo-title" :class="{ completed: todo.completed }">
          {{ todo.title }}
        </div>
        <div v-if="todo.description" class="todo-description">
          {{ todo.description }}
        </div>
        <div class="todo-meta">
          <span class="todo-date">
            Created: {{ formatDate(todo.createdAt) }}
          </span>
          <span v-if="todo.updatedAt !== todo.createdAt" class="todo-date">
            Updated: {{ formatDate(todo.updatedAt) }}
          </span>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="todo-edit-form" v-else>
        <div class="form-group">
          <input
            v-model="editForm.title"
            type="text"
            class="form-input"
            placeholder="Todo title"
            @keyup.enter="handleSaveEdit"
            @keyup.escape="handleCancelEdit"
          />
        </div>
        <div class="form-group">
          <textarea
            v-model="editForm.description"
            class="form-input form-textarea"
            placeholder="Todo description (optional)"
            rows="2"
            @keyup.escape="handleCancelEdit"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="todo-actions">
      <template v-if="!isEditing">
        <button
          @click="handleStartEdit"
          class="btn btn-small"
          :disabled="todoStore.loading"
        >
          Edit
        </button>
        <button
          @click="handleDelete"
          class="btn btn-small btn-danger"
          :disabled="todoStore.loading"
        >
          Delete
        </button>
      </template>
      <template v-else>
        <button
          @click="handleSaveEdit"
          class="btn btn-small"
          :disabled="!editForm.title?.trim() || todoStore.loading"
        >
          Save
        </button>
        <button
          @click="handleCancelEdit"
          class="btn btn-small"
          :disabled="todoStore.loading"
        >
          Cancel
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import type { Todo, UpdateTodoRequest } from '@/types/Todo'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()
const todoStore = useTodoStore()

// Edit state
const isEditing = ref(false)
const editForm = reactive<UpdateTodoRequest>({
  title: '',
  description: ''
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleToggleComplete = async () => {
  try {
    await todoStore.toggleTodoComplete(props.todo.id)
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

const handleStartEdit = () => {
  editForm.title = props.todo.title
  editForm.description = props.todo.description || ''
  isEditing.value = true
}

const handleSaveEdit = async () => {
  if (!editForm.title?.trim()) return
  
  try {
    await todoStore.updateTodo(props.todo.id, {
      title: editForm.title.trim(),
      description: editForm.description?.trim() || undefined
    })
    isEditing.value = false
  } catch (error) {
    console.error('Failed to update todo:', error)
  }
}

const handleCancelEdit = () => {
  isEditing.value = false
  editForm.title = ''
  editForm.description = ''
}

const handleDelete = async () => {
  if (confirm('Are you sure you want to delete this todo?')) {
    try {
      await todoStore.deleteTodo(props.todo.id)
    } catch (error) {
      console.error('Failed to delete todo:', error)
    }
  }
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: white;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.todo-item:hover {
  border-color: #c7d2fe;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-item.completed {
  background: #f8f9fa;
  opacity: 0.8;
}

.todo-content {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  flex: 1;
}

.todo-checkbox {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.todo-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.todo-info {
  flex: 1;
}

.todo-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #666;
}

.todo-description {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.5;
}

.todo-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.todo-date {
  font-size: 0.85rem;
  color: #888;
}

.todo-edit-form {
  flex: 1;
}

.todo-edit-form .form-group {
  margin-bottom: 12px;
}

.todo-edit-form .form-group:last-child {
  margin-bottom: 0;
}

.todo-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .todo-item {
    flex-direction: column;
    gap: 15px;
  }
  
  .todo-content {
    width: 100%;
  }
  
  .todo-actions {
    justify-content: flex-end;
    width: 100%;
  }
  
  .todo-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style> 