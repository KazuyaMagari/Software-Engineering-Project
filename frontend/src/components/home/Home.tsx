import Navbar from './Navbar'
import Footer from './Footert'
import styled from 'styled-components'

const myTasks = [
  { title: 'API Integration: Task Comments', due: 'Today 18:00', priority: 'High', status: 'In progress' },
  { title: 'Sprint Planning Notes', due: 'Tomorrow 10:00', priority: 'Medium', status: 'Open' },
  { title: 'UI Fix: Mobile Navbar', due: 'Mar 24', priority: 'Low', status: 'Review' },
]

const timeline = [
  { label: 'Completed', value: '24', hint: 'Tasks this week' },
  { label: 'On Track', value: '11', hint: 'Current sprint' },
  { label: 'Overdue', value: '3', hint: 'Need attention' },
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
              <BtnPrimary type="button">Create Task</BtnPrimary>
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
          {timeline.map((item) => (
            <MetricCard key={item.label}>
              <Label>{item.label}</Label>
              <MetricValue>{item.value}</MetricValue>
              <Label>{item.hint}</Label>
            </MetricCard>
          ))}
        </OverviewGrid>

        <ContentGrid>
          <Panel aria-labelledby="my-tasks-title">
            <PanelHeader>
              <h2 id="my-tasks-title">My Tasks</h2>
              <PanelLink href="#">See all</PanelLink>
            </PanelHeader>
            <TaskList>
              {myTasks.map((task) => (
                <TaskItem key={task.title}>
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

      <Footer />
    </Page>
  )
}

export default Home