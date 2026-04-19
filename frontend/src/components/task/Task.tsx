
import { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from '../home/Navbar'
import Footer from '../home/Footert'
import { TaskFormModal } from '../common/TaskFormModal'
import { useTaskForm } from '../../hooks/useTaskForm'
import { auth } from '../../auth/Auth'
import type { Task as TaskType, TaskPriority, TaskStatus } from '../../types/type'

// Mock data
const initialMockTasks: TaskType[] = [
  {
    id: '1',
    title: 'API Integration: Task Comments',
    description: 'Integrate task comments API endpoint',
    due: 'Today 18:00',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-03-20',
  },
  {
    id: '2',
    title: 'Sprint Planning Notes',
    description: 'Document sprint planning decisions',
    due: 'Tomorrow 10:00',
    priority: 'Medium',
    status: 'In progress',
    createdAt: '2026-03-20',
  },
  {
    id: '3',
    title: 'UI Fix: Mobile Navbar',
    description: 'Fix responsive design issues',
    due: 'Mar 24',
    priority: 'Low',
    status: 'Review',
    createdAt: '2026-03-18',
  },
  {
    id: '4',
    title: 'Database Schema Update',
    description: 'Update schema for new features',
    due: 'Mar 22',
    priority: 'High',
    status: 'Open',
    createdAt: '2026-03-19',
  },
  {
    id: '5',
    title: 'Documentation Update',
    description: 'Update API documentation',
    due: 'Mar 25',
    priority: 'Low',
    status: 'Completed',
    createdAt: '2026-03-17',
  },
]

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

const TaskCard = styled.div<{ priority: TaskPriority; $isDragging: boolean }>`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-left: 4px solid
    ${(props) => {
      const colors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }
      return colors[props.priority]
    }};
  border-radius: 8px;
  padding: 1rem;
  cursor: grab;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$isDragging ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isDragging ? '0 10px 15px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)'};

  &:active {
    cursor: grabbing;
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

  &:hover {
    background: #1f2937;
  }
`

function Task() {
  const [tasks, setTasks] = useState<TaskType[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null)
  
  const { formMode, formData, setFormData, handleAddTask, handleEditTask, handleCancel, handleSaveTask } = useTaskForm()

  // Fetch tasks from backend on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user?.email) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        console.log('User logged in:', user.email);

        const response = await fetch(
          `http://localhost:3000/api/tasks?email=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

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
          }));
          setTasks(formattedTasks);
          console.log('✅ Tasks loaded:', formattedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleSaveTaskForm = async (e: React.FormEvent) => {
    const result = handleSaveTask(e, tasks)
    if (result.success && result.newTask && auth.currentUser?.email) {
      try {
        // Format due date to YYYY-MM-DD if needed
        let dueDate = result.newTask.due || null;
        if (dueDate) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            const dateObj = new Date(dueDate);
            if (!isNaN(dateObj.getTime())) {
              dueDate = dateObj.toISOString().split('T')[0];
            } else {
              dueDate = null;
            }
          }
        }

        const response = await fetch('http://localhost:3000/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: auth.currentUser.email,
            title: result.newTask.title,
            description: result.newTask.description,
            priority: result.newTask.priority,
            status: result.newTask.status,
            due_date: dueDate,
          }),
        });

        if (response.ok) {
          console.log('✅ Task created and saved to database');
          setTasks(result.tasks);
        } else {
          const error = await response.json();
          console.error('Failed to save task:', error);
          alert('Failed to save task. Please try again.');
        }
      } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task. Please check backend connection.');
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

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()

    if (draggedTaskId) {
      setTasks(
        tasks.map((task) =>
          task.id === draggedTaskId ? { ...task, status: targetStatus } : task,
        ),
      )
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <TaskTitle>{task.title}</TaskTitle>
                    {task.description && <TaskDescription>{task.description}</TaskDescription>}
                    <TaskFooter>
                      <TaskDueDate>{task.due || '—'}</TaskDueDate>
                      <TaskActions>
                        <IconBtn onClick={() => handleEditTask(task)} title="Edit">
                          ✎
                        </IconBtn>
                        <IconBtn onClick={() => handleDeleteTask(task.id)} title="Delete">
                          ✕
                        </IconBtn>
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

      <Footer />
    </Page>
  )
}

export default Task
