import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAnalytics } from '../../hooks/useAnalytics'
import type { TaskStats, PriorityBreakdown } from '../../hooks/useAnalytics'
import Navbar from '../home/Navbar'
import Footer from '../home/Footert'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../auth/Auth'

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f3f4f6;
  font-family: 'Outfit', sans-serif;
`

const Main = styled.main`
  flex: 1;
  width: min(980px, calc(100% - 2rem));
  margin: 1.2rem auto;
  display: grid;
  gap: 0.9rem;
`

const Title = styled.h1`
  margin: 0;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  color: #111827;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.8rem;
`

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 0.9rem;
  border: 1px solid #e5e7eb;
  text-align: center;

  h3 {
    margin: 0;
    color: #6b7280;
    font-size: 0.75rem;
    text-transform: uppercase;
  }

  .value {
    margin: 0.4rem 0;
    font-size: 1.8rem;
    font-weight: 700;
    color: #111827;
  }
`

const Panel = styled.div`
  background: white;
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #e5e7eb;

  h2 {
    margin: 0 0 1rem 0;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 1.2rem;
    color: #111827;
  }
`

export default function Dashboard() {
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [stats, setStats] = useState<TaskStats | null>(null)
  const [priorityData, setPriorityData] = useState<PriorityBreakdown[]>([])

  const { loading, getTaskStats, getPriorityBreakdown } = useAnalytics()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser?.email) {
        setUser({ email: firebaseUser.email })
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user?.email) return

    const fetchData = async () => {
      const [s, priority] = await Promise.all([
        getTaskStats(user.email),
        getPriorityBreakdown(user.email)
      ])
      if (s) setStats(s)
      if (priority) setPriorityData(priority)
    }

    fetchData()
  }, [user?.email])

  if (!user) {
    return (
      <Page>
        <Navbar />
        <Main>
          <p>Please log in...</p>
        </Main>
        <Footer />
      </Page>
    )
  }

  if (!stats || loading) {
    return (
      <Page>
        <Navbar />
        <Main>
          <p>Loading your dashboard...</p>
        </Main>
        <Footer />
      </Page>
    )
  }

  return (
    <Page>
      <Navbar />
      <Main>
        <Title>Dashboard</Title>

        <Grid>
          <Card>
            <h3>Total</h3>
            <div className="value">{stats.total}</div>
          </Card>
          <Card>
            <h3>Completed</h3>
            <div className="value">{stats.completed}</div>
          </Card>
          <Card>
            <h3>In Progress</h3>
            <div className="value">{stats.in_progress}</div>
          </Card>
          <Card>
            <h3>Open</h3>
            <div className="value">{stats.open}</div>
          </Card>
          <Card>
            <h3>Overdue</h3>
            <div className="value">{stats.overdue}</div>
          </Card>
          <Card>
            <h3>Completion %</h3>
            <div className="value">{stats.completion_rate}%</div>
          </Card>
        </Grid>

        {priorityData.length > 0 && (
          <Panel>
            <h2>Priority Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        )}
      </Main>
      <Footer />
    </Page>
  )
}
