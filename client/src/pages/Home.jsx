import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { Loader2, BookOpen, Lock, Globe, Shield } from 'lucide-react';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role === 'admin') setIsAdmin(true);

        const fetchCourses = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                // --- FIX START ---
                const payload = JSON.parse(atob(token.split(".")[1]));
                
                // Debugging: Check console to see structure
                console.log("Token Payload:", payload); 

                // The ID is nested inside 'user'. 
                // It is NOT payload.userid. It is payload.user.id
                const userId = payload.user.id; 
                // --- FIX END ---

                const endpoint = role === 'admin' 
                    ? `/Course/my-courses/admin_view` 
                    : `/Course/my-courses/${userId}`; // <--- Use the fixed variable

                const { data } = await API.get(endpoint);
                setCourses(data);
            } catch (err) {
                console.error("Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] bg-black text-gray-400">
            <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-end mb-8 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                        {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                    </h1>
                    <p className="text-gray-400 mt-1">
                        {isAdmin ? "Manage courses, enrollments, and content." : "Access your learning paths."}
                    </p>
                </div>
                
                {/* 3. ADMIN BUTTON (Only visible if role === 'admin') */}
                {isAdmin && (
                    <Link 
                        to="/admin" 
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-purple-900/20"
                    >
                        <Shield size={18} /> Manage Content
                    </Link>
                )}
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-20 bg-darker rounded-xl border border-dashed border-gray-800">
                    <BookOpen className="mx-auto h-16 w-16 text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">No Courses Found</h3>
                    <p className="text-gray-500">{isAdmin ? "Create your first course in the Admin Panel." : "You are not enrolled in any courses yet."}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <Link to={`/course/${course.course_id}`} key={course.course_id} className="group block bg-darker rounded-xl border border-gray-800 overflow-hidden hover:border-accent transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
                            {/* Color Bar */}
                            <div className="h-2 w-full bg-gradient-to-r from-blue-900 to-accent"></div>
                            
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-black rounded-lg border border-gray-800 text-accent group-hover:text-white group-hover:bg-accent transition-colors">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded font-bold uppercase ${course.is_public ? 'text-green-400 bg-green-900/20' : 'text-yellow-400 bg-yellow-900/20'}`}>
                                        {course.is_public ? <Globe size={12}/> : <Lock size={12}/>}
                                        {course.is_public ? ' Public' : ' Private'}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2 h-10">
                                    {course.description}
                                </p>
                            </div>
                            
                            {isAdmin && (
                                <div className="px-6 py-3 bg-purple-900/10 border-t border-purple-900/30 text-xs text-purple-300 flex justify-between">
                                    <span>Admin Access</span>
                                    <span>Edit Course →</span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Home;