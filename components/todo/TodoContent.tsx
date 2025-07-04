"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { 
  CheckSquare, 
  Plus, 
  MoreVertical,
  Calendar,
  Clock,
  Tag,
  Filter,
  SortAsc,
  Loader2,
  Trash2,
  Edit,
  CheckCircle,
  Play,
  Square,
  AlertTriangle,
  Target,
  Flag,
  Brain,
  User,
  Users,
  Search,
  X,
  CalendarDays,
  Timer,
  BookOpen,
  FileText,
  Lightbulb,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Calendar as CalendarIcon,
  Eye,
  EyeOff
} from "lucide-react"
import { format, formatDistance, isAfter, isBefore, isToday, isThisWeek, parseISO } from "date-fns"
import { cn } from "@/lib/utils/cn"
import { todosApi } from "@/lib/api/todos"
import { Todo, TodoFilters, TodoSortOptions, TodoSummary, TodoForm, TodoPlan } from "@/types/todo"
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORY_CONFIG, SORT_OPTIONS, MOCK_TODOS } from "@/constants/todos"

export function TodoContent() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [summary, setSummary] = useState<TodoSummary | null>(null)
  const [plans, setPlans] = useState<TodoPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTodos, setSelectedTodos] = useState<string[]>([])
  const [showCompleted, setShowCompleted] = useState(true)
  
  // Tab management
  const [activeTab, setActiveTab] = useState<'tasks' | 'plans'>('tasks')
  
  // Filters and sorting
  const [filters, setFilters] = useState<TodoFilters>({})
  const [sort, setSort] = useState<TodoSortOptions>({ field: 'created_at', direction: 'desc' })
  const [planSort, setPlanSort] = useState<'created_at' | 'updated_at' | 'priority_score' | 'estimated_total_time'>('created_at')
  const [planSortDirection, setPlanSortDirection] = useState<'asc' | 'desc'>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showPlanDialog, setShowPlanDialog] = useState(false)
  const [showPlanDetailDialog, setShowPlanDetailDialog] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [viewingPlan, setViewingPlan] = useState<TodoPlan | null>(null)
  const [generatedPlan, setGeneratedPlan] = useState<TodoPlan | null>(null)
  
  // Form state
  const [form, setForm] = useState<TodoForm>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'research',
    due_date: '',
    estimated_time: 60,
    related_project_id: '',
    tags: [],
    subtasks: [],
    reminders: []
  })

  // Load todos and plans
  useEffect(() => {
    const loadData = async () => {
      try {
        // Using mock data for now - replace with API calls when backend is ready
        const mockData = MOCK_TODOS
        setTodos(mockData)
        
        // Calculate summary from mock data
        const mockSummary: TodoSummary = {
          total: mockData.length,
          by_status: {
            pending: mockData.filter(t => t.status === 'pending').length,
            in_progress: mockData.filter(t => t.status === 'in_progress').length,
            completed: mockData.filter(t => t.status === 'completed').length,
            cancelled: mockData.filter(t => t.status === 'cancelled').length
          },
          by_priority: {
            urgent: mockData.filter(t => t.priority === 'urgent').length,
            high: mockData.filter(t => t.priority === 'high').length,
            medium: mockData.filter(t => t.priority === 'medium').length,
            low: mockData.filter(t => t.priority === 'low').length
          },
          overdue: mockData.filter(t => 
            t.due_date && t.status !== 'completed' && 
            isBefore(parseISO(t.due_date), new Date())
          ).length,
          due_today: mockData.filter(t => 
            t.due_date && isToday(parseISO(t.due_date))
          ).length,
          due_this_week: mockData.filter(t => 
            t.due_date && isThisWeek(parseISO(t.due_date))
          ).length
        }
        
        setSummary(mockSummary)
        
        // Mock plans with more comprehensive data
        const mockPlans: TodoPlan[] = [
          {
            id: 'plan_1',
            title: 'Research Sprint Plan',
            description: 'Optimized plan for completing literature review and analysis tasks efficiently',
            todo_ids: ['1', '5'],
            estimated_total_time: 960,
            priority_score: 85,
            suggested_order: ['1', '5'],
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: 'plan_2',
            title: 'Academic Writing Marathon',
            description: 'Comprehensive plan for completing writing tasks with optimized schedule',
            todo_ids: ['2', '4'],
            estimated_total_time: 600,
            priority_score: 92,
            suggested_order: ['2', '4'],
            created_at: '2024-01-14T09:00:00Z',
            updated_at: '2024-01-14T09:00:00Z'
          },
          {
            id: 'plan_3',
            title: 'Review & Meeting Focus',
            description: 'Strategic plan for handling review tasks and team coordination',
            todo_ids: ['3', '6'],
            estimated_total_time: 360,
            priority_score: 75,
            suggested_order: ['3', '6'],
            created_at: '2024-01-13T14:00:00Z',
            updated_at: '2024-01-13T14:00:00Z'
          }
        ]
        setPlans(mockPlans)
        
        // Uncomment when API is ready:
        // const result = await todosApi.getTodos(filters, sort)
        // setTodos(result.todos)
        // setSummary(result.summary)
        // const plansResult = await todosApi.getPlans()
        // setPlans(plansResult)
      } catch (error) {
        console.error("Failed to load todos:", error)
        toast.error("Failed to load todos")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [filters, sort])

  // Filter and sort todos
  const filteredTodos = useMemo(() => {
    let filtered = todos.filter(todo => {
      // Search filter
      if (searchQuery && !todo.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !todo.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }
      
      // Status filter
      if (filters.status && !filters.status.includes(todo.status)) {
        return false
      }
      
      // Priority filter
      if (filters.priority && !filters.priority.includes(todo.priority)) {
        return false
      }
      
      // Category filter
      if (filters.category && !filters.category.includes(todo.category)) {
        return false
      }
      
      // Show completed filter
      if (!showCompleted && todo.status === 'completed') {
        return false
      }
      
      return true
    })
    
    // Sort
    return filtered.sort((a, b) => {
      let aValue: any = a[sort.field]
      let bValue: any = b[sort.field]
      
      if (sort.field === 'due_date') {
        aValue = a.due_date ? new Date(a.due_date).getTime() : 0
        bValue = b.due_date ? new Date(b.due_date).getTime() : 0
      } else if (sort.field === 'priority') {
        aValue = PRIORITY_CONFIG[a.priority].order
        bValue = PRIORITY_CONFIG[b.priority].order
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [todos, filters, sort, searchQuery, showCompleted])

  // Handle todo status update
  const handleStatusUpdate = async (todoId: string, status: Todo['status']) => {
    try {
      // Update local state immediately
      setTodos(prev => 
        prev.map(t => 
          t.id === todoId 
            ? { 
                ...t, 
                status, 
                completed_at: status === 'completed' ? new Date().toISOString() : undefined,
                updated_at: new Date().toISOString()
              }
            : t
        )
      )
      
      // API call (uncomment when ready)
      // await todosApi.updateTodoStatus(todoId, status)
      
      toast.success(`Todo marked as ${status.replace('_', ' ')}`)
    } catch (error) {
      console.error("Failed to update todo status:", error)
      toast.error("Failed to update todo status")
    }
  }

  // Handle create todo
  const handleCreateTodo = async () => {
    try {
      if (!form.title.trim()) {
        toast.error("Title is required")
        return
      }
      
      const newTodo: Todo = {
        id: `todo_${Date.now()}`,
        title: form.title,
        description: form.description,
        status: 'pending',
        priority: form.priority,
        category: form.category,
        due_date: form.due_date || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        estimated_time: form.estimated_time,
        tags: form.tags,
        subtasks: form.subtasks.map((s, i) => ({
          id: `sub_${Date.now()}_${i}`,
          title: s.title,
          completed: false,
          created_at: new Date().toISOString()
        })),
        reminders: []
      }
      
      setTodos(prev => [newTodo, ...prev])
      setShowCreateDialog(false)
      resetForm()
      
      // API call (uncomment when ready)
      // await todosApi.createTodo(form)
      
      toast.success("Todo created successfully")
    } catch (error) {
      console.error("Failed to create todo:", error)
      toast.error("Failed to create todo")
    }
  }

  // Handle generate plan
  const handleGeneratePlan = async (optimizationType: string = 'balanced', includeBreaks: boolean = true) => {
    try {
      if (selectedTodos.length === 0) {
        toast.error("Please select at least one todo to create a plan")
        return
      }
      
      // Mock plan generation with more detailed planning
      const selectedTodoItems = todos.filter(t => selectedTodos.includes(t.id))
      const totalTime = selectedTodoItems.reduce((sum, t) => sum + (t.estimated_time || 0), 0)
      
      // Sort by optimization type
      let sortedTodos = [...selectedTodos]
      switch (optimizationType) {
        case 'priority':
          sortedTodos.sort((a, b) => {
            const todoA = todos.find(t => t.id === a)!
            const todoB = todos.find(t => t.id === b)!
            return PRIORITY_CONFIG[todoA.priority].order - PRIORITY_CONFIG[todoB.priority].order
          })
          break
        case 'deadline':
          sortedTodos.sort((a, b) => {
            const todoA = todos.find(t => t.id === a)!
            const todoB = todos.find(t => t.id === b)!
            if (!todoA.due_date) return 1
            if (!todoB.due_date) return -1
            return new Date(todoA.due_date).getTime() - new Date(todoB.due_date).getTime()
          })
          break
        case 'time':
          sortedTodos.sort((a, b) => {
            const todoA = todos.find(t => t.id === a)!
            const todoB = todos.find(t => t.id === b)!
            return (todoA.estimated_time || 0) - (todoB.estimated_time || 0)
          })
          break
        default: // balanced
          sortedTodos.sort((a, b) => {
            const todoA = todos.find(t => t.id === a)!
            const todoB = todos.find(t => t.id === b)!
            const scoreA = PRIORITY_CONFIG[todoA.priority].order + (todoA.estimated_time || 0) / 60
            const scoreB = PRIORITY_CONFIG[todoB.priority].order + (todoB.estimated_time || 0) / 60
            return scoreA - scoreB
          })
      }
      
      const avgPriority = selectedTodoItems.reduce((sum, t) => sum + PRIORITY_CONFIG[t.priority].order, 0) / selectedTodoItems.length
      
      const newPlan: TodoPlan = {
        id: `plan_${Date.now()}`,
        title: `${optimizationType.charAt(0).toUpperCase() + optimizationType.slice(1)} Plan - ${selectedTodoItems.length} Tasks`,
        description: `AI-generated ${optimizationType} optimized plan for selected tasks. Estimated completion time: ${Math.round(totalTime / 60)}h ${totalTime % 60}m${includeBreaks ? ' (includes break time)' : ''}`,
        todo_ids: selectedTodos,
        estimated_total_time: includeBreaks ? Math.round(totalTime * 1.2) : totalTime, // Add 20% for breaks
        priority_score: Math.round((5 - avgPriority) * 20), // Convert to 0-100 scale
        suggested_order: sortedTodos,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      setGeneratedPlan(newPlan)
      
      // Don't close dialog yet - show the generated plan first
      toast.success("Plan generated successfully! Review and save below.")
    } catch (error) {
      console.error("Failed to generate plan:", error)
      toast.error("Failed to generate plan")
    }
  }

  // Handle save generated plan
  const handleSavePlan = () => {
    if (generatedPlan) {
      setPlans(prev => [generatedPlan, ...prev])
      setSelectedTodos([])
      setGeneratedPlan(null)
      setShowPlanDialog(false)
      setActiveTab('plans') // Switch to plans tab to see saved plan
      toast.success("Plan saved successfully!")
    }
  }

  // Handle delete plan
  const handleDeletePlan = async (planId: string) => {
    try {
      setPlans(prev => prev.filter(p => p.id !== planId))
      toast.success("Plan deleted successfully")
    } catch (error) {
      console.error("Failed to delete plan:", error)
      toast.error("Failed to delete plan")
    }
  }

  // Get sorted plans
  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      let aValue: any = a[planSort]
      let bValue: any = b[planSort]
      
      if (planSort === 'created_at' || planSort === 'updated_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (planSortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [plans, planSort, planSortDirection])

  // Reset form
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      priority: 'medium',
      category: 'research',
      due_date: '',
      estimated_time: 60,
      related_project_id: '',
      tags: [],
      subtasks: [],
      reminders: []
    })
  }

  // Get todo styling
  const getTodoStyling = (todo: Todo) => {
    const status = STATUS_CONFIG[todo.status]
    const priority = PRIORITY_CONFIG[todo.priority]
    const category = CATEGORY_CONFIG[todo.category]
    
    return { status, priority, category }
  }

  // Check if todo is overdue
  const isOverdue = (todo: Todo) => {
    return todo.due_date && todo.status !== 'completed' && 
           isBefore(parseISO(todo.due_date), new Date())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 border-b border-primary/10 bg-background/40 backdrop-blur-xl"
      >
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
                <CheckSquare className="h-8 w-8 text-primary" />
                Todo Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize tasks, track progress, and generate AI-powered plans
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPlanDialog(true)}
                disabled={selectedTodos.length === 0}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Generate Plan ({selectedTodos.length})
              </Button>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-primary to-blue-600 text-white flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Todo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Todo</DialogTitle>
                    <DialogDescription>
                      Add a new task to your todo list
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter todo title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter todo description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={form.priority} onValueChange={(value: any) => setForm(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={cn("h-4 w-4", config.color)} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={form.category} onValueChange={(value: any) => setForm(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center gap-2">
                                  <config.icon className={cn("h-4 w-4", config.color)} />
                                  {config.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="due_date">Due Date</Label>
                        <Input
                          id="due_date"
                          type="datetime-local"
                          value={form.due_date}
                          onChange={(e) => setForm(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="estimated_time">Estimated Time (minutes)</Label>
                        <Input
                          id="estimated_time"
                          type="number"
                          value={form.estimated_time}
                          onChange={(e) => setForm(prev => ({ ...prev, estimated_time: parseInt(e.target.value) || 0 }))}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTodo}>
                      Create Todo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
              <Card className="bg-background/40 backdrop-blur-xl border border-primary/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{summary.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-blue-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-500">{summary.by_status.pending}</div>
                  <div className="text-xs text-muted-foreground">Pending</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-yellow-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-500">{summary.by_status.in_progress}</div>
                  <div className="text-xs text-muted-foreground">In Progress</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-green-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-500">{summary.by_status.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-red-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-500">{summary.overdue}</div>
                  <div className="text-xs text-muted-foreground">Overdue</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-orange-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-500">{summary.due_today}</div>
                  <div className="text-xs text-muted-foreground">Due Today</div>
                </CardContent>
              </Card>
              
              <Card className="bg-background/40 backdrop-blur-xl border border-purple-500/20">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-500">{summary.due_this_week}</div>
                  <div className="text-xs text-muted-foreground">This Week</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Search & Filters - only show for tasks tab */}
          {activeTab === 'tasks' && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search todos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={`${sort.field}-${sort.direction}`} onValueChange={(value) => {
                const option = SORT_OPTIONS.find(o => o.value === value)
                if (option) {
                  setSort({ field: option.field, direction: option.direction })
                }
              }}>
                <SelectTrigger className="w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCompleted(!showCompleted)}
                className={cn(
                  !showCompleted && "bg-primary/10 border-primary/20"
                )}
              >
                {showCompleted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showCompleted ? 'Hide Completed' : 'Show Completed'}
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="relative z-10 container mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {activeTab === 'tasks' ? (
              <>
                {filteredTodos.length === 0 ? (
              <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                <CardContent className="p-12 text-center">
                  <CheckSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Todos Found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "No todos match your search criteria." : "Create your first todo to get started."}
                  </p>
                  {!searchQuery && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setShowCreateDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Todo
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTodos.map((todo) => {
                const { status, priority, category } = getTodoStyling(todo)
                const isSelected = selectedTodos.includes(todo.id)
                const overdue = isOverdue(todo)
                
                return (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card 
                      className={cn(
                        "bg-background/40 backdrop-blur-xl border shadow-lg cursor-pointer transition-all hover:shadow-xl",
                        status.borderColor,
                        overdue && "border-red-500/30 bg-red-500/5",
                        isSelected && "ring-2 ring-primary/50",
                        todo.status === 'completed' && "opacity-75"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Selection Checkbox */}
                          <div 
                            className="mt-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedTodos(prev => 
                                prev.includes(todo.id)
                                  ? prev.filter(id => id !== todo.id)
                                  : [...prev, todo.id]
                              )
                            }}
                          >
                            <div className={cn(
                              "w-4 h-4 border rounded cursor-pointer transition-colors",
                              isSelected 
                                ? "bg-primary border-primary" 
                                : "border-muted-foreground/30 hover:border-primary/50"
                            )}>
                              {isSelected && (
                                <CheckCircle className="h-3 w-3 text-white m-0.5" />
                              )}
                            </div>
                          </div>

                          {/* Status Toggle */}
                          <div 
                            className="mt-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              const newStatus = todo.status === 'completed' ? 'pending' : 'completed'
                              handleStatusUpdate(todo.id, newStatus)
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              {todo.status === 'completed' ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
                              )}
                            </Button>
                          </div>

                          {/* Todo Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className={cn(
                                  "font-semibold",
                                  todo.status === 'completed' && "line-through text-muted-foreground"
                                )}>
                                  {todo.title}
                                </h4>
                                {overdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", priority.color, priority.borderColor)}
                                >
                                  {priority.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {category.label}
                                </Badge>
                              </div>
                            </div>

                            {todo.description && (
                              <p className="text-muted-foreground text-sm mb-3">
                                {todo.description}
                              </p>
                            )}

                            {/* Meta Information */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center gap-4">
                                {todo.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {format(parseISO(todo.due_date), 'MMM dd, yyyy')}
                                  </div>
                                )}
                                
                                {todo.estimated_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.round(todo.estimated_time / 60)}h {todo.estimated_time % 60}m
                                  </div>
                                )}

                                {todo.subtasks.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <CheckSquare className="h-3 w-3" />
                                    {todo.subtasks.filter(s => s.completed).length}/{todo.subtasks.length} subtasks
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", status.color, status.borderColor)}
                                >
                                  {status.label}
                                </Badge>
                                <span>
                                  {formatDistance(parseISO(todo.created_at), new Date(), { addSuffix: true })}
                                </span>
                              </div>
                            </div>

                            {/* Tags */}
                            {todo.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-3">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                {todo.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
              </>
            ) : (
              /* Plans View */
              <>
                {sortedPlans.length === 0 ? (
                  <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg">
                    <CardContent className="p-12 text-center">
                      <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Plans Created</h3>
                      <p className="text-muted-foreground">
                        Select some tasks and generate your first AI-powered plan to get started.
                      </p>
                      <Button 
                        className="mt-4" 
                        onClick={() => setActiveTab('tasks')}
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Go to Tasks
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  sortedPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-background/40 backdrop-blur-xl border border-primary/10 shadow-lg hover:shadow-xl transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Brain className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">{plan.title}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    plan.priority_score >= 80 ? "border-red-500/30 text-red-500" :
                                    plan.priority_score >= 60 ? "border-orange-500/30 text-orange-500" :
                                    plan.priority_score >= 40 ? "border-yellow-500/30 text-yellow-500" :
                                    "border-green-500/30 text-green-500"
                                  )}
                                >
                                  {plan.priority_score}% Priority
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-sm mb-3">
                                {plan.description}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setViewingPlan(plan)
                                  setShowPlanDetailDialog(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-red-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Plan Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-primary/5 rounded-lg">
                              <div className="text-lg font-bold text-primary">{plan.todo_ids.length}</div>
                              <div className="text-xs text-muted-foreground">Tasks</div>
                            </div>
                            <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                              <div className="text-lg font-bold text-blue-500">
                                {Math.round(plan.estimated_total_time / 60)}h {plan.estimated_total_time % 60}m
                              </div>
                              <div className="text-xs text-muted-foreground">Duration</div>
                            </div>
                            <div className="text-center p-3 bg-purple-500/5 rounded-lg">
                              <div className="text-lg font-bold text-purple-500">
                                {format(parseISO(plan.created_at), 'MMM dd')}
                              </div>
                              <div className="text-xs text-muted-foreground">Created</div>
                            </div>
                            <div className="text-center p-3 bg-green-500/5 rounded-lg">
                              <div className="text-lg font-bold text-green-500">
                                {plan.suggested_order.length}
                              </div>
                              <div className="text-xs text-muted-foreground">Steps</div>
                            </div>
                          </div>

                          {/* Task Preview */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-muted-foreground mb-2">Included Tasks:</h4>
                            <div className="flex flex-wrap gap-2">
                              {plan.todo_ids.slice(0, 3).map(todoId => {
                                const todo = todos.find(t => t.id === todoId)
                                if (!todo) return null
                                return (
                                  <Badge key={todoId} variant="secondary" className="text-xs">
                                    {todo.title.length > 30 ? todo.title.substring(0, 30) + '...' : todo.title}
                                  </Badge>
                                )
                              })}
                              {plan.todo_ids.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{plan.todo_ids.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

            {/* Plan Generation Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Generate AI Plan
            </DialogTitle>
            <DialogDescription>
              Create an optimized plan for {selectedTodos.length} selected tasks
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-medium mb-2">Selected Tasks:</h4>
              <div className="space-y-2">
                {selectedTodos.map(todoId => {
                  const todo = todos.find(t => t.id === todoId)
                  if (!todo) return null
                  return (
                    <div key={todoId} className="flex items-center justify-between text-sm">
                      <span className="flex-1">{todo.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {PRIORITY_CONFIG[todo.priority].label}
                        </Badge>
                        {todo.estimated_time && (
                          <span className="text-muted-foreground">
                            {Math.round(todo.estimated_time / 60)}h {todo.estimated_time % 60}m
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {!generatedPlan ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Optimization Type</Label>
                  <Select defaultValue="balanced" onValueChange={(value) => {
                    // Store optimization type for generation
                    (window as any).optimizationType = value
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Minimize Time</SelectItem>
                      <SelectItem value="priority">Priority First</SelectItem>
                      <SelectItem value="deadline">Deadline Focused</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Include Breaks</Label>
                  <Select defaultValue="true" onValueChange={(value) => {
                    // Store breaks option for generation
                    (window as any).includeBreaks = value === 'true'
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              /* Generated Plan Preview */
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Plan Generated Successfully!</span>
                </div>
                
                <Card className="bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Brain className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{generatedPlan.title}</h3>
                      <Badge variant="outline" className="text-xs">
                        {generatedPlan.priority_score}% Priority Score
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {generatedPlan.description}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-2 bg-background/50 rounded">
                        <div className="font-bold text-primary">{generatedPlan.todo_ids.length}</div>
                        <div className="text-xs text-muted-foreground">Tasks</div>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded">
                        <div className="font-bold text-blue-500">
                          {Math.round(generatedPlan.estimated_total_time / 60)}h {generatedPlan.estimated_total_time % 60}m
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center p-2 bg-background/50 rounded">
                        <div className="font-bold text-green-500">{generatedPlan.suggested_order.length}</div>
                        <div className="text-xs text-muted-foreground">Steps</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Suggested Order:</h4>
                      <div className="space-y-2">
                        {generatedPlan.suggested_order.map((todoId, index) => {
                          const todo = todos.find(t => t.id === todoId)
                          if (!todo) return null
                          return (
                            <div key={todoId} className="flex items-center gap-3 text-sm">
                              <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <span className="flex-1">{todo.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {PRIORITY_CONFIG[todo.priority].label}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowPlanDialog(false)
              setGeneratedPlan(null)
            }}>
              {generatedPlan ? 'Close' : 'Cancel'}
            </Button>
            {!generatedPlan ? (
              <Button onClick={() => handleGeneratePlan(
                (window as any).optimizationType || 'balanced',
                (window as any).includeBreaks !== false
              )}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Plan
              </Button>
            ) : (
              <Button onClick={handleSavePlan} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Plan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Detail Dialog */}
      <Dialog open={showPlanDetailDialog} onOpenChange={setShowPlanDetailDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Plan Details
            </DialogTitle>
            <DialogDescription>
              {viewingPlan?.description}
            </DialogDescription>
          </DialogHeader>
          
          {viewingPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-xl font-bold text-primary">{viewingPlan.todo_ids.length}</div>
                  <div className="text-xs text-muted-foreground">Tasks</div>
                </div>
                <div className="text-center p-3 bg-blue-500/5 rounded-lg">
                  <div className="text-xl font-bold text-blue-500">
                    {Math.round(viewingPlan.estimated_total_time / 60)}h {viewingPlan.estimated_total_time % 60}m
                  </div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                <div className="text-center p-3 bg-purple-500/5 rounded-lg">
                  <div className="text-xl font-bold text-purple-500">
                    {viewingPlan.priority_score}%
                  </div>
                  <div className="text-xs text-muted-foreground">Priority</div>
                </div>
                <div className="text-center p-3 bg-green-500/5 rounded-lg">
                  <div className="text-xl font-bold text-green-500">
                    {format(parseISO(viewingPlan.created_at), 'MMM dd')}
                  </div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Execution Plan</h3>
                <div className="space-y-3">
                  {viewingPlan.suggested_order.map((todoId, index) => {
                    const todo = todos.find(t => t.id === todoId)
                    if (!todo) return null
                    
                    const { status, priority, category } = getTodoStyling(todo)
                    
                    return (
                      <Card key={todoId} className="bg-background/40 border border-primary/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-primary to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                              {index + 1}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{todo.title}</h4>
                                <Badge variant="outline" className={cn("text-xs", priority.color)}>
                                  {priority.label}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {category.label}
                                </Badge>
                              </div>
                              
                              {todo.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {todo.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                {todo.estimated_time && (
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {Math.round(todo.estimated_time / 60)}h {todo.estimated_time % 60}m
                                  </div>
                                )}
                                
                                {todo.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Due: {format(parseISO(todo.due_date), 'MMM dd')}
                                  </div>
                                )}
                                
                                <Badge variant="outline" className={cn("text-xs", status.color)}>
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanDetailDialog(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setShowPlanDetailDialog(false)
              setActiveTab('tasks')
            }}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 