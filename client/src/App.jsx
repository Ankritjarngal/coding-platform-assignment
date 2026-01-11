import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Pages
import Auth from './pages/Auth';
import Home from './pages/Home';
import Admin from './pages/Admin';
import CourseView from './pages/CourseView'; // This will now list Assignments
import Profile from './pages/Profile';
import SolveProblem from './pages/Problem';
import Navbar from './components/Navbar';
import AdminRoute from './components/AdminRoute'; 
import AssignmentLobby from './pages/AssignmentLobby';
const RequireAuth = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" replace />;
};

const RequireGuest = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? <Navigate to="/" replace /> : children;
};

const AppLayout = ({ children }) => {
    const location = useLocation();
    const showNavbar = location.pathname !== '/auth';
    return (
        <>
            {showNavbar && <Navbar />}
            {children}
        </>
    );
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      
      <AppLayout>
          <Routes>
            <Route path="/auth" element={
                <RequireGuest>
                    <Auth />
                </RequireGuest>
            } />
            
            <Route path="/" element={
                <RequireAuth>
                    <Home />
                </RequireAuth>
            } />

            {/* View Course -> Lists Assignments */}
            <Route path="/course/:id" element={
                <RequireAuth>
                    <CourseView />
                </RequireAuth>
            } />
            <Route path="/assignment/:assignmentId" element={<RequireAuth><AssignmentLobby /></RequireAuth>} />
            {/* Solve Problem -> Context is now Assignment ID */}
            <Route path="/solve/:assignmentId/:problemId" element={
                <RequireAuth>
                    <SolveProblem />
                </RequireAuth>
            } />

            <Route path="/profile" element={
                <RequireAuth>
                    <Profile />
                </RequireAuth>
            } />

            <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Admin />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;