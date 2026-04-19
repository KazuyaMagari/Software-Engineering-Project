import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import Navbar from './Navbar'
import Footer from './Footert'
import { TaskFormModal } from '../common/TaskFormModal'
import { useTaskForm } from '../../hooks/useTaskForm'
import { auth } from '../../auth/Auth'
import styled from 'styled-components'
import type { Task as TaskType } from '../../types/type'

// Helper function to format due date
const formatDueDate = (dateString: string | undefined): string => {
  if (!dateString) return 'No date'
  
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const dueDate = new Date(dateString)
  dueDate.setHours(0, 0, 0, 0)
  
  if (dueDate.getTime() === today.getTime()) {
    return 'Today'
  } else if (dueDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow'
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

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
  width: min(980px, calc(100% - 2rem));
  margin: 1.2rem auto 1.8rem;
  display: grid;
  gap: 0.9rem;

  @media (max-width: 640px) {
    width: min(1120px, calc(100% - 1rem));
    margin-top: 1rem;
  }
`

const HeroPanel = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  padding: 1rem;

  @media (min-width: 900px) {
    grid-template-columns: 1.6fr 1fr;
  }
`

const HeroCopy = styled.div`
  h1 {
    margin: 0.25rem 0 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: clamp(1.6rem, 3vw, 2.4rem);
    line-height: 1.12;
    max-width: 15ch;
  }
`

const Eyebrow = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
`

const HeroDescription = styled.p`
  margin: 0.5rem 0 0;
  color: #4b5563;
  max-width: 58ch;
`

const HeroActions = styled.div`
  margin-top: 1.1rem;
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
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
`

const BtnPrimary = styled(Btn)`
  background: #111827;
  color: #fff;
  border-color: #111827;

  &:hover {
    background: #1f2937;
  }
`

const BtnGhost = styled(Btn)`
  background: #ffffff;
`

const HeroHighlight = styled.div`
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 10px;
  padding: 1rem;
  align-self: center;
`

const Label = styled.p`
  margin: 0;
  color: #6b7280;
`

const Number = styled.p`
  margin: 0.3rem 0 0.1rem;
  font-size: clamp(1.8rem, 4vw, 2.4rem);
  font-weight: 700;
  color: #111827;
`

const OverviewGrid = styled.section`
  display: grid;
  gap: 0.8rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const MetricCard = styled.article`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  padding: 0.85rem;
`

const MetricValue = styled.p`
  margin: 0.3rem 0;
  font-size: 1.4rem;
  font-weight: 700;
`

const ContentGrid = styled.section`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 0.8rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Panel = styled.article`
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #ffffff;
  padding: 0.95rem;

  h2 {
    margin: 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.15rem;
  }
`

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
`

const PanelLink = styled.a`
  color: #374151;
  text-decoration: none;
  font-weight: 500;
`

const TaskList = styled.ul`
  list-style: none;
  margin: 1rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.55rem;
`

const TaskItem = styled.li`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 0.7rem;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`

const TaskTitle = styled.p`
  margin: 0;
  font-weight: 600;
`

const TaskMeta = styled.p`
  margin: 0.22rem 0 0;
  color: #6b7280;
  font-size: 0.88rem;
`

const TaskTags = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
`

const Tag = styled.span`
  border-radius: 999px;
  background: #f3f4f6;
  color: #374151;
  font-size: 0.76rem;
  padding: 0.2rem 0.55rem;
  font-weight: 500;
`

const StatusTag = styled(Tag)`
  background: #e5e7eb;
  color: #374151;
`

const PanelCopy = styled.p`
  margin: 0.6rem 0 1rem;
  color: #4b5563;
`


const FullButton = styled(BtnPrimary)`
  margin-top: 0.9rem;
  width: 100%;
`

function Home() {
  const [myTasks, setMyTasks] = useState<TaskType[]>([])
  const [stats, setStats] = useState({ completed: 0, onTrack: 0, overdue: 0 })
  const [loading, setLoading] = useState(true)
  const {
    formMode,
    formData,
    setFormData,
    handleAddTask,
    handleCancel,
    handleSaveTask,
  } = useTaskForm()

  // Fetch tasks from backend
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.email) {
        try {
          setLoading(true)
          const response = await fetch(`http://localhost:3000/api/tasks?email=${user.email}`)
          const data = await response.json()

          if (data.success && data.tasks && Array.isArray(data.tasks)) {
            // Transform tasks to match TaskType (convert DB format to UI format)
            const transformedTasks: TaskType[] = data.tasks.map((task: any) => ({
              id: task.id,
              title: task.title,
              due: formatDueDate(task.due_date),
              priority: task.priority,
              status: task.status,
              description: task.description || '',
              createdAt: task.created_at,
            }))

            setMyTasks(transformedTasks)

            // Calculate stats
            const completed = data.tasks.filter((t: any) => t.status === 'Completed').length
            const onTrack = data.tasks.filter((t: any) =>
              ['Open', 'In progress', 'Review'].includes(t.status)
            ).length
            const overdue = data.tasks.filter((t: any) => t.status === 'Overdue').length

            setStats({ completed, onTrack, overdue })
          }
        } catch (error) {
          console.error('Failed to fetch tasks:', error)
          setMyTasks([])
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSaveTaskForm = async (e: React.FormEvent) => {
    const result = handleSaveTask(e, myTasks)
    if (result.success && result.newTask && auth.currentUser?.email) {
      try {
        // Format due date to YYYY-MM-DD if it's in other format
        let dueDate = result.newTask.due || null;
        if (dueDate && dueDate !== 'No date' && dueDate !== 'Today' && dueDate !== 'Tomorrow') {
          // If already in YYYY-MM-DD format, keep it
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
            // Try to parse and convert
            const dateObj = new Date(dueDate);
            if (!isNaN(dateObj.getTime())) {
              dueDate = dateObj.toISOString().split('T')[0];
            } else {
              dueDate = null;
            }
          }
        } else if (dueDate === 'Today' || dueDate === 'Tomorrow') {
          dueDate = null; // Convert relative dates back to null for backend
        }

        // Send to backend
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
          const taskResponse = await response.json();
          console.log('✅ Task created successfully in database');
          
          // Add the new task from backend response to local state
          if (taskResponse.task) {
            const newTask: TaskType = {
              id: taskResponse.task.id,
              title: taskResponse.task.title,
              due: formatDueDate(taskResponse.task.due_date),
              priority: taskResponse.task.priority,
              status: taskResponse.task.status,
              description: taskResponse.task.description || '',
              createdAt: taskResponse.task.created_at,
            }
            setMyTasks([newTask, ...myTasks])
            
            // Update stats
            const completed = (newTask.status === 'Completed' ? 1 : 0) + stats.completed
            const onTrack = (['Open', 'In progress', 'Review'].includes(newTask.status) ? 1 : 0) + stats.onTrack
            const overdue = (newTask.status === 'Overdue' ? 1 : 0) + stats.overdue
            setStats({ completed, onTrack, overdue })
          }
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

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      High: '#ef4444',
      Medium: '#f59e0b',
      Low: '#10b981',
    }
    return colors[priority] || '#6b7280'
  }

  return (
    <Page>
      <Navbar />

      <Main>
        <HeroPanel aria-labelledby="hero-title">
          <HeroCopy>
            <Eyebrow>Task Management Platform</Eyebrow>
            <h1 id="hero-title">Build momentum with one shared command center.</h1>
            <HeroDescription>
              Track priorities, align teammates, and keep delivery predictable with clear ownership and live progress.
            </HeroDescription>
            <HeroActions>
              <BtnPrimary type="button" onClick={handleAddTask}>
                Create Task
              </BtnPrimary>
              <BtnGhost type="button">View Reports</BtnGhost>
            </HeroActions>
          </HeroCopy>
          <HeroHighlight role="status" aria-live="polite">
            <Label>Weekly Completion</Label>
            <Number>82%</Number>
            <Label>+9% compared to last week</Label>
          </HeroHighlight>
        </HeroPanel>

        <OverviewGrid aria-label="Project overview">
          <MetricCard>
            <Label>Completed</Label>
            <MetricValue>{stats.completed}</MetricValue>
            <Label>Tasks this week</Label>
          </MetricCard>
          <MetricCard>
            <Label>On Track</Label>
            <MetricValue>{stats.onTrack}</MetricValue>
            <Label>Current sprint</Label>
          </MetricCard>
          <MetricCard>
            <Label>Overdue</Label>
            <MetricValue>{stats.overdue}</MetricValue>
            <Label>Need attention</Label>
          </MetricCard>
        </OverviewGrid>

        <ContentGrid>
          <Panel aria-labelledby="my-tasks-title">
            <PanelHeader>
              <h2 id="my-tasks-title">My Tasks</h2>
              <PanelLink href="#">See all</PanelLink>
            </PanelHeader>
            {loading ? (
              <PanelCopy>Loading tasks...</PanelCopy>
            ) : myTasks.length === 0 ? (
              <PanelCopy>No tasks yet. Create one to get started!</PanelCopy>
            ) : (
              <TaskList>
                {myTasks.map((task) => (
                  <TaskItem key={task.id} style={{ borderLeftColor: getPriorityColor(task.priority), borderLeftWidth: '3px' }}>
                    <div>
                      <TaskTitle>{task.title}</TaskTitle>
                      <TaskMeta>Due {task.due}</TaskMeta>
                    </div>
                    <TaskTags>
                      <Tag>{task.priority}</Tag>
                      <StatusTag>{task.status}</StatusTag>
                    </TaskTags>
                  </TaskItem>
                ))}
              </TaskList>
            )}
          </Panel>

          <Panel aria-labelledby="ai-title">
            <h2 id="ai-title">AI Assistant</h2>
            <PanelCopy>
              Smart planning suggestions are available. Ask for workload balancing, overdue risk prediction, and next best actions.
            </PanelCopy>
            <FullButton type="button">Apply Suggestion</FullButton>
          </Panel>
        </ContentGrid>
      </Main>

      {/* Task Form Modal */}
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

export default Home