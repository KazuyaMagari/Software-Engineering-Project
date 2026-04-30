
import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from '../home/Navbar'
import Footer from '../home/Footert'
import { TaskFormModal } from '../common/TaskFormModal'
import { ShareModal } from '../common/ShareModal'
import { useTaskForm } from '../../hooks/useTaskForm'
import { auth } from '../../auth/Auth'
import { taskAPI } from '../../services/api'
import type { Task as TaskType, TaskPriority, TaskStatus } from '../../types/type'

const BOARD_COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'Open', label: 'Open' },
  { status: 'In progress', label: 'In Progress' },
  { status: 'Review', label: 'Review' },
  { status: 'Completed', label: 'Completed' },
]


const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: #1f2937;
  font-family: 'Outfit', sans-serif;
  background: #f3f4f6;
`

const Main = styled.main`
  flex: 1;
  width: 100%;
  padding: 1.5rem;
  overflow-x: auto;
`

const Header = styled.div`
  max-width: 1400px;
  margin: 0 auto 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;

  h1 {
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    margin: 0;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const BoardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1rem;
  }
`

const BoardColumn = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 300px);
  min-width: 320px;
`

const ColumnHeader = styled.div`
  padding: 1rem;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
`

const ColumnTitle = styled.h2`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
`

const CardCount = styled.span`
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
`

const TasksContainer = styled.div<{ $isDragOver: boolean }>`
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: ${(props) => (props.$isDragOver ? '#f0f9ff' : '#f9fafb')};
  transition: background-color 0.2s ease;
`

const TaskCard = styled.div<{ priority: TaskPriority; $isDragging: boolean; $isViewOnly?: boolean }>`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid
    ${(props) => {
      const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }
      return colors[props.priority]
    }};
  border-radius: 8px;
  padding: 1rem;
  cursor: ${(props) => (props.$isViewOnly ? 'default' : 'grab')};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isDragging ? '0 10px 15px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};

  &:active {
    cursor: ${(props) => (props.$isViewOnly ? 'default' : 'grabbing')};
  }

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`

const TaskTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1f2937;
  word-break: break-word;
`

const TaskDescription = styled.p`
  margin: 0 0 0.75rem 0;
  font-size: 0.85rem;
  color: #6b7280;
  word-break: break-word;
`

const TaskCreator = styled.p`
  margin: 0 0 0.5rem 0;
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
`

const TaskPermission = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.45rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 0.5rem;
  background: #eef2ff;
  color: #4338ca;
`

const TaskFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #9ca3af;
`

const TaskDueDate = styled.span`
  flex: 1;
`

const TaskActions = styled.div`
  display: flex;
  gap: 0.25rem;
`

const IconBtn = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: #1f2937;
  }
`

const Btn = styled.button`
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  color: #1f2937;
  font-family: 'Outfit', sans-serif;
  font-weight: 500;
  padding: 0.62rem 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #9ca3af;
    background: #f9fafb;
  }
`

const BtnPrimary = styled(Btn)`
  background: #111827;
  color: #fff;
  border-color: #111827;

  &:hover {\n    background: #1f2937;
  }
`

const SearchContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto 1.5rem;
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const SearchInput = styled.input`
  flex: 1;
  min-width: 250px;
  padding: 0.6rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  font-family: 'Outfit', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ClearBtn = styled.button`
  padding: 0.6rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e5e7eb;
  }
`

function Task() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [shareTaskId, setShareTaskId] = useState<string | null>(null)
  
  const { formMode, editingId, formData, setFormData, handleAddTask, handleEditTask, handleCancel, handleSaveTask } = useTaskForm()

  // Fetch tasks from backend on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          console.log('No user logged in');
          setTasks([]);
          setLoading(false);
          return;
        }

        console.log('User logged in:', user.email)
        await fetchTasks('');
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchTasks = async (search: string) => {
    try {
      setLoading(true);
      const data = await taskAPI.getAccessibleTasks(search || undefined);

      if (data.success) {
        // Format data from API to match TaskType
        const formattedTasks = data.tasks.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          due: task.due_date || '',
          priority: task.priority,
          status: task.status,
          createdAt: task.created_at?.split('T')[0] || '',
          creator_id: task.creator_id,
          creator_email: task.creator_email,
          access_permission: task.access_permission,
        }));
        setTasks(formattedTasks);
        console.log('Tasks loaded:', formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    fetchTasks(value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchTasks('');
  };

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskType[]> = {
      Open: [],
      'In progress': [],
      Review: [],
      Completed: [],
      Overdue: [],
    }
    tasks.forEach((task) => {
      grouped[task.status].push(task)
    })
    return grouped
  }, [tasks])

  const handleDeleteTask = async (id: string) => {
    const taskToDelete = tasks.find((task) => task.id === id)

    if (taskToDelete?.access_permission && taskToDelete.access_permission !== 'owner') {
      alert('タスクの削除は所有者（Owner）のみ可能です。')
      return
    }

    // Optimistically update UI
    const updatedTasks = tasks.filter((task) => task.id !== id)
    setTasks(updatedTasks)

    try {
      // Call backend API to delete the task
      await taskAPI.deleteTask(id);
      console.log('Task deleted from database')
    } catch (error) {
      console.error('Error deleting task:', error)
      // Revert UI if API call fails
      setTasks(tasks)
      alert(error instanceof Error ? error.message : 'Failed to delete task. Please try again.')
    }
  }

  const handleSaveTaskForm = async (e: React.FormEvent) => {
    const result = handleSaveTask(e, tasks)
    
    if (!result.success) return

    if (formMode === 'add' && result.newTask) {
      // Handle Add mode
      try {
        const response = await taskAPI.createTask({
          title: result.newTask.title,
          description: result.newTask.description || undefined,
          priority: result.newTask.priority,
          status: result.newTask.status,
          due_date: result.newTask.due || undefined,
        });

        if (response.success) {
          console.log('Task created and saved to database');
          const createdTask: TaskType = {
            id: response.task.id,
            title: response.task.title,
            description: response.task.description || '',
            due: response.task.due_date || '',
            priority: response.task.priority,
            status: response.task.status,
            createdAt: response.task.created_at?.split('T')[0] || '',
            creator_id: response.task.creator_id,
            creator_email: response.task.creator_email,
            access_permission: response.task.access_permission || 'owner',
          }
          setTasks([createdTask, ...tasks])
          handleCancel();
        } else {
          console.error('Failed to save task:', response);
          alert('Failed to save task. Please try again.');
        }
      } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task. Please check backend connection.');
      }
    } else if (formMode === 'edit' && editingId) {
      // Handle Edit mode
      try {
        const response = await taskAPI.updateTask(editingId, {
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          status: formData.status,
          due_date: formData.due || undefined,
        });

        if (response.success) {
          console.log('Task updated and saved to database');
          setTasks(result.tasks);
          handleCancel();
        } else {
          console.error('Failed to update task:', response);
          alert('Failed to update task. Please try again.');
        }
      } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please check backend connection.');
      }
    }
  }

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragEnd = () => {
    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (status: TaskStatus) => {
    setDragOverColumn(status)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget === e.target) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()

    if (draggedTaskId) {
      // Find the task being dragged
      const draggedTask = tasks.find(task => task.id === draggedTaskId)
      if (!draggedTask || draggedTask.status === targetStatus) {
        setDraggedTaskId(null)
        setDragOverColumn(null)
        return
      }

      // Optimistically update UI
      const updatedTasks = tasks.map((task) =>
        task.id === draggedTaskId ? { ...task, status: targetStatus } : task,
      )
      setTasks(updatedTasks)

      try {
        // Call backend API to persist the status change
        await taskAPI.updateTaskStatus(draggedTaskId, targetStatus);
        console.log('Task status updated in database')
      } catch (error) {
        console.error('Error updating task status:', error)
        // Revert UI if API call fails
        setTasks(tasks)
        alert('Failed to update task status. Please try again.')
      }
    }

    setDraggedTaskId(null)
    setDragOverColumn(null)
  }

  return (
    <Page>
      <Navbar />
      <Main>
        <Header>
          <h1>Task Board</h1>
          <BtnPrimary onClick={handleAddTask}>+ New Task</BtnPrimary>
        </Header>

        {/* 🔍 Search Bar */}
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="🔍 Search tasks by title or description..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchTerm && (
            <ClearBtn onClick={handleClearSearch}>Clear</ClearBtn>
          )}
        </SearchContainer>

        {loading ? (
          <div style={{ textAlign: 'center', paddingTop: '2rem', color: '#6b7280' }}>
            <p>Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: '2rem', color: '#6b7280' }}>
            <p>No tasks yet. Create one to get started!</p>
          </div>
        ) : (
          <BoardContainer>
            {BOARD_COLUMNS.map(({ status, label }) => (
              <BoardColumn key={status}>
              <ColumnHeader>
                <ColumnTitle>{label}</ColumnTitle>
                <CardCount>{tasksByStatus[status].length}</CardCount>
              </ColumnHeader>

              <TasksContainer
                $isDragOver={dragOverColumn === status}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {tasksByStatus[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    priority={task.priority}
                    $isDragging={draggedTaskId === task.id}
                    $isViewOnly={task.access_permission === 'view'}
                    draggable={task.access_permission !== 'view'}
                    onDragStart={(e) => {
                      if (task.access_permission !== 'view') handleDragStart(e, task.id)
                    }}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskTitle>{task.title}</TaskTitle>
                    {task.description && <TaskDescription>{task.description}</TaskDescription>}
                    {task.creator_email && <TaskCreator>by {task.creator_email}</TaskCreator>}
                    <TaskFooter>
                      <TaskDueDate>
                        {task.access_permission && task.access_permission !== 'owner' ? (
                          <TaskPermission>{task.access_permission === 'view' ? 'View only' : 'Can edit'}</TaskPermission>
                        ) : null}
                        {task.due || '—'}
                      </TaskDueDate>
                      <TaskActions>
                        {task.access_permission !== 'view' && (
                          <IconBtn onClick={() => handleEditTask(task)} title="Edit">
                            ✎
                          </IconBtn>
                        )}
                        {task.access_permission === 'owner' && (
                          <>
                            <IconBtn onClick={() => setShareTaskId(task.id)} title="Share">
                              🔗
                            </IconBtn>
                            <IconBtn onClick={() => handleDeleteTask(task.id)} title="Delete">
                              ✕
                            </IconBtn>
                          </>
                        )}
                      </TaskActions>
                    </TaskFooter>
                  </TaskCard>
                ))}
              </TasksContainer>
            </BoardColumn>
          ))}
        </BoardContainer>
        )}

      </Main>

      {/* Modal Form */}
      <TaskFormModal
        isOpen={formMode !== null}
        mode={formMode}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleSaveTaskForm}
        onCancel={handleCancel}
      />

      {shareTaskId && (
        <ShareModal
          taskId={shareTaskId}
          onClose={() => setShareTaskId(null)}
          onShareSuccess={() => {
            setShareTaskId(null)
            fetchTasks(searchTerm)
          }}
        />
      )}

      <Footer />
    </Page>
  )
}

export default Task
