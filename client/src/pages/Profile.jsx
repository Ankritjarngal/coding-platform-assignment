import { useState, useEffect } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { User, Lock, Save, Camera, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AVATAR_STYLES = [
    "adventurer", "adventurer-neutral", "avataaars", "big-ears", "big-smile", "bottts", "fun-emoji", "icons", "identicon", "initials", "lorelei", "micah", "miniavs", "open-peeps", "personas", "pixel-art"
];

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ username: '', user_email: '', avatar: '' });
    const [password, setPassword] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('adventurer');
    const [seed, setSeed] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            setUser(data);
            // Extract seed and style from existing URL if possible, else default
            setSeed(data.username);
            setIsLoading(false);
        } catch (e) { toast.error("Failed to load profile"); }
    };

    // Generate Avatar URL
    const getAvatarUrl = (style, s) => `https://api.dicebear.com/9.x/${style}/svg?seed=${s}`;

    const handleUpdate = async (e) => {
        e.preventDefault();
        const loadingId = toast.loading("Updating Profile...");
        try {
            const newAvatarUrl = getAvatarUrl(selectedStyle, seed);
            
            await API.put('/auth/update', {
                name: user.username,
                password: password,
                avatar: newAvatarUrl
            });
            
            // Update local state and storage
            setUser(prev => ({ ...prev, avatar: newAvatarUrl }));
            // Trigger a custom event so Navbar updates immediately
            window.dispatchEvent(new Event('profileUpdated'));
            
            toast.success("Profile Updated!", { id: loadingId });
            setPassword('');
        } catch (err) {
            toast.error("Update Failed", { id: loadingId });
        }
    };

    if (isLoading) return <div className="text-white text-center p-20">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white mb-6 flex items-center gap-2">
                <ArrowLeft size={18}/> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Avatar Selector */}
                <div className="bg-darker p-6 rounded-xl border border-gray-800 flex flex-col items-center">
                    <h2 className="text-white font-bold mb-4 flex items-center gap-2"><Camera size={18}/> Avatar</h2>
                    
                    <img 
                        src={getAvatarUrl(selectedStyle, seed)} 
                        alt="Preview" 
                        className="w-32 h-32 rounded-full border-4 border-accent mb-6 shadow-lg shadow-accent/20 bg-black"
                    />

                    <div className="w-full space-y-3">
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Style</label>
                            <select 
                                value={selectedStyle} 
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm outline-none focus:border-accent"
                            >
                                {AVATAR_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 uppercase font-bold">Variation Seed</label>
                            <input 
                                type="text" 
                                value={seed}
                                onChange={(e) => setSeed(e.target.value)}
                                className="w-full bg-black border border-gray-700 rounded p-2 text-white text-sm outline-none focus:border-accent"
                            />
                        </div>
                    </div>
                </div>

                {/* Right: User Details Form */}
                <div className="md:col-span-2 bg-darker p-6 rounded-xl border border-gray-800">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">Edit Profile</h2>
                    
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Full Name</label>
                            <div className="flex items-center bg-black border border-gray-700 rounded p-3 focus-within:border-accent">
                                <User size={18} className="text-gray-500 mr-2"/>
                                <input 
                                    type="text" 
                                    value={user.username} 
                                    onChange={e => setUser({...user, username: e.target.value})}
                                    className="bg-transparent text-white outline-none flex-1"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-400 mb-1 text-sm">Email (Cannot Change)</label>
                            <input type="email" value={user.user_email} disabled className="w-full bg-black/50 border border-gray-800 rounded p-3 text-gray-500 cursor-not-allowed"/>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <label className="block text-accent mb-1 text-sm font-bold">Change Password</label>
                            <div className="flex items-center bg-black border border-gray-700 rounded p-3 focus-within:border-accent">
                                <Lock size={18} className="text-gray-500 mr-2"/>
                                <input 
                                    type="password" 
                                    placeholder="Leave blank to keep current password"
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)}
                                    className="bg-transparent text-white outline-none flex-1"
                                />
                            </div>
                        </div>

                        <button className="w-full bg-accent hover:bg-blue-600 text-white font-bold py-3 rounded flex items-center justify-center gap-2 transition shadow-lg mt-4">
                            <Save size={18}/> Save Changes
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;