import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import API from '../api';
import toast from 'react-hot-toast';
import { Play, CheckCircle, Terminal, AlertCircle, Loader2, Dot, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

import AiTutor from '../components/AiTutor';

const BOILERPLATES = {
    c: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    // Write your C code here\n    return 0;\n}`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Write your C++ code here\n    return 0;\n}`,
    python: `import sys\n\ndef solve():\n    # Write your Python code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
    javascript: `// Write your JavaScript code here`
};

const Problem = () => {
    const { assignmentId, problemId } = useParams();
    const id = problemId; 
    const navigate = useNavigate();

    const [question, setQuestion] = useState(null);
    const [parentCourseId, setParentCourseId] = useState(null); 
    
    const [language, setLanguage] = useState("c");
    const [code, setCode] = useState(BOILERPLATES["c"]); 
    const [isRunning, setIsRunning] = useState(false);
    
    const [activeTab, setActiveTab] = useState('testcase'); 
    const [activeCaseIndex, setActiveCaseIndex] = useState(0); 
    const [runResults, setRunResults] = useState(null); 
    const [submitResult, setSubmitResult] = useState(null);

    // PROCTORING STATE
    const [warnings, setWarnings] = useState(0);
    const [isDisqualified, setIsDisqualified] = useState(false);
    const hasFetchedStatus = useRef(false);

    useEffect(() => {
        const init = async () => {
            try {
                const token = localStorage.getItem('token');
                if(!token) return;
                const payload = JSON.parse(atob(token.split(".")[1]));
                const userId = payload.user ? payload.user.id : payload.userid;

                // A. Check Proctor Status (Using Assignment API)
                if (!hasFetchedStatus.current) {
                    const statusRes = await API.get(`/Assignment/status/${assignmentId}/${userId}`);
                    setWarnings(statusRes.data.warnings_count || 0);
                    setIsDisqualified(statusRes.data.is_disqualified || false);
                    hasFetchedStatus.current = true;
                }

                // B. Fetch Question & Parent Course Info
                const assignRes = await API.get(`/Assignment/${assignmentId}`);
                if (assignRes.data) {
                    setParentCourseId(assignRes.data.course_id);
                }

                const { data } = await API.get(`/Question/question?id=${id}`);
                let parsed = null;
                try {
                    parsed = typeof data.testcases === 'string' ? JSON.parse(data.testcases) : data.testcases;
                    if (Array.isArray(parsed)) parsed = { examples: parsed.slice(0,3), hidden: parsed.slice(3) };
                } catch (e) { console.error("Parse error", e); }
                setQuestion({ ...data, parsedTestCases: parsed });

            } catch (err) { toast.error("Failed to load data"); }
        };
        init();
    }, [id, assignmentId]);

    // 🔒 PROCTORING WATCHDOG (UPDATED: STRICTER LOGIC)
    useEffect(() => {
        if (isDisqualified) return;

        // 1. Define the penalty action
        const penalize = async (currentWarnings) => {
            const token = localStorage.getItem('token');
            if(!token) return;
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.user ? payload.user.id : payload.userid;

            if (currentWarnings < 3) {
                 toast.custom((t) => (
                    <div className="bg-red-600 text-white p-4 rounded-lg shadow-2xl flex items-center gap-3 animate-bounce">
                        <AlertTriangle size={24} />
                        <div>
                            <h3 className="font-bold">PROCTOR WARNING {currentWarnings}/3</h3>
                            <p className="text-sm">Return to screen immediately!</p>
                        </div>
                    </div>
                ), { duration: 3000 });
                
                await API.post('/Assignment/report-violation', { userId, assignmentId, action: 'warn' });
            } else {
                setIsDisqualified(true);
                await API.post('/Assignment/report-violation', { userId, assignmentId, action: 'disqualify' });
            }
        };

        const handleViolation = () => {
            // Increment local state immediately
            const newWarnings = warnings + 1;
            setWarnings(newWarnings);
            penalize(newWarnings);
        };

        // 2. Event Listeners (Immediate Trigger)
        const onVisibilityChange = () => { if (document.hidden) handleViolation(); };
        const onBlur = () => { 
            // Ignore if user clicks inside the Code Editor (iframe)
            if (document.activeElement?.tagName !== "IFRAME") handleViolation(); 
        };

        // 3. CONTINUOUS POLLING (The "Strict" Part)
        // If user stays away, they get hit with a warning every 4 seconds.
        const strictCheck = setInterval(() => {
            if (document.hidden || !document.hasFocus()) {
                if (document.activeElement?.tagName !== "IFRAME") {
                    handleViolation();
                }
            }
        }, 4000); // 4 Seconds Grace Period per warning

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("blur", onBlur);

        return () => {
            clearInterval(strictCheck);
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("blur", onBlur);
        };
    }, [warnings, isDisqualified, assignmentId]);

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        setCode(BOILERPLATES[e.target.value]);
    };

    const handleRun = async () => {
        setIsRunning(true);
        setActiveTab('result');
        setSubmitResult(null);
        setRunResults(null);
        setActiveCaseIndex(0); 

        try {
            const token = localStorage.getItem('token');
            if(!token) return toast.error("Please login first");
            const payload = JSON.parse(atob(token.split(".")[1]));
            const userId = payload.user ? payload.user.id : payload.userid;
            
            const { data } = await API.post('/Solution/run', {
                userId: userId,
                questionId: id,
                language,
                solution: code
            });
            
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
            const userId = payload.user ? payload.user.id : payload.userid;

            const { data } = await API.post('/Solution/submit', {
                userId: userId,
                courseId: parentCourseId, // 👈 CHANGE THIS (Was assignmentId)
                questionId: id,
                language,
                solution: code
            });
            
            setSubmitResult(data);
            if (data.score_earned !== undefined && data.score_earned > 0) {
                toast.success(`Score earned: ${data.score_earned} points!`);
            }

        } catch (err) {
            setSubmitResult({ error: err.response?.data?.error || "Server Error" });
        } finally { setIsRunning(false); }
    };

    if (!question) return (
        <div className="flex justify-center items-center h-screen bg-black text-white">
            <Loader2 className="animate-spin mr-2" /> Loading Problem...
        </div>
    );

    if (isDisqualified) {
        return (
            <div className="h-screen w-full bg-black flex flex-col items-center justify-center text-white p-8 text-center animate-in zoom-in-95 duration-300">
                <div className="bg-darker p-8 rounded-2xl border border-red-900/50 max-w-lg shadow-2xl">
                    <Lock size={60} className="text-red-500 mb-6 mx-auto" />
                    <h1 className="text-3xl font-bold mb-3">Assignment Locked</h1>
                    <p className="text-gray-400 mb-6">
                        You have been disqualified from this assignment due to a proctoring violation (switching tabs/windows).
                    </p>
                    <div className="bg-black p-4 rounded border border-gray-800 mb-8 text-left">
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Status</p>
                        <p className="text-red-400 font-mono text-sm">VIOLATION_DETECTED</p>
                    </div>
                    {parentCourseId ? (
                        <Link to={`/course/${parentCourseId}`} className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Back to Course
                        </Link>
                    ) : (
                        <Link to="/" className="block w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-colors">
                            Back to Dashboard
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    const currentRunResult = runResults ? runResults[activeCaseIndex] : null;

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-black overflow-hidden relative">
            
            {/* Warning Banner */}
            {warnings > 0 && (
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600 z-50 animate-pulse" title={`Warnings: ${warnings}/3`}></div>
            )}

            <PanelGroup direction="horizontal">
                
                <Panel defaultSize={35} minSize={20}>
                    <div className="bg-darker h-full overflow-y-auto custom-scrollbar p-6 border-r border-gray-800">
                        
                        <div className="mb-4">
                            {parentCourseId ? (
                                <Link 
                                    to={`/course/${parentCourseId}`} 
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={16} className="mr-1" /> Back to Assignment List
                                </Link>
                            ) : (
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="inline-flex items-center text-sm text-gray-500 hover:text-white transition-colors"
                                >
                                    <ArrowLeft size={16} className="mr-1" /> Back
                                </button>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">{question.quesid}. {question.question}</h1>
                        <span className={clsx("px-2 py-1 rounded text-xs font-bold", 
                            question.category === 'Easy' ? 'bg-green-900 text-green-300' : 
                            question.category === 'Hard' ? 'bg-red-900 text-red-300' : 
                            'bg-yellow-900 text-yellow-300'
                        )}>{question.category}</span>
                        
                        {/* Description Handling (If description exists separately from title) */}
                        {question.description && (
                            <div className="mt-4 text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                                {question.description}
                            </div>
                        )}

                        <div className="mt-6 space-y-6">
                            {question.parsedTestCases?.examples?.map((ex, idx) => (
                                <div key={idx}>
                                    <h3 className="text-gray-400 font-bold mb-2 text-sm">Example {idx + 1}:</h3>
                                    <div className="bg-black/50 p-4 rounded border border-gray-800 font-mono text-sm space-y-2">
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase mb-1">Input:</span>
                                            <span className="text-gray-300 whitespace-pre-wrap block">{ex.input}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase mb-1">Output:</span>
                                            <span className="text-gray-300 whitespace-pre-wrap block">{ex.expected_output}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-gray-800 hover:bg-accent cursor-col-resize" />

                <Panel minSize={30}>
                    <PanelGroup direction="vertical">
                        
                        <Panel defaultSize={60} minSize={20}>
                            <div className="flex flex-col h-full bg-[#1e1e1e]">
                                <div className="h-12 bg-darker border-b border-gray-800 flex items-center justify-between px-4 shrink-0">
                                    
                                    <select 
                                        value={language} 
                                        onChange={handleLanguageChange} 
                                        className="bg-black text-gray-300 border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-accent"
                                    >
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
                                    <Editor height="100%" theme="vs-dark" language={language} value={code} onChange={setCode} options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, padding: { top: 16 } }} />
                                </div>
                            </div>
                        </Panel>

                        <PanelResizeHandle className="h-1 bg-gray-800 hover:bg-accent cursor-row-resize" />

                        <Panel defaultSize={40} minSize={10}>
                            <div className="h-full bg-darker flex flex-col">
                                <div className="flex border-b border-gray-800 shrink-0">
                                    <button onClick={() => setActiveTab('testcase')} className={clsx("px-4 py-2 text-sm font-medium flex gap-2 items-center", activeTab === 'testcase' ? "text-white border-b-2 border-accent bg-gray-800/50" : "text-gray-500 hover:text-gray-300")}><Terminal size={14}/> Testcase</button>
                                    <button onClick={() => setActiveTab('result')} className={clsx("px-4 py-2 text-sm font-medium flex gap-2 items-center", activeTab === 'result' ? "text-white border-b-2 border-accent bg-gray-800/50" : "text-gray-500 hover:text-gray-300")}><CheckCircle size={14}/> Test Result</button>
                                </div>

                                <div className="p-4 overflow-auto font-mono text-sm flex-1 custom-scrollbar">
                                    
                                    {activeTab === 'testcase' && (
                                        <div className="flex gap-2">
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

                                    {activeTab === 'result' && (
                                        <div className="h-full">
                                            {isRunning && <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2"><Loader2 className="animate-spin text-accent" size={24} /><span>Running Code...</span></div>}
                                            
                                            {!isRunning && runResults && (
                                                <div className="w-full">
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
                                                                <div>
                                                                    <span className="text-gray-500 text-xs block mb-1">Input</span>
                                                                    <div className="bg-darker p-2 rounded text-gray-300 font-mono text-xs whitespace-pre-wrap">
                                                                        {currentRunResult?.input}
                                                                    </div>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div>
                                                                        <span className="text-gray-500 text-xs block mb-1">Your Output</span>
                                                                        <div className="bg-darker p-2 rounded text-white font-mono text-xs whitespace-pre-wrap">
                                                                            {currentRunResult?.user_output}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-gray-500 text-xs block mb-1">Expected</span>
                                                                        <div className="bg-darker p-2 rounded text-white font-mono text-xs whitespace-pre-wrap">
                                                                            {currentRunResult?.expected_output}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {!isRunning && submitResult && (
                                                <div className="flex flex-col h-full">
                                                    {submitResult.status === "Accepted" ? (
                                                        <div className="flex flex-col items-center justify-center h-full">
                                                            <CheckCircle size={64} className="text-green-500 mb-4" />
                                                            <h2 className="text-3xl font-bold text-green-500 mb-2">Accepted</h2>
                                                            <p className="text-gray-400 text-lg">All {submitResult.total_cases} test cases passed!</p>
                                                            {submitResult.score_earned !== undefined && (
                                                                <div className="mt-2 text-accent font-bold border border-accent/50 px-3 py-1 rounded bg-accent/10">
                                                                    + {submitResult.score_earned} Points Added
                                                                </div>
                                                            )}
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

            {question && (
                <AiTutor 
                    problemDescription={question.description || question.question} 
                    userCode={code} 
                    testResults={runResults || (submitResult?.failed_case ? [submitResult.failed_case] : null)} 
                />
            )}
        </div>
    );
};

export default Problem;