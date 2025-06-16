<template>
  <div class="todo-app">
    <!-- Header with search and add button -->
    <div class="app-header">
      <div class="header-content">
        <h1>Todo Manager</h1>
        <div class="header-actions">
          <div class="search-container">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search todos..."
              class="search-input"
              @input="handleSearch"
            />
            <span class="search-icon">🔍</span>
          </div>
          <button @click="showAddModal = true" class="btn btn-primary">
            <span class="btn-icon">+</span>
            Add Todo
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-container">
      <div class="filter-tabs">
        <button 
          @click="setFilter('all')" 
          :class="['filter-tab', { active: currentFilter === 'all' }]"
        >
          All ({{ totalCount }})
        </button>
        <button 
          @click="setFilter('incomplete')" 
          :class="['filter-tab', { active: currentFilter === 'incomplete' }]"
        >
          Todo ({{ pendingCount }})
        </button>
        <button 
          @click="setFilter('completed')" 
          :class="['filter-tab', { active: currentFilter === 'completed' }]"
        >
          Completed ({{ completedCount }})
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && todos.length === 0" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading todos...</p>
    </div>

    <!-- Todo List -->
    <div v-else-if="todos.length > 0" class="todos-container" ref="todosContainer">
      <div class="todos-grid">
        <TodoCard 
          v-for="todo in todos" 
          :key="todo.id" 
          :todo="todo"
          @edit="handleEdit"
          @delete="handleDelete"
          @toggle="handleToggle"
        />
      </div>
      
      <!-- Load More Loading -->
      <div v-if="loadingMore" class="load-more-loading">
        <div class="loading-spinner"></div>
        <p>Loading more todos...</p>
      </div>
      
      <!-- End of list indicator -->
      <div v-if="!hasMore && todos.length > 0" class="end-of-list">
        <p>You've reached the end!</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <h3>{{ searchTerm ? 'No todos found' : 'No todos yet' }}</h3>
      <p>{{ searchTerm ? 'Try adjusting your search or filter.' : 'Add your first todo to get started!' }}</p>
      <button v-if="!searchTerm" @click="showAddModal = true" class="btn btn-primary">
        Add Your First Todo
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <div>
          <h4>Something went wrong</h4>
          <p>{{ error }}</p>
        </div>
        <button @click="retryLoad" class="btn btn-secondary">Retry</button>
      </div>
    </div>

    <!-- Add Todo Modal -->
    <TodoModal 
      v-if="showAddModal"
      :isOpen="showAddModal"
      title="Add New Todo"
      @close="showAddModal = false"
      @save="handleAdd"
    />

    <!-- Edit Todo Modal -->  
    <TodoModal 
      v-if="showEditModal && editingTodo"
      :isOpen="showEditModal"
      :todo="editingTodo"
      title="Edit Todo"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      v-if="showDeleteModal && deletingTodo"
      :isOpen="showDeleteModal"
      title="Delete Todo"
      :message="`Are you sure you want to delete '${deletingTodo.title}'?`"
      @close="showDeleteModal = false"
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTodoStore } from '@/stores/todoStore'
import TodoCard from './TodoCard.vue'
import TodoModal from './TodoModal.vue'
import ConfirmModal from './ConfirmModal.vue'
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/Todo'

const todoStore = useTodoStore()

// State
const todos = ref<Todo[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const searchTerm = ref('')
const currentFilter = ref<'all' | 'incomplete' | 'completed'>('all')
const currentPage = ref(1)
const hasMore = ref(true)
const totalCount = ref(0)
const pendingCount = ref(0)
const completedCount = ref(0)

// Modal states
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const editingTodo = ref<Todo | null>(null)
const deletingTodo = ref<Todo | null>(null)

// Refs
const todosContainer = ref<HTMLElement>()

// Search debouncing
let searchTimeout: any;

// Computed
const filterStatus = computed(() => {
  switch (currentFilter.value) {
    case 'completed': return 'completed'
    case 'incomplete': return 'pending'
    default: return undefined
  }
})

// Methods
const loadTodos = async (reset = false) => {
  try {
    if (reset) {
      loading.value = true
      currentPage.value = 1
      hasMore.value = true
      todos.value = []
    } else {
      loadingMore.value = true
    }

    const response = await todoStore.fetchPaginatedTodos(currentPage.value, 10, filterStatus.value)
    
    if (response && response.todos) {
      if (reset) {
        todos.value = response.todos
      } else {
        todos.value.push(...response.todos)
      }
      
      hasMore.value = response.pagination.hasNext
      totalCount.value = response.pagination.total
      
      // Update counts based on current data
      updateCounts()
    }
  } catch (err) {
    error.value = 'Failed to load todos'
    console.error('Error loading todos:', err)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const updateCounts = async () => {
  try {
    // Get counts for all statuses
    const [allResponse, pendingResponse, completedResponse] = await Promise.all([
      todoStore.fetchPaginatedTodos(1, 1),
      todoStore.fetchPaginatedTodos(1, 1, 'pending'),
      todoStore.fetchPaginatedTodos(1, 1, 'completed')
    ])
    
    totalCount.value = allResponse?.pagination?.total || 0
    pendingCount.value = pendingResponse?.pagination?.total || 0
    completedCount.value = completedResponse?.pagination?.total || 0
  } catch (err) {
    console.error('Error updating counts:', err)
  }
}

const setFilter = async (filter: 'all' | 'incomplete' | 'completed') => {
  if (currentFilter.value === filter) return
  
  currentFilter.value = filter
  await loadTodos(true)
}

const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    // For now, we'll implement client-side search since the API doesn't support search
    // In a real app, you'd want server-side search
    await loadTodos(true)
  }, 300)
}

const handleAdd = async (data: CreateTodoRequest | UpdateTodoRequest) => {
  try {
    await todoStore.createTodo(data as CreateTodoRequest)
    showAddModal.value = false
    await loadTodos(true) // Refresh the list
  } catch (err) {
    console.error('Failed to add todo:', err)
  }
}

const handleEdit = (todo: Todo) => {
  console.log('Edit clicked for todo:', todo)
  editingTodo.value = todo
  console.log('Set editingTodo.value to:', editingTodo.value)
  showEditModal.value = true
  console.log('Opened edit modal')
}

const handleSaveEdit = async (data: CreateTodoRequest | UpdateTodoRequest) => {
  if (!editingTodo.value) return
  
  try {
    await todoStore.updateTodo(editingTodo.value.id, data as UpdateTodoRequest)
    showEditModal.value = false
    editingTodo.value = null
    await loadTodos(true) // Refresh the list
  } catch (err) {
    console.error('Failed to update todo:', err)
  }
}

const handleDelete = (todo: Todo) => {
  deletingTodo.value = todo
  showDeleteModal.value = true
}

const handleConfirmDelete = async () => {
  if (!deletingTodo.value) return
  
  try {
    await todoStore.deleteTodo(deletingTodo.value.id)
    showDeleteModal.value = false
    deletingTodo.value = null
    await loadTodos(true) // Refresh the list
  } catch (err) {
    console.error('Failed to delete todo:', err)
  }
}

const handleToggle = async (todo: Todo) => {
  try {
    await todoStore.toggleTodoComplete(todo.id)
    await loadTodos(true) // Refresh the list
  } catch (err) {
    console.error('Failed to toggle todo:', err)
  }
}

const retryLoad = () => {
  error.value = null
  loadTodos(true)
}

// Infinite scroll
const handleScroll = () => {
  if (!todosContainer.value || loadingMore.value || !hasMore.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = todosContainer.value
  if (scrollTop + clientHeight >= scrollHeight - 5) {
    currentPage.value++
    loadTodos()
  }
}

// Lifecycle
onMounted(async () => {
  await loadTodos(true)
  
  // Add scroll listener for infinite scroll
  if (todosContainer.value) {
    todosContainer.value.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (todosContainer.value) {
    todosContainer.value.removeEventListener('scroll', handleScroll)
  }
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style scoped>
.todo-app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin: -20px -20px 30px -20px;
  border-radius: 0 0 20px 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.header-content h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 700;
}

.header-actions {
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
}

.search-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0.6;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

.filters-container {
  margin-bottom: 30px;
}

.filter-tabs {
  display: flex;
  gap: 0;
  background: #f3f4f6;
  border-radius: 12px;
  padding: 4px;
  max-width: 400px;
}

.filter-tab {
  flex: 1;
  background: none;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #6b7280;
}

.filter-tab:hover {
  color: #374151;
}

.filter-tab.active {
  background: white;
  color: #4f46e5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.todos-container {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 10px;
}

.todos-container::-webkit-scrollbar {
  width: 6px;
}

.todos-container::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.todos-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.todos-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.todos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.loading-state, .load-more-loading {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #4f46e5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #374151;
}

.empty-state p {
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.end-of-list {
  text-align: center;
  padding: 20px;
  color: #9ca3af;
  font-style: italic;
}

.error-state {
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.error-icon {
  font-size: 1.5rem;
}

.error-content h4 {
  margin: 0 0 5px 0;
  color: #dc2626;
}

.error-content p {
  margin: 0;
  color: #b91c1c;
}

@media (max-width: 768px) {
  .todo-app {
    padding: 10px;
  }
  
  .app-header {
    margin: -10px -10px 20px -10px;
    padding: 30px 0;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
  
  .todos-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .filter-tabs {
    max-width: none;
  }
  
  .filter-tab {
    font-size: 0.9rem;
    padding: 10px 15px;
  }
}
</style> 