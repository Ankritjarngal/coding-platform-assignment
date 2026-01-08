import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { Loader2, BookOpen, Lock, Globe, PlayCircle, AlertTriangle, X } from 'lucide-react';
import Admin from './Admin';
import toast from 'react-hot-toast';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // 👇 NEW: State to control the Custom Popup
    const [confirmModal, setConfirmModal] = useState(null); // Stores the course object waiting for confirmation
    const [isStarting, setIsStarting] = useState(false); // Loading state for the "Start" button

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

    // 1. Handle Card Click
    const handleCourseClick = (course) => {
        // A. Admins & Public Courses -> Go Immediately
        if (isAdmin || course.is_public) {
            navigate(`/course/${course.course_id}`);
            return;
        }

        // B. Locked Courses -> Block
        if (course.has_attempted) {
            toast.error("Assessment Locked: You have already attempted this private course.");
            return;
        }

        // C. Private & Not Attempted -> OPEN CUSTOM MODAL
        setConfirmModal(course);
    };

    // 2. Handle "Start Now" Button in Modal
    const handleConfirmStart = async () => {
        if (!confirmModal) return;
        setIsStarting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.user ? payload.user.id : payload.userid;

            // Mark attempt in backend
            await API.post('/Course/start-attempt', {
                userId: userId,
                courseId: confirmModal.course_id
            });
            
            navigate(`/course/${confirmModal.course_id}`);
        } catch (err) {
            toast.error("Server Error: Could not start course.");
            console.error(err);
            setIsStarting(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-black text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
    );

    if (isAdmin) return <Admin />;

    return (
        <div className="max-w-6xl mx-auto p-6 relative">
            <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
            <p className="text-gray-400 mb-8 border-b border-gray-800 pb-6">Select a course to begin.</p>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-darker rounded-xl border border-dashed border-gray-800">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No Courses Enrolled</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => {
                        const isLocked = !course.is_public && course.has_attempted;

                        return (
                            <div 
                                key={course.course_id} 
                                onClick={() => handleCourseClick(course)}
                                className={`group block bg-darker rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg cursor-pointer relative
                                    ${isLocked
                                        ? 'border-red-900/40 opacity-75' 
                                        : 'border-gray-800 hover:border-accent hover:scale-[1.02]' 
                                    }
                                `}
                            >
                                <div className={`h-2 w-full ${isLocked ? 'bg-red-900' : 'bg-gradient-to-r from-blue-900 to-accent'}`}></div>
                                
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-lg border text-white transition-colors
                                            ${isLocked ? 'bg-red-900/20 border-red-900/50' : 'bg-black border-gray-800 text-accent group-hover:bg-accent'}
                                        `}>
                                            {isLocked ? <Lock size={24} /> : <BookOpen size={24} />}
                                        </div>
                                        
                                        {course.is_public ? (
                                            <div className="bg-blue-900/30 text-blue-400 text-xs px-2 py-1 rounded font-bold border border-blue-900/50 flex items-center gap-1">
                                                <Globe size={12}/> PUBLIC
                                            </div>
                                        ) : isLocked ? (
                                            <div className="bg-red-900/30 text-red-400 text-xs px-2 py-1 rounded font-bold border border-red-900/50 flex items-center gap-1">
                                                LOCKED
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-900/30 text-yellow-400 text-xs px-2 py-1 rounded font-bold border border-yellow-900/50 flex items-center gap-1">
                                                PRIVATE
                                            </div>
                                        )}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-2 h-10">{course.description}</p>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 flex items-center gap-2">
                                        {isLocked ? (
                                            <>Contact admin to reset attempt</>
                                        ) : course.is_public ? (
                                            <><PlayCircle size={14}/> Unlimited Access</>
                                        ) : (
                                            <><Lock size={14}/> One-Time Assessment</>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 👇 CUSTOM MODAL OVERLAY 👇 */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="bg-red-900/10 p-6 flex flex-col items-center text-center border-b border-red-500/10 relative">
                            <button 
                                onClick={() => setConfirmModal(null)} 
                                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">One-Time Assessment</h3>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 text-center space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You are about to start <span className="text-white font-bold">"{confirmModal.title}"</span>.
                            </p>
                            
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 text-left">
                                <ul className="text-xs text-red-200 space-y-2 list-disc list-inside">
                                    <li>This is a <b>Private Exam</b>.</li>
                                    <li>Once started, you <b>cannot restart</b>.</li>
                                    <li>If you close the window, you may be locked out.</li>
                                </ul>
                            </div>
                        </div>

                        {/* Modal Footer (Buttons) */}
                        <div className="p-4 bg-white/5 flex gap-3">
                            <button 
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                disabled={isStarting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmStart}
                                disabled={isStarting}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 flex justify-center items-center gap-2"
                            >
                                {isStarting ? <Loader2 className="animate-spin" size={18}/> : "Start Assessment"}
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;