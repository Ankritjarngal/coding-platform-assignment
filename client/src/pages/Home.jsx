import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { ChevronRight, Search, Loader2, FileQuestion, Layers, Hash } from 'lucide-react';
import clsx from 'clsx'; // Make sure to npm install clsx if you haven't

const Home = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All"); // 1. Category State

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const { data } = await API.get('/Question/all');
                setProblems(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    // 2. Extract Unique Categories & Counts
    const categories = ["All", ...new Set(problems.map(p => p.category))];
    
    // Helper to count problems per category
    const getCategoryCount = (cat) => {
        if (cat === "All") return problems.length;
        return problems.filter(p => p.category === cat).length;
    };

    // 3. Dual Filter Logic (Search + Category)
    const filteredProblems = problems.filter((p) => {
        const matchesSearch = p.question.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex justify-center items-center h-[calc(100vh-80px)] text-gray-400 bg-black">
            <Loader2 className="animate-spin mr-2" /> Loading Problems...
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-6">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Problem Set</h1>
                <p className="text-gray-400 mt-1">Sharpen your skills with these challenges.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* --- LEFT SIDEBAR: CATEGORIES --- */}
                <div className="hidden lg:block lg:col-span-1 space-y-4">
                    <div className="bg-darker rounded-xl border border-gray-800 p-4 sticky top-24">
                        <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Layers size={14} /> Categories
                        </h3>
                        
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={clsx(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex justify-between items-center transition-all",
                                        selectedCategory === cat 
                                            ? "bg-accent text-white shadow-lg shadow-blue-900/20" 
                                            : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                    )}
                                >
                                    <span>{cat}</span>
                                    <span className={clsx(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        selectedCategory === cat ? "bg-white/20 text-white" : "bg-gray-800 text-gray-500"
                                    )}>
                                        {getCategoryCount(cat)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT CONTENT: SEARCH & LIST --- */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search questions by title..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-800 rounded-xl leading-5 bg-darker text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black focus:border-accent focus:ring-1 focus:ring-accent sm:text-sm transition-colors shadow-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Mobile Category Filter (Visible only on small screens) */}
                    <div className="lg:hidden flex overflow-x-auto gap-2 pb-2 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={clsx(
                                    "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors",
                                    selectedCategory === cat 
                                        ? "bg-accent border-accent text-white" 
                                        : "bg-darker border-gray-800 text-gray-400"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Problem List */}
                    <div className="space-y-3">
                        {filteredProblems.length > 0 ? (
                            filteredProblems.map((p) => (
                                <Link 
                                    to={`/problem/${p.quesid}`} 
                                    key={p.quesid} 
                                    className="group flex justify-between items-center bg-darker p-5 rounded-xl border border-gray-800/50 hover:border-accent/50 hover:bg-gray-900/50 transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center justify-center min-w-[2.5rem] h-10 rounded-lg bg-gray-800 text-gray-400 font-mono text-sm group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                            {p.quesid}
                                        </span>
                                        <div>
                                            <span className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors block">
                                                {p.question}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1 lg:hidden">
                                                <Hash size={10} /> {p.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className={`hidden lg:inline-block px-3 py-1 rounded-full text-xs font-bold border ${
                                            p.category === 'Easy' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 
                                            p.category === 'Hard' ? 'bg-red-900/20 text-red-400 border-red-900/50' : 
                                            'bg-yellow-900/20 text-yellow-400 border-yellow-900/50'
                                        }`}>
                                            {p.category || 'Medium'}
                                        </span>
                                        <ChevronRight className="text-gray-600 group-hover:text-accent transition-transform group-hover:translate-x-1" size={20} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            // Empty State
                            <div className="text-center py-20 bg-darker rounded-xl border border-dashed border-gray-800">
                                <FileQuestion className="mx-auto h-12 w-12 text-gray-600 mb-4" />
                                <h3 className="text-lg font-medium text-gray-300">No questions found</h3>
                                <p className="text-gray-500">
                                    {selectedCategory !== "All" 
                                        ? `No questions in "${selectedCategory}" category.` 
                                        : "Try adjusting your search terms."}
                                </p>
                                {selectedCategory !== "All" && (
                                    <button 
                                        onClick={() => setSelectedCategory("All")}
                                        className="mt-4 text-accent hover:underline text-sm"
                                    >
                                        Clear category filter
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;