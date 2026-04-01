export type TaskStatus = 'Open' | 'In progress' | 'Review' | 'Completed' | 'Overdue'
export type TaskPriority = 'Low' | 'Medium' | 'High'

export interface Task {
  id: string
  title: string
  description?: string
  due: string
  priority: TaskPriority
  status: TaskStatus
  createdAt: string
}

export interface TaskFilter {
  priority?: TaskPriority | ''
  status?: TaskStatus | ''
  search?: string
}