import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';
import { Loader2, ChevronRight, ArrowLeft } from 'lucide-react';

const CourseView = () => {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await API.get(`/Course/${id}`);
                setCourse(data);
            } catch (err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchCourse();
    }, [id]);

    if (loading) return <div className="h-screen bg-black flex items-center justify-center text-gray-400"><Loader2 className="animate-spin mr-2"/> Loading...</div>;
    if (!course) return <div className="text-white">Course Not Found</div>;

    return (
        <div className="max-w-5xl mx-auto p-6">
            <Link to="/" className="text-gray-400 hover:text-white mb-6 flex items-center gap-2"><ArrowLeft size={18}/> Back to Dashboard</Link>
            
            <div className="bg-darker p-8 rounded-xl border border-gray-800 mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
                <p className="text-gray-400">{course.description}</p>
            </div>

            <h2 className="text-xl font-bold text-white mb-4">Course Curriculum</h2>
            <div className="space-y-3">
                {course.questions && course.questions.length > 0 ? (
                    course.questions.map((q, idx) => (
                        <Link to={`/solve/${id}/${q.quesid}`} key={q.quesid} className="group flex justify-between items-center bg-darker p-5 rounded-xl border border-gray-800 hover:border-accent hover:bg-gray-800/50 transition-all">
                            <div className="flex items-center gap-4">
                                <span className="flex items-center justify-center w-8 h-8 rounded bg-gray-800 text-gray-400 font-mono text-sm group-hover:bg-accent group-hover:text-white transition-colors">{idx + 1}</span>
                                <div>
                                    <span className="text-lg font-medium text-gray-200 group-hover:text-white">{q.question}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 bg-black px-2 py-0.5 rounded border border-gray-800">{q.category}</span>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-600 group-hover:text-accent" />
                        </Link>
                    ))
                ) : (
                    <div className="text-gray-500 text-center py-10 bg-darker rounded border border-dashed border-gray-800">No questions added yet.</div>
                )}
            </div>
        </div>
    );
};

export default CourseView;