import { useState, useCallback } from 'react'
import type { Task as TaskType, TaskPriority, TaskStatus } from '../types/type'

type FormMode = 'add' | 'edit' | null

interface UseTaskFormReturn {
  formMode: FormMode
  editingId: string | null
  formData: Partial<TaskType>
  setFormData: (data: Partial<TaskType>) => void
  handleAddTask: () => void
  handleEditTask: (task: TaskType) => void
  handleCancel: () => void
  handleSaveTask: (
    e: React.FormEvent,
    tasks: TaskType[],
  ) => { success: boolean; tasks: TaskType[]; newTask?: TaskType }
}

export function useTaskForm(): UseTaskFormReturn {
  const [formMode, setFormMode] = useState<FormMode>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<TaskType>>({
    title: '',
    description: '',
    due: '',
    priority: 'Medium',
    status: 'Open',
  })

  const handleAddTask = useCallback(() => {
    setFormMode('add')
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      due: '',
      priority: 'Medium',
      status: 'Open',
    })
  }, [])

  const handleEditTask = useCallback((task: TaskType) => {
    setFormMode('edit')
    setEditingId(task.id)
    setFormData(task)
  }, [])

  const handleCancel = useCallback(() => {
    setFormMode(null)
    setEditingId(null)
  }, [])

  const handleSaveTask = useCallback(
    (e: React.FormEvent, tasks: TaskType[]) => {
      e.preventDefault()

      if (!formData.title?.trim()) {
        alert('Please enter a task name')
        return { success: false, tasks }
      }

      let updatedTasks = tasks
      let newTask: TaskType | undefined

      if (formMode === 'add') {
        newTask = {
          id: Date.now().toString(),
          title: formData.title,
          description: formData.description || '',
          due: formData.due || '',
          priority: (formData.priority as TaskPriority) || 'Medium',
          status: (formData.status as TaskStatus) || 'Open',
          createdAt: new Date().toISOString().split('T')[0],
        }
        updatedTasks = [newTask, ...tasks]
      } else if (formMode === 'edit' && editingId) {
        updatedTasks = tasks.map((task) =>
          task.id === editingId ? ({ ...task, ...formData } as TaskType) : task,
        )
      }

      setFormMode(null)
      setEditingId(null)

      return { success: true, tasks: updatedTasks, newTask }
    },
    [formMode, editingId, formData],
  )

  return {
    formMode,
    editingId,
    formData,
    setFormData,
    handleAddTask,
    handleEditTask,
    handleCancel,
    handleSaveTask,
  }
}
