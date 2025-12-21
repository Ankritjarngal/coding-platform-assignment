


import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CourseView from './pages/CourseView'; // <--- Make sure you import this!
import ProblemView from './pages/Problem'; // Assuming you have this for questions
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
function App() {
  return (
    <BrowserRouter>
          <div className="min-h-screen bg-black text-gray-200 font-sans">
          <Toaster position="top-right" />
          <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* 👇 THIS IS THE MISSING ROUTE 👇 */}
        <Route path="/course/:id" element={<CourseView />} />

        {/* You likely also need this for individual questions */}
        <Route path="/problem/:id" element={<ProblemView />} /> 
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;