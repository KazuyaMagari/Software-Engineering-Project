
import './App.css'
import Home from './components/home/Home'
import Task from './components/task/Task'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/task" element={<Task />} />
        </Routes>
      </BrowserRouter>
  )
}

export default App
