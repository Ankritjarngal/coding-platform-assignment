import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import API from '../api';
import toast from 'react-hot-toast';
import { Play, CheckCircle, Terminal, AlertCircle, Loader2, Dot } from 'lucide-react';
import clsx from 'clsx';

const Problem = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState(null);
    const [code, setCode] = useState("// Write your code here...");
    const [language, setLanguage] = useState("c");
    const [isRunning, setIsRunning] = useState(false);
    
    // UI States
    const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' | 'result'
    const [activeCaseIndex, setActiveCaseIndex] = useState(0); // For switching between Case 1, 2, 3
    
    const [runResults, setRunResults] = useState(null); // Array of results
    const [submitResult, setSubmitResult] = useState(null);

    useEffect(() => {
        const fetchQ = async () => {
            try {
                const { data } = await API.get(`/Question/question?id=${id}`);
                let parsed = null;
                try {
                    parsed = typeof data.testcases === 'string' ? JSON.parse(data.testcases) : data.testcases;
                    if (Array.isArray(parsed)) {
                        parsed = { examples: parsed.slice(0,3), hidden: parsed.slice(3) };
                    }
                } catch (e) { console.error("Parse error", e); }
                
                setQuestion({ ...data, parsedTestCases: parsed });
            } catch (err) { toast.error("Failed to load problem"); }
        };
        fetchQ();
    }, [id]);

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('result');
        setSubmitResult(null);
        setRunResults(null);
        setActiveCaseIndex(0); // Reset to first case

        try {
            const token = localStorage.getItem('token');
            if(!token) return toast.error("Please login first");
            const payload = JSON.parse(atob(token.split(".")[1]));
            
            const { data } = await API.post('/Solution/run', {
                userId: payload.userid,
                questionId: id,
                language,
                solution: code
            });
            
            // Backend now returns { results: [...] }
            setRunResults(data.results);
        } catch (err) {
            toast.error("Execution failed");
        } finally { setIsRunning(false); }
    };

    const handleSubmit = async () => {
        setIsRunning(true);
        setActiveTab('result');
        setRunResults(null);
        setSubmitResult({ status: 'pending' });

        try {
            const token = localStorage.getItem('token');
            if(!token) return toast.error("Please login first");
            const payload = JSON.parse(atob(token.split(".")[1]));

            const { data } = await API.post('/Solution/submit', {
                userId: payload.userid,
                questionId: id,
                language,
                solution: code
            });
            setSubmitResult(data);
        } catch (err) {
            setSubmitResult({ error: err.response?.data?.error || "Server Error" });
        } finally { setIsRunning(false); }
    };

    if (!question) return (
        <div className="flex justify-center items-center h-screen bg-black text-white">
            <Loader2 className="animate-spin mr-2" /> Loading Problem...
        </div>
    );

    // Helper to get current result being viewed
    const currentRunResult = runResults ? runResults[activeCaseIndex] : null;

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-black overflow-hidden">
            <PanelGroup direction="horizontal">
                
                {/* --- LEFT: DESCRIPTION --- */}
                <Panel defaultSize={35} minSize={20}>
                    <div className="bg-darker h-full overflow-y-auto custom-scrollbar p-6 border-r border-gray-800">
                        <h1 className="text-2xl font-bold text-white mb-2">{question.quesid}. {question.question}</h1>
                        <span className={clsx("px-2 py-1 rounded text-xs font-bold", 
                            question.category === 'Easy' ? 'bg-green-900 text-green-300' : 
                            question.category === 'Hard' ? 'bg-red-900 text-red-300' : 
                            'bg-yellow-900 text-yellow-300'
                        )}>{question.category}</span>
                        
                        <div className="mt-6 space-y-6">
                            {question.parsedTestCases?.examples?.map((ex, idx) => (
                                <div key={idx}>
                                    <h3 className="text-gray-400 font-bold mb-2 text-sm">Example {idx + 1}:</h3>
                                    <div className="bg-black/50 p-4 rounded border border-gray-800 font-mono text-sm space-y-2">
                                        <div><span className="text-gray-500 block text-xs">Input:</span><span className="text-gray-300">{ex.input}</span></div>
                                        <div><span className="text-gray-500 block text-xs">Output:</span><span className="text-gray-300">{ex.expected_output}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" />

                {/* --- RIGHT: WORKSPACE --- */}
                <Panel minSize={30}>
                    <PanelGroup direction="vertical">
                        
                        {/* TOP: EDITOR */}
                        <Panel defaultSize={60} minSize={20}>
                            <div className="flex flex-col h-full bg-[#1e1e1e]">
                                <div className="h-12 bg-darker border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                                    <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-black text-gray-300 border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-accent">
                                        <option value="c">C</option>
                                        <option value="cpp">C++</option>
                                        <option value="python">Python</option>
                                        <option value="javascript">JavaScript</option>
                                    </select>
                                    <div className="flex gap-3">
                                        <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-all"><Play size={14} /> Run</button>
                                        <button onClick={handleSubmit} disabled={isRunning} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1.5 rounded text-sm font-medium transition-all"><CheckCircle size={14} /> Submit</button>
                                    </div>
                                </div>
                                <div className="flex-1 relative min-h-0">
                                    <Editor height="100%" theme="vs-dark" language={language === 'javascript' ? 'javascript' : language === 'python' ? 'python' : language === 'c' ? 'c' : 'cpp'} value={code} onChange={(val) => setCode(val)} options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, padding: { top: 16 } }} />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-gray-800 hover:bg-accent cursor-row-resize" />

                        {/* BOTTOM: CONSOLE */}
                        <Panel defaultSize={40} minSize={10}>
                            <div className="h-full bg-darker flex flex-col">
                                <div className="flex border-b border-gray-800 shrink-0">
                                    <button onClick={() => setActiveTab('testcase')} className={clsx("px-4 py-2 text-sm font-medium flex gap-2 items-center", activeTab === 'testcase' ? "text-white border-b-2 border-accent bg-gray-800/50" : "text-gray-500 hover:text-gray-300")}><Terminal size={14}/> Testcase</button>
                                    <button onClick={() => setActiveTab('result')} className={clsx("px-4 py-2 text-sm font-medium flex gap-2 items-center", activeTab === 'result' ? "text-white border-b-2 border-accent bg-gray-800/50" : "text-gray-500 hover:text-gray-300")}><CheckCircle size={14}/> Test Result</button>
                                </div>

                                <div className="p-4 overflow-auto font-mono text-sm flex-1 custom-scrollbar">
                                    
                                    {/* --- INPUT TAB --- */}
                                    {activeTab === 'testcase' && (
                                        <div className="flex gap-2">
                                            {/* Case Buttons */}
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex gap-2 mb-4">
                                                    {question.parsedTestCases?.examples?.map((_, idx) => (
                                                        <button 
                                                            key={idx}
                                                            onClick={() => setActiveCaseIndex(idx)}
                                                            className={clsx("px-4 py-1.5 rounded text-xs font-medium transition-colors", 
                                                                activeCaseIndex === idx ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-750"
                                                            )}
                                                        >
                                                            Case {idx + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                <div className="text-gray-400">
                                                    <p className="mb-2 text-xs uppercase tracking-wide font-semibold text-gray-500">Input:</p>
                                                    <div className="bg-black p-3 rounded border border-gray-700 text-white mb-4 whitespace-pre-wrap">
                                                        {question.parsedTestCases?.examples[activeCaseIndex]?.input || "(No Input)"}
                                                    </div>
                                                    <p className="mb-2 text-xs uppercase tracking-wide font-semibold text-gray-500">Expected Output:</p>
                                                    <div className="bg-black p-3 rounded border border-gray-700 text-white whitespace-pre-wrap">
                                                        {question.parsedTestCases?.examples[activeCaseIndex]?.expected_output}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* --- RESULT TAB --- */}
                                    {activeTab === 'result' && (
                                        <div className="h-full">
                                            {isRunning && <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2"><Loader2 className="animate-spin text-accent" size={24} /><span>Running Code...</span></div>}
                                            
                                            {/* 1. RUN RESULTS (Multi-Case) */}
                                            {!isRunning && runResults && (
                                                <div className="w-full">
                                                    {/* Case Tabs */}
                                                    <div className="flex gap-2 mb-4">
                                                        {runResults.map((res, idx) => (
                                                            <button 
                                                                key={idx}
                                                                onClick={() => setActiveCaseIndex(idx)}
                                                                className={clsx("px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors", 
                                                                    activeCaseIndex === idx ? "bg-gray-700 text-white" : "bg-gray-800 text-gray-400",
                                                                    res.passed ? "text-green-400" : "text-red-400"
                                                                )}
                                                            >
                                                                <Dot size={24} className={res.passed ? "text-green-500" : "text-red-500"} />
                                                                Case {idx + 1}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Output Details */}
                                                    {currentRunResult?.error ? (
                                                        <div className="text-red-400 bg-red-900/10 p-4 rounded border border-red-900/50">
                                                            <h4 className="font-bold mb-2 flex items-center gap-2"><AlertCircle size={16}/> Compilation / Runtime Error</h4>
                                                            <pre className="whitespace-pre-wrap text-xs">{currentRunResult.error}</pre>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <h4 className={clsx("text-lg font-bold mb-4 flex items-center gap-2", currentRunResult?.passed ? "text-green-500" : "text-red-500")}>
                                                                {currentRunResult?.passed ? "Accepted" : "Wrong Answer"}
                                                            </h4>
                                                            <div className="grid gap-4">
                                                                <div><span className="text-gray-500 text-xs uppercase block mb-1">Input</span><div className="bg-darker p-2 rounded text-gray-300 font-mono text-xs">{currentRunResult?.input}</div></div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div><span className="text-gray-500 text-xs uppercase block mb-1">Your Output</span><div className="bg-darker p-2 rounded text-white font-mono text-xs whitespace-pre-wrap">{currentRunResult?.user_output}</div></div>
                                                                    <div><span className="text-gray-500 text-xs uppercase block mb-1">Expected Output</span><div className="bg-darker p-2 rounded text-white font-mono text-xs whitespace-pre-wrap">{currentRunResult?.expected_output}</div></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* 2. SUBMIT RESULTS */}
                                            {!isRunning && submitResult && (
                                                <div className="flex flex-col h-full">
                                                    {submitResult.status === "Accepted" ? (
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            <CheckCircle size={64} className="text-green-500 mb-4" />
                                                            <h2 className="text-3xl font-bold text-green-500 mb-2">Accepted</h2>
                                                            <p className="text-gray-400 text-lg">All {submitResult.total_cases} test cases passed!</p>
                                                        </div>
                                                    ) : (
                                                        <div className="w-full">
                                                             <h2 className="text-2xl font-bold text-red-500 mb-6 flex items-center gap-2"><AlertCircle /> Wrong Answer</h2>
                                                             <div className="bg-red-900/10 border border-red-900/50 p-4 rounded text-red-200 mb-6"><span className="font-bold text-xl">{submitResult.passed_cases} / {submitResult.total_cases}</span> test cases passed.</div>
                                                             {submitResult.failed_case && (
                                                                 <div className="bg-black p-4 rounded border border-gray-700">
                                                                     <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2"><AlertCircle size={16}/> Last Executed Case Failed</h4>
                                                                     <div className="grid gap-3">
                                                                         <div><span className="text-gray-500 text-xs uppercase block mb-1">Input</span><div className="bg-darker p-2 rounded text-gray-300 font-mono text-xs">{submitResult.failed_case.input}</div></div>
                                                                         <div className="grid grid-cols-2 gap-4">
                                                                             <div><span className="text-gray-500 text-xs uppercase block mb-1">Your Output</span><div className="bg-darker p-2 rounded text-red-300 font-mono text-xs">{submitResult.failed_case.user_output || "(Empty)"}</div></div>
                                                                             <div><span className="text-gray-500 text-xs uppercase block mb-1">Expected Output</span><div className="bg-darker p-2 rounded text-green-300 font-mono text-xs">{submitResult.failed_case.expected_output}</div></div>
                                                                         </div>
                                                                     </div>
                                                                 </div>
                                                             )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default Problem;