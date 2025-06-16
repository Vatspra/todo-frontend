<template>
  <div class="todo-card" :class="{ completed: todo.completed }">
    <div class="card-header">
      <div class="todo-checkbox-container">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="$emit('toggle', todo)"
          class="todo-checkbox"
        />
      </div>
      <div class="todo-title" :class="{ completed: todo.completed }">
        {{ todo.title }}
      </div>
      <div class="card-actions">
        <button @click="$emit('edit', todo)" class="action-btn edit-btn" title="Edit">
          ✏️
        </button>
        <button @click="$emit('delete', todo)" class="action-btn delete-btn" title="Delete">
          🗑️
        </button>
      </div>
    </div>
    
    <div v-if="todo.description" class="todo-description">
      {{ todo.description }}
    </div>
    
    <div class="card-footer">
      <div class="todo-status">
        <span class="status-badge" :class="{ completed: todo.completed }">
          {{ todo.completed ? 'Completed' : 'Pending' }}
        </span>
      </div>
      <div class="todo-dates">
        <span class="date-text">{{ formatDate(todo.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '@/types/Todo'

interface Props {
  todo: Todo
}

defineProps<Props>()
defineEmits<{
  toggle: [todo: Todo]
  edit: [todo: Todo]
  delete: [todo: Todo]
}>()

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.todo-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.todo-card:hover {
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  transform: translateY(-2px);
}

.todo-card.completed {
  background: #f9fafb;
  border-color: #d1d5db;
  opacity: 0.8;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.todo-checkbox-container {
  flex-shrink: 0;
  margin-top: 2px;
}

.todo-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #6366f1;
}

.todo-title {
  flex: 1;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-right: 12px;
}

.todo-title.completed {
  text-decoration: line-through;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  font-size: 1rem;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
}

.edit-btn:hover {
  background: #dbeafe;
}

.delete-btn:hover {
  background: #fee2e2;
}

.todo-description {
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.status-badge {
  background: #fef3c7;
  color: #d97706;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.status-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.date-text {
  font-size: 0.8rem;
  color: #9ca3af;
}

@media (max-width: 480px) {
  .todo-card {
    padding: 16px;
  }
  
  .card-header {
    flex-wrap: wrap;
  }
  
  .card-actions {
    order: 3;
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  .card-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style> 