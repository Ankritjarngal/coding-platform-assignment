import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Loader2, Clock, Play, AlertTriangle, ArrowLeft, Calendar, Lock, CheckCircle, Award } from 'lucide-react';
import toast from 'react-hot-toast';

const AssignmentLobby = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    
    const [assignment, setAssignment] = useState(null);
    const [status, setStatus] = useState(null);
    const [timeLeftDisplay, setTimeLeftDisplay] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Lockout States
    const [isDurationExpired, setIsDurationExpired] = useState(false);
    const [isPastDueDate, setIsPastDueDate] = useState(false);

    // Track seconds purely on frontend after initial fetch
    const [secondsRemaining, setSecondsRemaining] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const token = localStorage.getItem('token');
                const payload = JSON.parse(atob(token.split(".")[1]));
                const userId = payload.user ? payload.user.id : payload.userid;

                // 1. Get Assignment Info (Pass userId to get scores!)
                const assignRes = await API.get(`/Assignment/${assignmentId}?userId=${userId}`);
                setAssignment(assignRes.data);

                // 2. CHECK DEADLINE
                if (assignRes.data.due_date) {
                    const deadline = new Date(assignRes.data.due_date);
                    if (new Date() > deadline) {
                        setIsPastDueDate(true);
                        setLoading(false);
                        return; 
                    }
                }

                // 3. Get Status with Server-Calculated Time
                const statusRes = await API.get(`/Assignment/status/${assignmentId}/${userId}`);
                setStatus(statusRes.data);

                // Set initial seconds from server (Server does the math: Duration - Elapsed)
                if (statusRes.data.remaining_seconds !== undefined) {
                    setSecondsRemaining(Math.floor(statusRes.data.remaining_seconds));
                }
                
            } catch (err) { 
                console.error(err);
                toast.error("Failed to load assignment");
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [assignmentId]);

    // --- COUNTDOWN LOGIC ---
    useEffect(() => {
        // Don't start if we haven't loaded time or if deadline passed
        if (secondsRemaining === null || isPastDueDate) return;

        const interval = setInterval(() => {
            setSecondsRemaining(prev => {
                if (prev <= 0) {
                    clearInterval(interval);
                    setIsDurationExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsRemaining, isPastDueDate]);

    // --- FORMATTER ---
    useEffect(() => {
        if (secondsRemaining === null) return;
        
        const h = Math.floor(secondsRemaining / 3600);
        const m = Math.floor((secondsRemaining % 3600) / 60);
        const s = secondsRemaining % 60;
        
        setTimeLeftDisplay(
            `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        );
    }, [secondsRemaining]);


    if (loading) return <div className="h-screen bg-black flex justify-center items-center text-white"><Loader2 className="animate-spin mr-2"/> Loading...</div>;
    if (!assignment) return <div className="h-screen bg-black text-white p-10 text-center">Assignment Not Found</div>;

    // --- SCREEN 1: Disqualified ---
    if (status?.is_disqualified) {
        return (
            <div className="h-[80vh] flex flex-col justify-center items-center text-red-500 animate-in zoom-in-95">
                <div className="bg-darker p-10 rounded-2xl border border-red-900/50 text-center shadow-2xl max-w-md">
                    <AlertTriangle size={64} className="mb-4 mx-auto"/>
                    <h1 className="text-3xl font-bold mb-2">DISQUALIFIED</h1>
                    <p className="text-gray-400">You have been disqualified due to a violation.</p>
                    <button onClick={() => navigate('/')} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 w-full font-bold">Return Home</button>
                </div>
            </div>
        );
    }

    // --- SCREEN 2: Deadline Passed ---
    if (isPastDueDate) {
        return (
            <div className="h-[80vh] flex flex-col justify-center items-center text-orange-500 animate-in zoom-in-95">
                <div className="bg-darker p-10 rounded-2xl border border-orange-900/50 text-center shadow-2xl max-w-md">
                    <Calendar size={64} className="mb-4 mx-auto"/>
                    <h1 className="text-3xl font-bold mb-2">DEADLINE PASSED</h1>
                    <p className="text-gray-400">Assignment closed on {new Date(assignment.due_date).toLocaleString()}.</p>
                    <button onClick={() => navigate('/')} className="mt-6 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 w-full font-bold">Return Home</button>
                </div>
            </div>
        );
    }

    // --- SCREEN 3: Time Over ---
    if (isDurationExpired) {
        return (
            <div className="h-[80vh] flex flex-col justify-center items-center text-red-400 animate-in zoom-in-95">
                <div className="bg-darker p-10 rounded-2xl border border-red-900/50 text-center shadow-2xl max-w-md">
                    <Lock size={64} className="mb-4 mx-auto"/>
                    <h1 className="text-3xl font-bold mb-2">TIME EXPIRED</h1>
                    <p className="text-gray-400 mb-6">The time limit for this assignment has ended.</p>
                    <button onClick={() => navigate('/')} className="mt-2 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 w-full font-bold">Return Home</button>
                </div>
            </div>
        );
    }

    // --- MAIN LOBBY ---
    return (
        <div className="max-w-5xl mx-auto p-6 md:p-8">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"><ArrowLeft size={18}/> Back</button>

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-darker p-8 rounded-2xl border border-gray-800 mb-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{assignment.title}</h1>
                    <p className="text-gray-400 max-w-xl mb-4">{assignment.description}</p>
                    
                    <div className="flex flex-wrap gap-4">
                        <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 border border-gray-700 px-3 py-1 rounded text-xs font-bold">
                            <Clock size={12}/> Duration: {assignment.duration_minutes} Mins
                        </div>
                        
                        {/* 👇 SCORE BADGE */}
                        <div className="inline-flex items-center gap-2 bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 px-3 py-1 rounded text-xs font-bold">
                            <Award size={12}/> Score: {assignment.user_score || 0} / {assignment.max_score}
                        </div>

                        {assignment.due_date && (
                            <div className="inline-flex items-center gap-2 bg-orange-900/20 text-orange-400 border border-orange-900/50 px-3 py-1 rounded text-xs font-bold">
                                <Calendar size={12}/> Due: {new Date(assignment.due_date).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 md:mt-0 text-right bg-black/40 p-4 rounded-xl border border-gray-700/50 min-w-[180px]">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1 flex items-center justify-end gap-2">
                        <Clock size={12}/> Time Remaining
                    </div>
                    <div className={`text-4xl font-mono font-bold ${timeLeftDisplay === "00:00:00" ? "text-red-500" : "text-accent"}`}>
                        {timeLeftDisplay || <span className="text-gray-500 text-xl animate-pulse">Calculating...</span>}
                    </div>
                </div>
            </div>

             {/* Questions List */}
<h2 className="text-xl font-bold text-white mb-4 pl-1">Problems ({assignment.questions?.length || 0})</h2>

<div className="grid gap-4">
  {assignment.questions && assignment.questions.length > 0 ? (
    assignment.questions.map((q, idx) => (
      <Link 
        to={`/solve/${assignmentId}/${q.quesid}`} 
        key={q.quesid}
        className="flex items-center justify-between p-6 bg-darker border border-gray-800 rounded-xl hover:border-accent hover:bg-gray-800/50 transition-all group shadow-md"
      >
        <div className="flex items-center gap-5">
          {/* Question Index or Solved Icon */}
          <span
            className={`flex items-center justify-center w-10 h-10 rounded-full text-lg font-mono font-bold border transition-colors 
              ${q.is_solved 
                ? 'bg-green-600 border-green-500 text-white' 
                : 'bg-gray-800 text-gray-400 border-gray-700 group-hover:bg-accent group-hover:text-white group-hover:border-accent'}`
            }
          >
            {q.is_solved ? <CheckCircle size={20} /> : idx + 1}
          </span>
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-accent transition-colors mb-1">{q.question}</h3>
            <div className="flex gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide bg-gray-800 text-gray-500 border border-gray-700">
                {q.category}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide border
                ${q.points_earned > 0 
                  ? 'bg-green-900/20 text-green-400 border-green-900/30' 
                  : 'bg-gray-900 text-gray-600 border-gray-800'}`
              }>
                {q.points_earned || 0} pts
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 text-gray-500 group-hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-lg border border-transparent group-hover:border-gray-700">
          <span className="text-sm font-medium">{q.is_solved ? "Review" : "Solve"}</span>
          <Play size={16} className="fill-current"/>
        </div>
      </Link>
    ))
  ) : (
    <div className="text-center py-12 text-gray-500 bg-darker rounded-xl border border-dashed border-gray-800">
      No questions in this assignment yet.
    </div>
  )}
</div>
        </div>
    );
};

export default AssignmentLobby;