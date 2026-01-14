import { useState, useEffect } from 'react'; // 👈 Import useEffect
import { useNavigate } from 'react-router-dom';
import API from '../api';
import toast from 'react-hot-toast';
import { Mail, Lock, User, ArrowRight, Loader2, RefreshCw, Key, Sparkles } from 'lucide-react'; // 👈 Added Key, Sparkles

const Auth = ({ setAuth }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // 👇 Added geminiKey to state
    const [inputs, setInputs] = useState({ email: '', password: '', name: '', geminiKey: '' });
    
    const [avatarSeed, setAvatarSeed] = useState('Felix');
    const [avatarStyle, setAvatarStyle] = useState('adventurer');

    useEffect(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event('authUpdated')); 
    }, []);

    const onChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

    const currentAvatarUrl = `https://api.dicebear.com/9.x/${avatarStyle}/svg?seed=${avatarSeed}`;

    const onSubmitForm = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const endpoint = isLogin ? '/auth/login' : '/auth/register';
        
        const body = isLogin 
            ? { email: inputs.email, password: inputs.password } 
            : { 
                email: inputs.email, 
                password: inputs.password, 
                name: inputs.name, 
                avatar: currentAvatarUrl,
                gemini_api_key: inputs.geminiKey 
              };

        try {
            const { data } = await API.post(endpoint, body);
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            
            window.dispatchEvent(new Event('authUpdated')); 
            
            if (setAuth) setAuth(true);
            toast.success(isLogin ? "Welcome back!" : "Account Created!");
            navigate('/');
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || "Authentication Failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-darker border border-gray-800 rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in-95">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
                    <p className="text-gray-400 text-sm">
                        {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start your coding journey'}
                    </p>
                </div>

                {!isLogin && (
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={() => setAvatarSeed(Math.random().toString(36).substring(7))}>
                            <img 
                                src={currentAvatarUrl} 
                                alt="Avatar Preview" 
                                className="w-20 h-20 rounded-full bg-black border-2 border-accent shadow-lg shadow-accent/20 transition-transform group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 right-0 bg-accent text-white p-1 rounded-full shadow-md">
                                <RefreshCw size={12} />
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Click image to randomize</p>
                    </div>
                )}

                <form onSubmit={onSubmitForm} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-3 top-3.5 text-gray-500" size={18} />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={inputs.name}
                                onChange={onChange}
                                className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-colors"
                                required
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={inputs.email}
                            onChange={onChange}
                            className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-colors"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-500" size={18} />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={inputs.password}
                            onChange={onChange}
                            className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-white focus:border-accent outline-none transition-colors"
                            required
                        />
                    </div>

                    {!isLogin && (
                        <div className="bg-purple-900/10 border border-purple-500/20 p-3 rounded-xl space-y-2 mt-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1">
                                    <Sparkles size={10}/> Gemini API Key <span className="text-gray-600 normal-case font-normal">(Optional)</span>
                                </label>
                                <a 
                                    href="https://aistudio.google.com/app/apikey" 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[10px] text-purple-400 hover:text-white underline decoration-dashed"
                                >
                                    Get Free Key
                                </a>
                            </div>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-purple-500/50" size={16} />
                                <input 
                                    type="text" 
                                    name="geminiKey"
                                    className="w-full bg-black border border-purple-500/30 text-white rounded-lg py-2.5 pl-10 pr-4 focus:border-purple-500 outline-none transition-colors placeholder-gray-700 text-sm"
                                    placeholder="Paste key for AI Tutor..."
                                    value={inputs.geminiKey}
                                    onChange={onChange}
                                />
                            </div>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <>{isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} /></>}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)} 
                        className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;