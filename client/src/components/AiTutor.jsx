import { useState, useRef, useEffect } from 'react';
import API from '../api';
import { Sparkles, Send, X, Bot, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AiTutor = ({ problemDescription, userCode, testResults }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi! I'm your coding assistant. Stuck? Ask me for a hint!" }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!query.trim()) return;

        const userMsg = { role: 'user', text: query };
        setMessages(prev => [...prev, userMsg]);
        setQuery("");
        setIsThinking(true);

        try {
            const { data } = await API.post('/ai/get-hint', {
                studentQuery: query,
                problemDescription: problemDescription, 
                userCode: userCode,                     
                testResults: testResults                
            });

            setMessages(prev => [...prev, { role: 'ai', text: data.hint }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'error', text: err.response?.data?.error || "AI connection failed." }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all z-50 hover:scale-105"
            >
                <Sparkles size={24} /> 
            </button>
        );
    }

    return (
        <div className="fixed bottom-8 right-6 w-[350px] h-[500px] bg-[#0F0F0F] border border-gray-700 rounded-xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="bg-purple-500/20 p-1.5 rounded-lg">
                        <Bot size={18} className="text-purple-400" />
                    </div>
                    <span className="font-bold text-white text-sm">AI Tutor</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={18}/>
                </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-purple-900/30'}`}>
                            {msg.role === 'user' ? <User size={14}/> : <Bot size={14} className="text-purple-400"/>}
                        </div>
                        <div className={`p-3 rounded-lg text-sm max-w-[80%] leading-relaxed ${
                            msg.role === 'user' ? 'bg-blue-600 text-white' : 
                            msg.role === 'error' ? 'bg-red-900/20 text-red-400 border border-red-900/50' :
                            'bg-gray-800 text-gray-200 border border-gray-700'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center shrink-0"><Bot size={14} className="text-purple-400"/></div>
                        <div className="bg-gray-800 p-3 rounded-lg text-gray-400 text-xs flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin"/> Analyzing code...
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                    <input 
                        className="w-full bg-black border border-gray-700 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:border-purple-500 outline-none transition-colors"
                        placeholder="Ask for a hint..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isThinking}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isThinking || !query.trim()}
                        className="absolute right-2 top-2 p-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:bg-gray-700"
                    >
                        <Send size={14} />
                    </button>
                </div>
                <div className="text-[10px] text-gray-600 text-center mt-2">
                    AI analyzes your code & errors. API Key required.
                </div>
            </div>
        </div>
    );
};

export default AiTutor;