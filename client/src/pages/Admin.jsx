import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { 
    Plus, Upload, Users, ArrowLeft, Save, Sparkles, Loader2, 
    Eye, EyeOff, Trash2, FileDown, RefreshCw, Search 
} from 'lucide-react';

/**
 * COMPONENT: Create Course Form
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
        <div className="bg-darker p-8 rounded-xl border border-gray-800 max-w-2xl mx-auto animate-in fade-in zoom-in-95">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Plus className="text-accent" /> Create New Course
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">Course Title</label>
                    <input type="text" className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-accent outline-none" 
                        value={form.title} onChange={e => setForm({...form, title: e.target.value})} required disabled={isSubmitting}/>
                </div>
                <div>
                    <label className="block text-gray-400 mb-1 text-sm">Description</label>
                    <textarea className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:border-accent outline-none h-32" 
                        value={form.description} onChange={e => setForm({...form, description: e.target.value})} required disabled={isSubmitting}/>
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" id="public" className="w-4 h-4 accent-accent" 
                        checked={form.is_public} onChange={e => setForm({...form, is_public: e.target.checked})} disabled={isSubmitting}/>
                    <label htmlFor="public" className="text-gray-300 cursor-pointer">Public Course</label>
                </div>
                
                <button 
                    disabled={isSubmitting}
                    className={`w-full font-bold p-3 rounded transition-colors flex justify-center items-center gap-2
                        ${isSubmitting ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-green-600 hover:bg-green-700 text-white'}
                    `}
                >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={20}/> Creating Course...</> : "Create Course"}
                </button>
            </form>
        </div>
    );
};

/**
 * COMPONENT: Manage Questions (Curriculum)
 */
const ManageQuestions = ({ courseId }) => {
    const [form, setForm] = useState({ question: '', category: '' });
    const [examples, setExamples] = useState([{ input: '', expected_output: '' }]);
    const [hidden, setHidden] = useState([{ input: '', expected_output: '' }]);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
                }} className="text-xs bg-gray-800 px-3 py-1 rounded text-white flex gap-1 items-center hover:bg-gray-700">
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
        
        setIsSaving(true);
        try {
            await API.post('/Question/input', {
                ...form, courseId, testcases: JSON.stringify({ examples, hidden })
            });
            toast.success("Question Added!");
            setForm({ question: '', category: '' });
            setExamples([{ input: '', expected_output: '' }]);
            setHidden([{ input: '', expected_output: '' }]);
        } catch(e) { toast.error("Failed to save"); }
        finally { setIsSaving(false); }
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
                     <button onClick={handleGenerateAI} disabled={isGenerating || isSaving} className="mt-auto bg-purple-900/30 border border-purple-500/50 text-purple-300 py-3 rounded flex justify-center items-center gap-2 hover:bg-purple-900/50 transition disabled:opacity-50 disabled:cursor-not-allowed">
                        {isGenerating ? <Loader2 className="animate-spin"/> : <Sparkles size={18}/>} AI Generate
                     </button>
                </div>
            </div>

            <TestCaseList title="Run Cases (Visible)" cases={examples} setCases={setExamples} limit={3} icon={Eye} />
            <TestCaseList title="Submit Cases (Hidden)" cases={hidden} setCases={setHidden} icon={EyeOff} />

            <button 
                onClick={handleSubmit} 
                disabled={isSaving || isGenerating}
                className={`w-full font-bold py-3 rounded flex items-center justify-center gap-2 transition
                    ${isSaving ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-accent hover:bg-blue-600 text-white'}
                `}
            >
                {isSaving ? <><Loader2 className="animate-spin" size={20}/> Saving Question...</> : <><Save size={20}/> Add Question to Course</>}
            </button>
        </div>
    );
};

/**
 * COMPONENT: Manage Students (Enrollment, Search & Reset)
 */
const ManageStudents = ({ courseId }) => {
    const [email, setEmail] = useState("");
    const [activeStudents, setActiveStudents] = useState([]);
    const [pendingInvites, setPendingInvites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Separate loading states
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

    const handleReset = async (userId) => {
        if(!window.confirm("Allow this student to take the course again?")) return;
        try {
            await API.post('/Course/reset-attempt', { userId, courseId });
            toast.success("Attempt Reset!");
            fetchStudents();
        } catch (e) { toast.error("Failed to reset"); }
    };

    const handleManualEnroll = async () => {
        if(!email) return;
        setIsAddingSingle(true);
        try {
            await API.post('/Course/enroll', { email, courseId });
            toast.success("Processed!");
            setEmail("");
            fetchStudents(); 
        } catch (e) { toast.error(e.response?.data?.error || "Failed"); }
        finally { setIsAddingSingle(false); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const toastId = toast.loading("Uploading & Processing CSV...");
        
        try {
            const { data } = await API.post(`/Course/bulk-enroll/${courseId}`, formData);
            toast.success(data.message, { id: toastId });
            fetchStudents(); 
        } catch (e) { toast.error("Upload Failed", { id: toastId }); }
        finally { 
            setIsUploading(false);
            e.target.value = null; // Reset input
        }
    };

    const downloadSampleCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,email\nstudent1@example.com\nstudent2@university.edu";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "students_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredActive = activeStudents.filter(student => 
        student.user_email.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPending = pendingInvites.filter(invite => 
        invite.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Manual Add */}
                <div className="bg-black/40 p-4 rounded-xl border border-gray-800">
                    <h3 className="text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Add Single User</h3>
                    <div className="flex gap-2">
                        <input 
                            type="email" 
                            value={email} 
                            onChange={e=>setEmail(e.target.value)} 
                            placeholder="user@example.com" 
                            disabled={isAddingSingle}
                            className="bg-black border border-gray-700 p-2 rounded text-sm text-white flex-1 outline-none focus:border-accent transition-colors disabled:opacity-50"
                        />
                        <button 
                            onClick={handleManualEnroll} 
                            disabled={isAddingSingle}
                            className={`px-4 py-2 rounded text-sm font-bold text-white transition-colors flex items-center gap-2
                                ${isAddingSingle ? 'bg-gray-700 cursor-not-allowed' : 'bg-accent hover:bg-blue-600'}
                            `}
                        >
                            {isAddingSingle ? <Loader2 className="animate-spin" size={14}/> : "Add"}
                        </button>
                    </div>
                </div>

                {/* Bulk Upload */}
                <div className="bg-black/40 p-4 rounded-xl border border-gray-800 relative">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Bulk CSV Upload</h3>
                        <button 
                            onClick={downloadSampleCSV} 
                            className="text-xs text-accent hover:underline flex items-center gap-1"
                        >
                            <FileDown size={14} /> Template
                        </button>
                    </div>

                    <label className={`flex items-center justify-center gap-2 border border-dashed rounded-lg p-2 transition-all group
                        ${isUploading 
                            ? 'border-gray-700 bg-gray-900 cursor-not-allowed opacity-70' 
                            : 'border-gray-700 cursor-pointer hover:border-accent hover:bg-accent/5'
                        }
                    `}>
                        {isUploading ? (
                            <><Loader2 size={16} className="animate-spin text-accent"/> <span className="text-sm text-gray-400">Processing...</span></>
                        ) : (
                            <><Upload size={16} className="text-gray-500 group-hover:text-accent"/> <span className="text-sm text-gray-400 group-hover:text-white">Click to Upload CSV</span></>
                        )}
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={isUploading}/>
                    </label>
                </div>
            </div>

            {/* List Section */}
            <div className="bg-black/40 rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 bg-black/60">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-accent"/> 
                        Enrolled Students 
                        <span className="bg-gray-800 text-gray-300 text-xs py-0.5 px-2 rounded-full">{filteredActive.length + filteredPending.length}</span>
                    </h3>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by email..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-darker border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:border-accent outline-none"
                        />
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading student data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-black/40 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4 font-medium">User Name</th>
                                    <th className="p-4 font-medium">Email</th>
                                    <th className="p-4 font-medium">Status</th>
                                    <th className="p-4 font-medium">Action</th> 
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredActive.map((student) => (
                                    <tr key={student.userid} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-white font-medium">{student.username}</td>
                                        <td className="p-4 text-gray-300">{student.user_email}</td>
                                        <td className="p-4">
                                            {student.has_attempted ? (
                                                <span className="text-red-400 bg-red-900/20 px-2 py-0.5 rounded text-xs border border-red-900/50">Attempted</span>
                                            ) : (
                                                <span className="text-gray-400 bg-gray-800 px-2 py-0.5 rounded text-xs">Not Started</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {student.has_attempted && (
                                                <button 
                                                    onClick={() => handleReset(student.userid)}
                                                    className="flex items-center gap-1 text-xs bg-accent/10 text-accent hover:bg-accent hover:text-white border border-accent/30 px-3 py-1.5 rounded transition-all"
                                                >
                                                    <RefreshCw size={12} /> Reset
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredPending.map((invite, idx) => (
                                    <tr key={`pending-${idx}`} className="hover:bg-white/5 transition-colors bg-yellow-500/5">
                                        <td className="p-4 text-gray-500 italic">Pending Registration</td>
                                        <td className="p-4 text-yellow-500/80">{invite.email}</td>
                                        <td className="p-4"><span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">Invited</span></td>
                                        <td className="p-4">-</td>
                                    </tr>
                                ))}
                                {filteredActive.length === 0 && filteredPending.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-gray-500">
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
 * MAIN PAGE: Admin Dashboard
 */
const Admin = () => {
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [activeTab, setActiveTab] = useState("questions");
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(null);

    useEffect(() => { fetchCourses(); }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await API.get('/Course/my-courses/admin_view');
            setCourses(data);
        } catch(e) { console.error(e); }
    };

    const handleCourseCreated = () => {
        setIsCreating(false);
        fetchCourses();
    };

    // Handle Delete Logic
    const handleDeleteCourse = async (e, courseId, courseTitle) => {
        e.stopPropagation(); // Prevent opening the course
        
        if (!window.confirm(`⚠️ DANGER ZONE\n\nAre you sure you want to delete "${courseTitle}"?\n\nThis will permanently remove:\n- All student enrollments\n- All questions\n- All grades\n\nThis action cannot be undone.`)) {
            return;
        }

        setIsDeleting(courseId);
        const toastId = toast.loading("Deleting Course...");

        try {
            await API.delete(`/Course/${courseId}`);
            toast.success("Course Deleted", { id: toastId });
            
            // Remove from list immediately
            setCourses(courses.filter(c => c.course_id !== courseId));
            
            // If we were viewing that course, go back to list
            if (selectedCourse?.course_id === courseId) {
                setSelectedCourse(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete course", { id: toastId });
        } finally {
            setIsDeleting(null);
        }
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
                    <Plus size={18}/> {isCreating ? "Close Form" : "New Course"}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8">
                    <CreateCourse onSuccess={handleCourseCreated} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map(course => (
                    <div 
                        key={course.course_id} 
                        onClick={() => setSelectedCourse(course)} 
                        className="bg-darker p-6 rounded-xl border border-gray-800 hover:border-accent/50 hover:bg-gray-800/50 cursor-pointer transition group relative"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors pr-8">{course.title}</h3>
                            
                            {/* DELETE BUTTON */}
                            <button 
                                onClick={(e) => handleDeleteCourse(e, course.course_id, course.title)}
                                disabled={isDeleting === course.course_id}
                                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all z-10"
                                title="Delete Course"
                            >
                                {isDeleting === course.course_id ? <Loader2 className="animate-spin" size={18}/> : <Trash2 size={18} />}
                            </button>
                        </div>

                        <div className="mb-6">
                            <span className={`text-xs px-2 py-1 rounded font-bold uppercase ${course.is_public ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                                {course.is_public ? 'Public' : 'Private'}
                            </span>
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-6 line-clamp-2 min-h-[40px]">{course.description || "No description provided."}</p>
                        
                        <div className="flex items-center text-gray-500 text-xs font-mono border-t border-gray-800 pt-4">
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