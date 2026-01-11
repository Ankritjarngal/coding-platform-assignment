import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { 
    Plus, Upload, Users, ArrowLeft, Save, Sparkles, Loader2, 
    Eye, EyeOff, Trash2, FileDown, RefreshCw, Search, Clock, ChevronRight,
    BookOpen, Calendar, FileText, Copy // 👈 Added Copy
} from 'lucide-react';

/**
 * ==========================================
 * LEVEL 3: MANAGE QUESTIONS
 * (Inside a specific Assignment)
 * ==========================================
 */
const ManageQuestions = ({ assignmentId, onBack }) => {
    const [questions, setQuestions] = useState([]);
    const [form, setForm] = useState({ question: '', category: '' });
    const [examples, setExamples] = useState([{ input: '', expected_output: '' }]);
    const [hidden, setHidden] = useState([{ input: '', expected_output: '' }]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, [assignmentId]);

    const fetchQuestions = async () => {
        try {
            const { data } = await API.get(`/Assignment/${assignmentId}`);
            setQuestions(data.questions || []);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load questions");
        }
    };

    const handleGenerateAI = async () => {
        if (!form.question || form.question.length < 5) return toast.error("Write description first!");
        
        setIsGenerating(true);
        const toastId = toast.loading("AI Generating...");
        
        try {
            const { data } = await API.post('/Question/generate-testcases', {
                description: form.question, 
                category: form.category, 
                existingTestCases: []
            });
            setExamples(data.examples.slice(0, 3));
            setHidden(data.hidden);
            toast.success("Test Cases Generated!", { id: toastId });
        } catch (e) {
            toast.error("AI Generation Failed", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.question || !form.category) return toast.error("Please fill in all details");
        
        setIsSaving(true);
        try {
            await API.post('/Question/input', {
                ...form, 
                assignmentId, 
                testcases: JSON.stringify({ examples, hidden })
            });
            toast.success("Question Added Successfully!");
            
            // Reset Form
            setForm({ question: '', category: '' });
            setExamples([{ input: '', expected_output: '' }]);
            setHidden([{ input: '', expected_output: '' }]);
            
            // Refresh List
            fetchQuestions();
        } catch(e) {
            toast.error("Failed to save question");
        } finally {
            setIsSaving(false);
        }
    };

    // Helper for Test Case Inputs
    const TestCaseList = ({ title, cases, setCases, limit, icon: Icon }) => (
        <div className="bg-black/30 p-5 rounded-xl border border-gray-800 mb-6 transition-all hover:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-300 font-bold flex items-center gap-2">
                    <Icon size={18} className="text-accent" /> {title}
                </h3>
                <button 
                    onClick={() => {
                        if (limit && cases.length >= limit) return toast.error(`Max ${limit} cases allowed.`);
                        setCases([...cases, { input: '', expected_output: '' }]);
                    }} 
                    className="text-xs bg-gray-800 px-3 py-1.5 rounded text-white flex gap-1 items-center hover:bg-gray-700 transition-colors"
                >
                    <Plus size={14}/> Add Case
                </button>
            </div>
            {cases.map((tc, i) => (
                <div key={i} className="flex gap-3 mb-3 items-start animate-in slide-in-from-left-2">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase text-gray-600 font-bold ml-1">Input</label>
                        <textarea 
                            value={tc.input} 
                            onChange={e => { const newCases = [...cases]; newCases[i].input = e.target.value; setCases(newCases); }} 
                            className="w-full bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono outline-none focus:border-accent transition-colors" 
                            rows={2}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase text-gray-600 font-bold ml-1">Output</label>
                        <textarea 
                            value={tc.expected_output} 
                            onChange={e => { const newCases = [...cases]; newCases[i].expected_output = e.target.value; setCases(newCases); }} 
                            className="w-full bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono outline-none focus:border-accent transition-colors" 
                            rows={2}
                        />
                    </div>
                    <button 
                        onClick={() => setCases(cases.filter((_, idx) => idx !== i))} 
                        className="mt-6 p-2 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded transition-all"
                    >
                        <Trash2 size={18}/>
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <button onClick={onBack} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                <ArrowLeft size={20}/> Back to Assignments
            </button>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: FORM */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-darker p-6 rounded-xl border border-gray-800 shadow-lg">
                        <h2 className="text-xl font-bold text-white mb-6 border-b border-gray-800 pb-4 flex items-center gap-2">
                            <Plus className="text-accent" /> Add New Question
                        </h2>
                        
                        <div className="space-y-5 mb-8">
                            <div>
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Problem Description</label>
                                <textarea 
                                    value={form.question} 
                                    onChange={e => setForm({...form, question: e.target.value})} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-4 text-white min-h-[120px] focus:border-accent outline-none transition-colors" 
                                    placeholder="e.g. Write a function that reverses a string..."
                                />
                            </div>
                            
                            <div>
                                <label className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-2">Category & AI</label>
                                <div className="flex gap-3">
                                    <input 
                                        value={form.category} 
                                        onChange={e => setForm({...form, category: e.target.value})} 
                                        className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent outline-none transition-colors" 
                                        placeholder="e.g. Dynamic Programming"
                                    />
                                    <button 
                                        onClick={handleGenerateAI} 
                                        disabled={isGenerating} 
                                        className="bg-purple-900/20 border border-purple-500/30 text-purple-300 px-6 rounded-lg font-medium hover:bg-purple-900/40 hover:border-purple-500/60 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                                        <span>AI Generate</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <TestCaseList title="Public Test Cases (Visible to Student)" cases={examples} setCases={setExamples} limit={3} icon={Eye} />
                        <TestCaseList title="Hidden Test Cases (For Grading)" cases={hidden} setCases={setHidden} icon={EyeOff} />

                        <button 
                            onClick={handleSubmit} 
                            disabled={isSaving} 
                            className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={20}/> : <><Save size={20}/> Save Question to Assignment</>}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: LIST */}
                <div className="lg:col-span-5">
                    <div className="bg-darker p-6 rounded-xl border border-gray-800 sticky top-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex justify-between items-center">
                            <span>Questions</span>
                            <span className="text-sm bg-gray-800 px-3 py-1 rounded-full text-gray-400">{questions.length}</span>
                        </h2>
                        
                        <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar pr-2">
                            {questions.map((q, idx) => (
                                <div key={q.quesid} className="p-4 bg-black/40 border border-gray-800/60 rounded-lg flex justify-between items-start hover:border-gray-700 transition-colors group">
                                    <div className="flex gap-3">
                                        <span className="text-gray-500 font-mono text-sm">#{idx+1}</span>
                                        <div>
                                            <p className="text-gray-200 text-sm font-medium line-clamp-2 mb-1">{q.question}</p>
                                            <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-800 text-gray-500 px-2 py-0.5 rounded">
                                                {q.category}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            
                            {questions.length === 0 && (
                                <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
                                    <div className="bg-gray-800/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FileText className="text-gray-600" />
                                    </div>
                                    <p className="text-gray-500 text-sm">No questions added yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * ==========================================
 * LEVEL 2: MANAGE ASSIGNMENTS
 * (Inside a specific Course)
 * ==========================================
 */
const ManageAssignments = ({ courseId, onBack }) => {
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', duration: 60, dueDate: '' });

    useEffect(() => {
        fetchAssignments();
    }, [courseId]);

    const fetchAssignments = async () => {
        try {
            const { data } = await API.get(`/Assignment/course/${courseId}`);
            setAssignments(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/Assignment/create', { ...form, courseId });
            toast.success("Assignment Created Successfully");
            setIsCreating(false);
            setForm({ title: '', description: '', duration: 60, dueDate: '' });
            fetchAssignments();
        } catch (e) {
            toast.error("Failed to create assignment");
        }
    };

    // If an assignment is selected, render Level 3
    if (selectedAssignment) {
        return (
            <ManageQuestions 
                assignmentId={selectedAssignment.assignment_id} 
                onBack={() => setSelectedAssignment(null)} 
            />
        );
    }

    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
                <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                    <ArrowLeft size={20}/> Back to Courses
                </button>
                <button 
                    onClick={() => setIsCreating(!isCreating)} 
                    className="bg-accent px-5 py-2.5 rounded-lg text-white text-sm font-bold flex gap-2 items-center hover:bg-blue-600 transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={18}/> {isCreating ? "Cancel" : "New Assignment"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-10 animate-in slide-in-from-top-4 fade-in">
                    <form onSubmit={handleCreate} className="bg-darker p-8 rounded-xl border border-gray-800 max-w-3xl mx-auto shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
                        <h3 className="text-lg font-bold text-white mb-6">Create New Assignment</h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Title</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Midterm Exam, Week 1 Practice" 
                                    value={form.title} 
                                    onChange={e => setForm({...form, title: e.target.value})} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-accent transition-colors" 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Instructions / Description</label>
                                <textarea 
                                    placeholder="Enter instructions for students..." 
                                    value={form.description} 
                                    onChange={e => setForm({...form, description: e.target.value})} 
                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-accent h-24 transition-colors"
                                />
                            </div>
                            
                            {/* DURATION & DUE DATE */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Timer Duration</label>
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-full">
                                            <Clock size={16} className="absolute left-3 top-3 text-gray-500"/>
                                            <input 
                                                type="number" 
                                                value={form.duration} 
                                                onChange={e => setForm({...form, duration: e.target.value})} 
                                                className="bg-black border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white w-full outline-none focus:border-accent"
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500">mins</span>
                                    </div>
                                </div>
                                
<div>
    <label className="block text-gray-400 text-xs font-bold uppercase mb-2">Due Date (Deadline)</label>
    <input 
        type="datetime-local" 
        value={form.dueDate || ''} 
        onChange={e => setForm({...form, dueDate: e.target.value})}
        className="bg-black border border-gray-700 rounded-lg p-2.5 text-white w-full outline-none focus:border-accent"
    />
</div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-lg transition-all shadow-lg shadow-green-900/20">
                                    Create Assignment
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {assignments.map(a => (
                    <div 
                        key={a.assignment_id} 
                        onClick={() => setSelectedAssignment(a)} 
                        className="bg-darker p-6 rounded-xl border border-gray-800 hover:border-accent hover:bg-gray-800/50 cursor-pointer flex justify-between items-center group transition-all"
                    >
                        <div className="flex items-start gap-4">
                            <div className="bg-gray-800 p-3 rounded-lg text-gray-400 group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg group-hover:text-accent transition-colors mb-1">{a.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} /> {a.duration_minutes} mins
                                    </span>
                                    {/* 👇 NEW: ID BADGE for Easy Reset */}
                                    <span 
                                        className="flex items-center gap-1 bg-gray-800 border border-gray-700 text-gray-400 px-2 py-0.5 rounded text-[10px] font-mono cursor-copy hover:text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(a.assignment_id);
                                            toast.success("ID Copied");
                                        }}
                                        title="Click to copy ID"
                                    >
                                        <Copy size={10} /> ID: {a.assignment_id}
                                    </span>
                                    
                                    {a.due_date && (
                                        <span className="text-orange-400 border border-orange-400/20 px-2 rounded text-xs">
                                            Due: {new Date(a.due_date).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            
                            <ChevronRight size={20} className="text-gray-600 group-hover:text-white transition-colors"/>
                        </div>
                    </div>
                ))}

                {assignments.length === 0 && !isCreating && (
                    <div className="text-center py-16 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-gray-300">No Assignments Yet</h3>
                        <p className="text-gray-500 mt-2">Create an assignment to start adding questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * ==========================================
 * LEVEL 2: MANAGE STUDENTS
 * (Inside a specific Course)
 * ==========================================
 */
const ManageStudents = ({ courseId }) => {
    const [email, setEmail] = useState("");
    const [activeStudents, setActiveStudents] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddingSingle, setIsAddingSingle] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [courseId]);

    const fetchStudents = async () => {
        try {
            const { data } = await API.get(`/Course/${courseId}/students`);
            if (data.active) {
                setActiveStudents(data.active);
                setPendingInvites(data.pending || []);
            } else if (Array.isArray(data)) {
                setActiveStudents(data);
                setPendingInvites([]);
            }
        } catch (e) {
            console.error("Fetch Error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualEnroll = async () => {
        if(!email) return;
        setIsAddingSingle(true); 
        try {
            await API.post('/Course/enroll', { email, courseId });
            toast.success("Student Enrolled / Invited");
            setEmail("");
            fetchStudents(); 
        } catch (e) {
            toast.error(e.response?.data?.error || "Enrollment Failed");
        } finally {
            setIsAddingSingle(false);
        } 
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        setIsUploading(true); 
        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading("Uploading CSV...");
        
        try {
            const { data } = await API.post(`/Course/bulk-enroll/${courseId}`, formData);
            toast.success(data.message, { id: toastId });
            fetchStudents(); 
        } catch (e) {
            toast.error("Upload Failed", { id: toastId });
        } finally {
            setIsUploading(false);
            e.target.value = null;
        }
    };

    const handleResetAssignment = async (userId) => {
        const assignmentId = prompt("Enter Assignment ID to reset for this student (Check Assignment Tab for IDs):");
        if (!assignmentId) return;
        
        try {
            await API.post('/Assignment/reset', { userId, assignmentId });
            toast.success("Assignment attempt reset!");
        } catch (e) {
            toast.error("Failed to reset");
        }
    };

    const filteredActive = activeStudents.filter(student => 
        student.user_email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const filteredPending = pendingInvites.filter(invite => 
        invite.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* ACTIONS HEADER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Single Add */}
                <div className="bg-darker p-6 rounded-xl border border-gray-800">
                    <h3 className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Users size={14}/> Add Single Student
                    </h3>
                    <div className="flex gap-3">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e=>setEmail(e.target.value)} 
                            placeholder="student@example.com" 
                            disabled={isAddingSingle} 
                            className="bg-black border border-gray-700 p-3 rounded-lg text-sm text-white flex-1 outline-none focus:border-accent transition-colors disabled:opacity-50"
                        />
                        <button 
                            onClick={handleManualEnroll} 
                            disabled={isAddingSingle} 
                            className="bg-accent px-6 rounded-lg text-sm font-bold text-white hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isAddingSingle ? <Loader2 className="animate-spin" size={16}/> : "Add"}
                        </button>
                    </div>
                </div>

                {/* Bulk Upload */}
                <div className="bg-darker p-6 rounded-xl border border-gray-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Upload size={14}/> Bulk CSV Upload
                        </h3>
                    </div>
                    <label className={`flex items-center justify-center gap-3 border border-dashed rounded-lg p-3 transition-all cursor-pointer group h-[46px]
                        ${isUploading ? 'border-gray-700 bg-gray-900 opacity-70 cursor-not-allowed' : 'border-gray-700 hover:border-accent hover:bg-accent/5'}
                    `}>
                        {isUploading ? (
                            <><Loader2 size={16} className="animate-spin text-accent"/> <span className="text-sm text-gray-400">Processing File...</span></>
                        ) : (
                            <><Upload size={16} className="text-gray-500 group-hover:text-accent"/> <span className="text-sm text-gray-400 group-hover:text-white transition-colors">Click to Upload CSV</span></>
                        )}
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isUploading}/>
                    </label>
                </div>
            </div>

            {/* TABLE SECTION */}
            <div className="bg-darker rounded-xl border border-gray-800 overflow-hidden shadow-xl">
                {/* Table Header / Search */}
                <div className="p-5 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/40">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent/10 p-2 rounded-lg">
                            <Users size={20} className="text-accent"/> 
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Enrolled Students</h3>
                            <p className="text-xs text-gray-500">Total: {filteredActive.length + filteredPending.length}</p>
                        </div>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by name or email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-accent outline-none transition-colors"
                        />
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                        <Loader2 className="animate-spin" size={24}/>
                        <span>Loading enrollment data...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/60 text-gray-400 uppercase text-xs font-bold tracking-wider">
                                <tr>
                                    <th className="p-5">User Name</th>
                                    <th className="p-5">Email Address</th>
                                    <th className="p-5">Enrollment Date</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {filteredActive.map((student) => (
                                    <tr key={student.userid} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-5">
                                            <span className="text-white font-medium block">{student.username}</span>
                                        </td>
                                        <td className="p-5 text-gray-400 font-mono text-xs">{student.user_email}</td>
                                        <td className="p-5 text-gray-500 flex items-center gap-2">
                                            <Calendar size={14}/>
                                            {new Date(student.enrolled_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400 border border-green-900/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                            </span>
                                        </td>
                                        <td className="p-5">
                                            <button 
                                                onClick={() => handleResetAssignment(student.userid)} 
                                                className="text-[10px] bg-red-900/20 text-red-400 border border-red-900/50 px-2 py-1 rounded hover:bg-red-900/40 transition-colors flex items-center gap-1"
                                            >
                                                <RefreshCw size={10} /> Reset Exam
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                
                                {filteredPending.map((invite, idx) => (
                                    <tr key={`pending-${idx}`} className="hover:bg-white/5 transition-colors bg-yellow-500/5">
                                        <td className="p-5 text-gray-500 italic">Pending Registration</td>
                                        <td className="p-5 text-yellow-500/80 font-mono text-xs">{invite.email}</td>
                                        <td className="p-5 text-gray-600">-</td>
                                        <td className="p-5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-900/20 text-yellow-500 border border-yellow-900/30">
                                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span> Invited
                                            </span>
                                        </td>
                                        <td className="p-5 text-gray-600">-</td>
                                    </tr>
                                ))}

                                {filteredActive.length === 0 && filteredPending.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-12 text-center text-gray-500">
                                            {searchQuery ? "No matching students found." : "No students enrolled yet."}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * COMPONENT: Create Course Form (Level 1 Helper)
 */
const CreateCourse = ({ onSuccess }) => {
    const [form, setForm] = useState({ title: '', description: '', is_public: true });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!form.title) return toast.error("Title is required");
        
        setIsSubmitting(true);
        try {
            await API.post('/Course/create', form);
            toast.success("Course Created Successfully!");
            setForm({ title: '', description: '', is_public: true });
            if (onSuccess) onSuccess();
        } catch (err) {
            toast.error("Failed to create course");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-darker p-8 rounded-xl border border-gray-800 max-w-2xl mx-auto animate-in fade-in zoom-in-95 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="bg-accent/10 p-2 rounded-lg"><Plus className="text-accent" size={24} /></div>
                Create New Course
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">Course Title</label>
                    <input type="text" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent outline-none transition-colors" 
                        value={form.title} onChange={e => setForm({...form, title: e.target.value})} required disabled={isSubmitting} placeholder="e.g. Advanced Data Structures"/>
                </div>
                <div>
                    <label className="block text-gray-400 mb-2 text-xs font-bold uppercase tracking-wider">Description</label>
                    <textarea className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-accent outline-none h-32 transition-colors" 
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})} required disabled={isSubmitting} placeholder="Brief overview of the course..."/>
                </div>
                <div className="flex items-center gap-3 p-4 bg-black/40 rounded-lg border border-gray-800">
                    <input type="checkbox" id="public" className="w-5 h-5 accent-accent" 
                        checked={form.is_public} onChange={e => setForm({...form, is_public: e.target.checked})} disabled={isSubmitting}/>
                    <div>
                        <label htmlFor="public" className="text-white font-medium cursor-pointer block">Public Course</label>
                        <p className="text-xs text-gray-500">Visible on student dashboards automatically.</p>
                    </div>
                </div>
                
                <button 
                    disabled={isSubmitting}
                    className={`w-full font-bold p-3 rounded-lg transition-all flex justify-center items-center gap-2 shadow-lg
                        ${isSubmitting ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'}
                    `}
                >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Creating Course...</> : "Create Course"}
                </button>
            </form>
        </div>
    );
};

/**
 * ==========================================
 * LEVEL 1: ADMIN DASHBOARD (MAIN)
 * Lists Courses -> Drills down to Assignments
 * ==========================================
 */
const Admin = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("curriculum"); // 'curriculum' or 'students'
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/Course/my-courses/admin_view');
            setCourses(data);
        } catch(e) {
            console.error(e);
        }
    };

    const handleCourseCreated = () => {
        setIsCreating(false);
        fetchCourses();
    };

    const handleDeleteCourse = async (e, courseId, courseTitle) => {
        e.stopPropagation();
        
        if (!window.confirm(`⚠️ Are you sure you want to delete "${courseTitle}"?\n\nThis will permanently remove:\n- All assignments\n- All student data for this course`)) {
            return;
        }

        setIsDeleting(courseId);
        const toastId = toast.loading("Deleting Course...");

        try {
            await API.delete(`/Course/${courseId}`);
            toast.success("Course Deleted", { id: toastId });
            setCourses(courses.filter(c => c.course_id !== courseId));
            if (selectedCourse?.course_id === courseId) {
                setSelectedCourse(null);
            }
        } catch (err) {
            toast.error("Failed to delete course", { id: toastId });
        } finally {
            setIsDeleting(null);
        }
    };

    // --- VIEW: SELECTED COURSE DETAILS ---
    if (selectedCourse) {
        return (
            <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
                <button onClick={() => setSelectedCourse(null)} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 transition-colors">
                    <ArrowLeft size={20}/> Back to All Courses
                </button>
                
                {/* Course Header */}
                <div className="bg-darker rounded-xl border border-gray-800 p-8 mb-8 flex flex-col md:flex-row justify-between items-end gap-6 shadow-2xl">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-white tracking-tight">{selectedCourse.title}</h1>
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider border ${selectedCourse.is_public ? 'bg-green-900/20 text-green-400 border-green-900/30' : 'bg-red-900/20 text-red-400 border-red-900/30'}`}>
                                {selectedCourse.is_public ? 'Public' : 'Private'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-lg">{selectedCourse.description}</p>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex bg-black p-1.5 rounded-xl border border-gray-800">
                        <button 
                            onClick={() => setActiveTab('curriculum')} 
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${activeTab === 'curriculum' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <BookOpen size={16} /> Curriculum
                        </button>
                        <button 
                            onClick={() => setActiveTab('students')} 
                            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2
                                ${activeTab === 'students' ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}
                            `}
                        >
                            <Users size={16} /> Students
                        </button>
                    </div>
                </div>

                {activeTab === 'curriculum' ? (
                    <ManageAssignments courseId={selectedCourse.course_id} />
                ) : (
                    <ManageStudents courseId={selectedCourse.course_id} />
                )}
            </div>
        );
    }

    // --- VIEW: COURSE LIST ---
    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Course Manager</h1>
                    <p className="text-gray-400 mt-1">Manage courses, assignments, and student enrollments.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)} 
                    className="bg-accent hover:bg-blue-600 px-6 py-3 rounded-xl text-white flex gap-2 items-center font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus size={20}/> {isCreating ? "Close Form" : "New Course"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-12">
                    <CreateCourse onSuccess={handleCourseCreated} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div 
                        key={course.course_id} 
                        onClick={() => setSelectedCourse(course)} 
                        className="bg-darker p-6 rounded-2xl border border-gray-800 hover:border-accent hover:bg-gray-800/50 cursor-pointer transition-all group relative shadow-lg hover:shadow-2xl hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors pr-10 line-clamp-1">{course.title}</h3>
                            
                            <button 
                                onClick={(e) => handleDeleteCourse(e, course.course_id, course.title)}
                                disabled={isDeleting === course.course_id}
                                className="absolute top-5 right-5 p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all z-10 opacity-0 group-hover:opacity-100"
                                title="Delete Course"
                            >
                                {isDeleting === course.course_id ? <Loader2 className="animate-spin" size={20}/> : <Trash2 size={20} />}
                            </button>
                        </div>

                        <div className="mb-6">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${course.is_public ? 'bg-green-900/20 text-green-400 border border-green-900/30' : 'bg-red-900/20 text-red-400 border border-red-900/30'}`}>
                                {course.is_public ? 'Public' : 'Private'}
                            </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 h-10 leading-relaxed">
                            {course.description || "No description provided."}
                        </p>
                        
                        <div className="flex items-center text-gray-500 text-xs font-mono border-t border-gray-800 pt-4 mt-auto">
                            <span className="bg-gray-800 px-2 py-0.5 rounded mr-2">ID: {course.course_id}</span>
                            <span>{new Date(course.created_at).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;