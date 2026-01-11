import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Loader2, ChevronRight, ArrowLeft, Clock, CheckCircle, PlayCircle, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CourseView = () => {
    const { id } = useParams(); // 'id' is courseId
    const navigate = useNavigate();
    
    const [course, setCourse] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [confirmModal, setConfirmModal] = useState(null);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
                const userId = payload.user ? payload.user.id : payload.userid;

                // 1. Fetch Course Metadata
                const courseRes = await API.get(`/Course/${id}`);
                setCourse(courseRes.data);

                // 2. Fetch Assignments List (with user status)
                const assignRes = await API.get(`/Assignment/course/${id}?userId=${userId}`);
                setAssignments(assignRes.data);
            } catch (err) { 
                console.error(err);
                toast.error("Failed to load course data");
            } finally { 
                setLoading(false); 
            }
        };
        fetchData();
    }, [id]);

    const handleAssignmentClick = (assign) => {
        // 1. Check Disqualification
        if (assign.is_disqualified) {
            return toast.error("⛔ Access Denied: You have been disqualified.");
        }

        // 2. Check if already attempted
        if (assign.has_attempted) {
             return toast.error("🔒 You have already completed this assignment.");
        }

        // 3. Open Confirmation Modal
        setConfirmModal(assign);
    };

    const handleStartAttempt = async () => {
        if (!confirmModal) return;
        setIsStarting(true);

        try {
            const token = localStorage.getItem('token');
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.user ? payload.user.id : payload.userid;

            // A. Lock the attempt in Database
            await API.post('/Assignment/start', { 
                userId, 
                assignmentId: confirmModal.assignment_id 
            });

            // B. Redirect to Assignment Lobby (The new page with Timer/List)
            // We no longer jump to the first question immediately.
            navigate(`/assignment/${confirmModal.assignment_id}`);

        } catch (e) {
            console.error(e);
            toast.error(e.response?.data?.error || "Failed to start assignment.");
        } finally {
            setIsStarting(false);
        }
    };

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-gray-400"><Loader2 className="animate-spin mr-2"/> Loading Course...</div>;
    if (!course) return <div className="text-white text-center mt-20">Course Not Found</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Link to="/" className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors"><ArrowLeft size={18}/> Back to Dashboard</Link>
            
            {/* Course Header */}
            <div className="bg-darker p-8 rounded-xl border border-gray-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                    <p className="text-gray-400 max-w-2xl">{course.description}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-gray-700 text-center min-w-[140px]">
                    <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Assignments</span>
                    <div className="text-3xl font-bold text-accent mt-1">
                        {assignments.length}
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Assignments & Exams</h2>
            
            <div className="grid gap-4">
                {assignments.length > 0 ? (
                    assignments.map((assign, idx) => {
                        const isLocked = assign.has_attempted || assign.is_disqualified;
                        
                        return (
                            <div 
                                key={assign.assignment_id} 
                                onClick={() => handleAssignmentClick(assign)}
                                className={`group flex justify-between items-center p-6 rounded-xl border transition-all cursor-pointer relative overflow-hidden
                                    ${isLocked 
                                        ? 'bg-darker border-gray-800 opacity-70' 
                                        : 'bg-darker border-gray-700 hover:border-accent hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-5">
                                    <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm
                                        ${isLocked ? 'bg-gray-800 text-gray-500' : 'bg-accent/10 text-accent'}
                                    `}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <h3 className={`text-lg font-bold mb-1 ${isLocked ? 'text-gray-400' : 'text-white group-hover:text-accent transition-colors'}`}>
                                            {assign.title}
                                        </h3>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 bg-black px-2 py-0.5 rounded border border-gray-800">
                                                <Clock size={12}/> {assign.duration_minutes} mins
                                            </span>
                                            <span>{assign.question_count || 0} Questions</span>
                                            {assign.due_date && (
                                                <span className="text-xs text-orange-400 border border-orange-400/30 px-2 py-0.5 rounded">
                                                    Due: {new Date(assign.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    {assign.is_disqualified ? (
                                        <span className="flex items-center gap-1.5 bg-red-900/20 text-red-500 px-3 py-1 rounded text-xs font-bold border border-red-900/50">
                                            <AlertTriangle size={12}/> DISQUALIFIED
                                        </span>
                                    ) : assign.has_attempted ? (
                                        <span className="flex items-center gap-1.5 bg-green-900/20 text-green-500 px-3 py-1 rounded text-xs font-bold border border-green-900/50">
                                            <CheckCircle size={12}/> COMPLETED
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 bg-blue-900/20 text-blue-400 px-3 py-1 rounded text-xs font-bold border border-blue-900/50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <PlayCircle size={12}/> START
                                        </span>
                                    )}
                                    <ChevronRight className={`transition-transform ${!isLocked && 'group-hover:translate-x-1 text-gray-500 group-hover:text-white'}`} />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-darker rounded-xl border border-dashed border-gray-800">
                        <p className="text-gray-500">No assignments posted for this course yet.</p>
                    </div>
                )}
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#0a0a0a] border border-red-500/30 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        
                        <div className="bg-red-900/10 p-6 flex flex-col items-center text-center border-b border-red-500/10 relative">
                            <button onClick={() => setConfirmModal(null)} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                            <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                                <AlertTriangle className="h-8 w-8 text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Start Assessment?</h3>
                        </div>

                        <div className="p-6 text-center space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You are about to start <span className="text-white font-bold">"{confirmModal.title}"</span>.
                            </p>
                            
                            <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 text-left">
                                <ul className="text-xs text-red-200 space-y-2 list-disc list-inside">
                                    <li><b>Duration:</b> {confirmModal.duration_minutes} Minutes.</li>
                                    <li><b>Proctored:</b> Switching tabs causes disqualification.</li>
                                    <li><b>One-Time:</b> You cannot restart once begun.</li>
                                </ul>
                            </div>
                        </div>
                        <div className="p-4 bg-white/5 flex gap-3">
                            <button 
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                                disabled={isStarting}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleStartAttempt}
                                disabled={isStarting}
                                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-red-900/20 flex justify-center items-center gap-2"
                            >
                                {isStarting ? <Loader2 className="animate-spin" size={18}/> : "Start Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;