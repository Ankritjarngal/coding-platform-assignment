import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Plus, Upload, Users, ArrowLeft, Save, Sparkles, Loader2, Eye, EyeOff, Trash2 } from 'lucide-react';

/**
 * COMPONENT: Manage Questions (Add Question Form)
 */
const ManageQuestions = ({ courseId }) => {
    const [form, setForm] = useState({ question: '', category: '' });
    const [examples, setExamples] = useState([{ input: '', expected_output: '' }]);
    const [hidden, setHidden] = useState([{ input: '', expected_output: '' }]);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- Helper for Test Case Rows ---
    const TestCaseList = ({ title, cases, setCases, limit, icon: Icon }) => (
        <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-300 font-bold flex items-center gap-2">
                    <Icon size={18} /> {title}
                </h3>
                <button onClick={() => {
                    if (limit && cases.length >= limit) return toast.error(`Max ${limit} cases.`);
                    setCases([...cases, { input: '', expected_output: '' }]);
                }} className="text-xs bg-gray-800 px-3 py-1 rounded text-white flex gap-1 items-center">
                    <Plus size={12}/> Add
                </button>
            </div>
            {cases.map((tc, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                    <textarea placeholder="Input" value={tc.input} onChange={e => {
                        const newCases = [...cases]; newCases[i].input = e.target.value; setCases(newCases);
                    }} className="flex-1 bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono outline-none" rows={1}/>
                    <textarea placeholder="Output" value={tc.expected_output} onChange={e => {
                        const newCases = [...cases]; newCases[i].expected_output = e.target.value; setCases(newCases);
                    }} className="flex-1 bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono outline-none" rows={1}/>
                    <button onClick={() => setCases(cases.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-900/20 rounded"><Trash2 size={16}/></button>
                </div>
            ))}
        </div>
    );

    const handleGenerateAI = async () => {
        if (!form.question || form.question.length < 5) return toast.error("Write description first!");
        setIsGenerating(true);
        const toastId = toast.loading("AI Generating...");
        try {
            const { data } = await API.post('/Question/generate-testcases', {
                description: form.question, category: form.category, existingTestCases: []
            });
            setExamples(data.examples.slice(0, 3));
            setHidden(data.hidden);
            toast.success("Done!", { id: toastId });
        } catch (e) { toast.error("AI Failed", { id: toastId }); } 
        finally { setIsGenerating(false); }
    };

    const handleSubmit = async () => {
        if (!form.question || !form.category) return toast.error("Fill details");
        try {
            await API.post('/Question/input', {
                ...form, courseId, testcases: JSON.stringify({ examples, hidden })
            });
            toast.success("Question Added!");
            setForm({ question: '', category: '' });
            setExamples([{ input: '', expected_output: '' }]);
            setHidden([{ input: '', expected_output: '' }]);
        } catch(e) { toast.error("Failed to save"); }
    };

    return (
        <div className="bg-darker p-6 rounded-xl border border-gray-800 animate-in slide-in-from-right-4">
            <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-2">Add New Question</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2">
                    <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Description</label>
                    <textarea value={form.question} onChange={e => setForm({...form, question: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white min-h-[100px]" placeholder="Problem Statement..."/>
                </div>
                <div className="flex flex-col gap-2">
                     <label className="text-gray-400 text-xs uppercase font-bold mb-1 block">Category</label>
                     <input value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full bg-black border border-gray-700 rounded p-3 text-white" placeholder="e.g. Arrays"/>
                     <button onClick={handleGenerateAI} disabled={isGenerating} className="mt-auto bg-purple-900/30 border border-purple-500/50 text-purple-300 py-3 rounded flex justify-center items-center gap-2 hover:bg-purple-900/50 transition">
                        {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>} AI Generate
                     </button>
                </div>
            </div>

            <TestCaseList title="Run Cases (Visible)" cases={examples} setCases={setExamples} limit={3} icon={Eye} />
            <TestCaseList title="Submit Cases (Hidden)" cases={hidden} setCases={setHidden} icon={EyeOff} />

            <button onClick={handleSubmit} className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition">
                <Save size={20}/> Add Question to Course
            </button>
        </div>
    );
};

/**
 * COMPONENT: Manage Students (Enrollment)
 */
const ManageStudents = ({ courseId }) => {
    const [email, setEmail] = useState("");

    const handleManualEnroll = async () => {
        if(!email) return;
        try {
            await API.post('/Course/enroll', { email, courseId });
            toast.success("Student Enrolled");
            setEmail("");
        } catch (e) { toast.error(e.response?.data?.error || "Failed"); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading("Uploading CSV...");
        try {
            const { data } = await API.post(`/Course/bulk-enroll/${courseId}`, formData);
            toast.success(data.message, { id: toastId, duration: 5000 });
        } catch (e) { toast.error("Upload Failed", { id: toastId }); }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            {/* Manual Add */}
            <div className="bg-darker p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Users size={18}/> Add Single Student</h3>
                <div className="flex gap-2">
                    <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="student@university.edu" className="bg-black border border-gray-700 p-3 rounded text-white flex-1 outline-none focus:border-accent"/>
                    <button onClick={handleManualEnroll} className="bg-accent hover:bg-blue-600 px-6 rounded text-white font-bold">Add</button>
                </div>
            </div>

            {/* CSV Upload */}
            <div className="bg-darker p-6 rounded-xl border border-gray-800">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Upload size={18}/> Bulk Upload (CSV)</h3>
                <div className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-accent transition-colors cursor-pointer relative group bg-black/20">
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="mx-auto text-gray-500 mb-3 group-hover:text-accent transition-colors" size={32} />
                    <p className="text-gray-400 font-medium">Drag & drop CSV file or <span className="text-accent">Browse</span></p>
                    <p className="text-xs text-gray-600 mt-2">File must contain an "email" column header.</p>
                </div>
            </div>
        </div>
    );
};

/**
 * MAIN PAGE: Admin Dashboard
 */
const Admin = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("questions");
    const [isCreating, setIsCreating] = useState(false);
    const [newCourse, setNewCourse] = useState({ title: '', description: '', is_public: true });

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/Course/my-courses/admin_view');
            setCourses(data);
        } catch(e) { console.error(e); }
    };

    const createCourse = async () => {
        if(!newCourse.title) return toast.error("Title required");
        try {
            await API.post('/Course/create', newCourse);
            toast.success("Course Created");
            setIsCreating(false);
            setNewCourse({ title: '', description: '', is_public: true });
            fetchCourses();
        } catch (e) { toast.error("Failed"); }
    };

    // --- VIEW 1: Course List ---
    if (!selectedCourse) return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Course Manager</h1>
                    <p className="text-gray-400 mt-1">Manage courses, students, and curriculum.</p>
                </div>
                <button onClick={() => setIsCreating(!isCreating)} className="bg-accent hover:bg-blue-600 px-5 py-2.5 rounded-lg text-white flex gap-2 items-center font-medium transition shadow-lg shadow-blue-900/20">
                    <Plus size={18}/> New Course
                </button>
            </div>

            {isCreating && (
                <div className="bg-darker p-6 rounded-xl border border-gray-800 mb-8 animate-in slide-in-from-top-4 shadow-xl">
                    <h3 className="text-white font-bold mb-4">Create New Course</h3>
                    <div className="grid gap-4">
                        <input placeholder="Course Title (e.g. CS101)" className="w-full bg-black p-3 border border-gray-700 rounded text-white outline-none focus:border-accent" value={newCourse.title} onChange={e=>setNewCourse({...newCourse, title:e.target.value})}/>
                        <textarea placeholder="Description" className="w-full bg-black p-3 border border-gray-700 rounded text-white outline-none focus:border-accent" value={newCourse.description} onChange={e=>setNewCourse({...newCourse, description:e.target.value})}/>
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 text-gray-300 cursor-pointer select-none">
                                <input type="checkbox" className="w-4 h-4 accent-accent" checked={newCourse.is_public} onChange={e=>setNewCourse({...newCourse, is_public:e.target.checked})}/>
                                Public Course?
                            </label>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setIsCreating(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                            <button onClick={createCourse} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-bold">Create Course</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                    <div key={course.course_id} onClick={() => setSelectedCourse(course)} className="bg-darker p-6 rounded-xl border border-gray-800 hover:border-accent/50 hover:bg-gray-800/50 cursor-pointer transition group">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">{course.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${course.is_public ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {course.is_public ? 'Public' : 'Private'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{course.description || "No description provided."}</p>
                        <div className="flex items-center text-gray-500 text-xs font-mono">
                            ID: {course.course_id} • Created: {new Date(course.created_at).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    // --- VIEW 2: Inside Selected Course ---
    return (
        <div className="max-w-6xl mx-auto p-6">
            <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition">
                <ArrowLeft size={18}/> Back to Courses
            </button>
            
            <div className="bg-darker rounded-xl border border-gray-800 p-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">{selectedCourse.title}</h1>
                    <p className="text-gray-400 mt-1">{selectedCourse.description}</p>
                </div>
                <div className="flex bg-black p-1 rounded-lg border border-gray-800">
                    <button onClick={() => setActiveTab('questions')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'questions' ? 'bg-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                        Curriculum
                    </button>
                    <button onClick={() => setActiveTab('students')} className={`px-6 py-2 rounded-md text-sm font-medium transition ${activeTab === 'students' ? 'bg-accent text-white shadow' : 'text-gray-400 hover:text-white'}`}>
                        Students
                    </button>
                </div>
            </div>

            {activeTab === 'questions' ? (
                <ManageQuestions courseId={selectedCourse.course_id} />
            ) : (
                <ManageStudents courseId={selectedCourse.course_id} />
            )}
        </div>
    );
};

export default Admin;