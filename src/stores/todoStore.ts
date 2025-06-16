import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/types/Todo';

const API_BASE_URL = 'https://todo-6dso.onrender.com/api/todos';

export const useTodoStore = defineStore('todo', () => {
  // State
  const todos = ref<Todo[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const stats = ref<any>(null);

  // Getters
  const completedTodos = computed(() => todos.value.filter(todo => todo.completed));
  const incompleteTodos = computed(() => todos.value.filter(todo => !todo.completed));
  const todoCount = computed(() => todos.value.length);
  const completedCount = computed(() => completedTodos.value.length);

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setError = (message: string | null) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const fetchTodos = async (status?: 'completed' | 'pending') => {
    try {
      setLoading(true);
      clearError();
      
      const params = status ? { status } : {};
      const response = await axios.get(API_BASE_URL, { params });
      todos.value = response.data.data;
    } catch (err) {
      setError('Failed to fetch todos');
      console.error('Error fetching todos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodoStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/stats`);
      stats.value = response.data;
      return response.data;
    } catch (err) {
      console.error('Error fetching todo stats:', err);
      return null;
    }
  };

  const fetchPaginatedTodos = async (page: number = 1, limit: number = 10, status?: 'completed' | 'pending') => {
    try {
      setLoading(true);
      clearError();
      
      const params: any = { page, limit };
      if (status) {
        params.status = status;
      }
      
      const response = await axios.get(`${API_BASE_URL}/paginated`, {
        params
      });
      return {
        todos: response.data.data,
        pagination: response.data.pagination
      };
    } catch (err) {
      setError('Failed to fetch paginated todos');
      console.error('Error fetching paginated todos:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTodoById = async (id: number) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await axios.get<Todo>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (err) {
      setError('Failed to fetch todo');
      console.error('Error fetching todo by ID:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (todoData: CreateTodoRequest) => {
    try {
      setLoading(true);
      clearError();
      const response = await axios.post(API_BASE_URL, todoData);
      const newTodo = response.data.data;
      todos.value.push(newTodo);
      return newTodo;
    } catch (err) {
      setError('Failed to create todo');
      console.error('Error creating todo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTodo = async (id: number, todoData: UpdateTodoRequest) => {
    try {
      setLoading(true);
      clearError();
      const response = await axios.put(`${API_BASE_URL}/${id}`, todoData);
      const updatedTodo = response.data.data;
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }
      return updatedTodo;
    } catch (err) {
      setError('Failed to update todo');
      console.error('Error updating todo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTodo = async (id: number) => {
    try {
      setLoading(true);
      clearError();
      await axios.delete(`${API_BASE_URL}/${id}`);
      todos.value = todos.value.filter(todo => todo.id !== id);
    } catch (err) {
      setError('Failed to delete todo');
      console.error('Error deleting todo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleTodoComplete = async (id: number) => {
    try {
      setLoading(true);
      clearError();
      
      const response = await axios.patch(`${API_BASE_URL}/${id}/toggle`);
      const updatedTodo = response.data.data;
      const index = todos.value.findIndex(todo => todo.id === id);
      if (index !== -1) {
        todos.value[index] = updatedTodo;
      }
      return updatedTodo;
    } catch (err) {
      setError('Failed to toggle todo');
      console.error('Error toggling todo:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      return response.data;
    } catch (err) {
      console.error('Error testing connection:', err);
      return null;
    }
  };

  return {
    // State
    todos,
    loading,
    error,
    stats,
    
    // Getters
    completedTodos,
    incompleteTodos,
    todoCount,
    completedCount,
    
    // Actions
    fetchTodos,
    fetchTodoStats,
    fetchPaginatedTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoComplete,
    testConnection,
    clearError
  };
}); 