import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Problem from './pages/Problem';
import Admin from './pages/Admin'; // Import Admin
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-gray-200 font-sans">
        <Toaster position="top-right" />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/problem/:id" element={<Problem />} />
          <Route path="/admin" element={<Admin />} /> {/* Add Route */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;