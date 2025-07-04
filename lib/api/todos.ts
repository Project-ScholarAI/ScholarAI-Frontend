import { getApiUrl } from "@/lib/config/api-config"
import { authenticatedFetch } from "./auth"
import { Todo, TodoFilters, TodoSortOptions, TodoSummary, TodoForm, TodoPlan, PlanGenerationRequest } from "@/types/todo"

export const todosApi = {
  // Get all todos
  getTodos: async (filters?: TodoFilters, sort?: TodoSortOptions): Promise<{ todos: Todo[], summary: TodoSummary }> => {
    try {
      const queryParams = new URLSearchParams()
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              value.forEach(v => queryParams.append(key, String(v)))
            } else if (typeof value === 'object' && key === 'due_date_range') {
              queryParams.append('due_date_start', value.start)
              queryParams.append('due_date_end', value.end)
            } else {
              queryParams.append(key, String(value))
            }
          }
        })
      }

      if (sort) {
        queryParams.append('sort_field', sort.field)
        queryParams.append('sort_direction', sort.direction)
      }

      const url = `${getApiUrl("/api/v1/todos")}${queryParams.toString() ? '?' + queryParams.toString() : ''}`
      const response = await authenticatedFetch(url)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.statusText}`)
      }
      
      const data = await response.json()
      return {
        todos: data.data.todos || [],
        summary: data.data.summary
      }
    } catch (error) {
      console.error("Get todos error:", error)
      return {
        todos: [],
        summary: {
          total: 0,
          by_status: { pending: 0, in_progress: 0, completed: 0, cancelled: 0 },
          by_priority: { urgent: 0, high: 0, medium: 0, low: 0 },
          overdue: 0,
          due_today: 0,
          due_this_week: 0
        }
      }
    }
  },

  // Create new todo
  createTodo: async (todoData: TodoForm): Promise<{success: boolean, data?: Todo, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/todos"), {
        method: "POST",
        body: JSON.stringify(todoData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to create todo")
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error("Create todo error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create todo"
      }
    }
  },

  // Update todo
  updateTodo: async (todoId: string, todoData: Partial<TodoForm>): Promise<{success: boolean, data?: Todo, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl(`/api/v1/todos/${todoId}`), {
        method: "PUT",
        body: JSON.stringify(todoData)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update todo")
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error("Update todo error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update todo"
      }
    }
  },

  // Update todo status
  updateTodoStatus: async (todoId: string, status: Todo['status']): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl(`/api/v1/todos/${todoId}/status`), {
        method: "PATCH",
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to update todo status")
      }
      
      return { success: true, message: data.message }
    } catch (error) {
      console.error("Update todo status error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to update todo status"
      }
    }
  },

  // Delete todo
  deleteTodo: async (todoId: string): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl(`/api/v1/todos/${todoId}`), {
        method: "DELETE"
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete todo")
      }
      
      return { success: true, message: data.message }
    } catch (error) {
      console.error("Delete todo error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete todo"
      }
    }
  },

  // Generate plan from selected todos
  generatePlan: async (request: PlanGenerationRequest): Promise<{success: boolean, data?: TodoPlan, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/todos/generate-plan"), {
        method: "POST",
        body: JSON.stringify(request)
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate plan")
      }
      
      return {
        success: true,
        data: data.data,
        message: data.message
      }
    } catch (error) {
      console.error("Generate plan error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate plan"
      }
    }
  },

  // Get all plans
  getPlans: async (): Promise<TodoPlan[]> => {
    try {
      const response = await authenticatedFetch(getApiUrl("/api/v1/todos/plans"))
      
      if (!response.ok) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.data || []
    } catch (error) {
      console.error("Get plans error:", error)
      return []
    }
  },

  // Add subtask
  addSubtask: async (todoId: string, title: string): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl(`/api/v1/todos/${todoId}/subtasks`), {
        method: "POST",
        body: JSON.stringify({ title })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to add subtask")
      }
      
      return { success: true, message: data.message }
    } catch (error) {
      console.error("Add subtask error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to add subtask"
      }
    }
  },

  // Toggle subtask completion
  toggleSubtask: async (todoId: string, subtaskId: string): Promise<{success: boolean, message?: string}> => {
    try {
      const response = await authenticatedFetch(getApiUrl(`/api/v1/todos/${todoId}/subtasks/${subtaskId}/toggle`), {
        method: "PATCH"
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle subtask")
      }
      
      return { success: true, message: data.message }
    } catch (error) {
      console.error("Toggle subtask error:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to toggle subtask"
      }
    }
  }
} 