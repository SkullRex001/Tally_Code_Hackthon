import './App.css'
import CodeEditor from './pages/CodeEditor';

import { Routes, Route } from 'react-router-dom';
import Projects from './pages/Projects';
import Signup from './pages/Signup';



function App() {

  return (
    <div>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/" element={<Signup />} />
        <Route path="/code" element={<CodeEditor />} />
      </Routes>

    </div>
  )
}

export default App
