import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Loader2, BookOpen, Lock, Globe, CheckCircle } from 'lucide-react';
import Admin from './Admin';
import toast from 'react-hot-toast';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'admin') {
            setIsAdmin(true);
            setLoading(false);
            return;
        }

        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const payload = JSON.parse(atob(token.split(".")[1]));
                // Ensure we get the ID correctly (nested in user object)
                const userId = payload.user ? payload.user.id : payload.userid;

                const { data } = await API.get(`/Course/my-courses/${userId}`);
                setCourses(data);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleCourseEnter = async (course) => {
        // 1. Admins bypass everything
        if (isAdmin) {
            navigate(`/course/${course.course_id}`);
            return;
        }

        // 2. If blocked, show error
        if (course.has_attempted) {
            toast.error("Assessment Locked: You have already attempted this course.");
            return;
        }

        // 3. Show Warning
        const confirmStart = window.confirm(
            "⚠️ IMPORTANT: ONE-TIME ASSESSMENT\n\n" +
            "You are about to start this course. Once you begin, you cannot restart or open it again if you leave.\n\n" +
            "Do you want to start now?"
        );

        if (!confirmStart) return;

        // 4. Mark as Started in Backend
        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.user ? payload.user.id : payload.userid;

            await API.post('/Course/start-attempt', {
                userId: userId,
                courseId: course.course_id
            });
            
            navigate(`/course/${course.course_id}`);
        } catch (err) {
            toast.error("Server Error: Could not start course.");
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-black text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
    );

    if (isAdmin) return <Admin />;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-gray-400 mb-8 border-b border-gray-800 pb-6">Select a course to begin your assessment.</p>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-darker rounded-xl border border-dashed border-gray-800">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No Courses Enrolled</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <div 
                            key={course.course_id} 
                            onClick={() => handleCourseEnter(course)}
                            className={`group block bg-darker rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer relative
                                ${course.has_attempted 
                                    ? 'border-red-900/40 opacity-75' 
                                    : 'border-gray-800 hover:border-accent hover:scale-[1.02]'
                                }
                            `}
                        >
                            <div className={`h-2 w-full ${course.has_attempted ? 'bg-red-900' : 'bg-gradient-to-r from-blue-900 to-accent'}`}></div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg border text-white transition-colors
                                        ${course.has_attempted ? 'bg-red-900/20 border-red-900/50' : 'bg-black border-gray-800 text-accent group-hover:bg-accent'}
                                    `}>
                                        {course.has_attempted ? <Lock size={24} /> : <BookOpen size={24} />}
                                    </div>
                                    
                                    {/* Status Badge */}
                                    {course.has_attempted ? (
                                        <div className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded font-bold border border-red-900/50 flex items-center gap-1">
                                            LOCKED
                                        </div>
                                    ) : (
                                        <div className="bg-green-900/30 text-green-400 text-xs px-2 py-1 rounded font-bold border border-green-900/50 flex items-center gap-1">
                                            AVAILABLE
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                <p className="text-gray-400 text-sm line-clamp-2 h-10">{course.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;