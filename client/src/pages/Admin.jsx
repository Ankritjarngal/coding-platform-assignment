import { useState } from 'react';
import API from '../api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, Eye, EyeOff, Sparkles, Loader2 } from 'lucide-react';

/**
 * Helper Component to render a list of test case inputs
 */
const TestCaseList = ({ title, cases, setCases, limit = null, icon: Icon }) => {
    const addRow = () => {
        if (limit && cases.length >= limit) return toast.error(`Max ${limit} cases allowed here.`);
        setCases([...cases, { input: '', expected_output: '' }]);
    };

    const updateRow = (index, field, value) => {
        const newCases = [...cases];
        newCases[index][field] = value;
        setCases(newCases);
    };

    const removeRow = (index) => {
        setCases(cases.filter((_, i) => i !== index));
    };

    return (
        <div className="bg-black/30 p-4 rounded-lg border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-gray-300 font-bold flex items-center gap-2">
                    <Icon size={18} /> {title} <span className="text-xs text-gray-500">({cases.length})</span>
                </h3>
                <button 
                    onClick={addRow} 
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-white flex gap-1 items-center transition"
                >
                    <Plus size={12}/> Add
                </button>
            </div>
            {cases.map((tc, i) => (
                <div key={i} className="flex gap-2 mb-2 items-start">
                    <textarea 
                        placeholder="Input (e.g. 5)" 
                        value={tc.input} 
                        onChange={(e) => updateRow(i, 'input', e.target.value)}
                        className="flex-1 bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono focus:border-accent outline-none custom-scrollbar" 
                        rows={1}
                    />
                    <textarea 
                        placeholder="Expected Output (e.g. 120)" 
                        value={tc.expected_output} 
                        onChange={(e) => updateRow(i, 'expected_output', e.target.value)}
                        className="flex-1 bg-darker border border-gray-700 rounded p-2 text-sm text-gray-300 font-mono focus:border-accent outline-none custom-scrollbar" 
                        rows={1}
                    />
                    <button 
                        onClick={() => removeRow(i)} 
                        className="p-2 text-red-400 hover:bg-red-900/20 rounded transition"
                        title="Remove Row"
                    >
                        <Trash2 size={16}/>
                    </button>
                </div>
            ))}
        </div>
    );
};

const Admin = () => {
    const [form, setForm] = useState({ question: '', category: '' });
    const [examples, setExamples] = useState([{ input: '', expected_output: '' }]);
    const [hidden, setHidden] = useState([{ input: '', expected_output: '' }]);
    const [isGenerating, setIsGenerating] = useState(false);

    // --- AI GENERATION LOGIC ---
    const handleGenerateAI = async () => {
        if (!form.question || form.question.length < 5) {
            return toast.error("Please write a detailed problem description first!");
        }

        setIsGenerating(true);
        const toastId = toast.loading("AI is generating test cases...");

        try {
            const { data } = await API.post('/Question/generate-testcases', {
                description: form.question,
                category: form.category,
                existingTestCases: [...examples, ...hidden]
            });

            // Update Examples (Run Cases) - Keep existing valid ones, append new
            setExamples(prev => {
                const validPrev = prev.filter(p => p.input.trim() !== "");
                // Limit to 3 examples
                const newSet = [...validPrev, ...data.examples].slice(0, 3); 
                return newSet.length > 0 ? newSet : [{ input: '', expected_output: '' }];
            });

            // Update Hidden (Submit Cases)
            setHidden(prev => {
                const validPrev = prev.filter(p => p.input.trim() !== "");
                return [...validPrev, ...data.hidden];
            });

            toast.success("Test cases generated!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("AI Generation failed. Check backend console.", { id: toastId });
        } finally {
            setIsGenerating(false);
        }
    };

    // --- SUBMIT TO DATABASE ---
    const handleSubmit = async () => {
        if (!form.question || !form.category) return toast.error("Fill Question Details");
        
        // Clean empty rows
        const cleanExamples = examples.filter(tc => tc.input.trim() !== "" || tc.expected_output.trim() !== "");
        const cleanHidden = hidden.filter(tc => tc.input.trim() !== "" || tc.expected_output.trim() !== "");

        if (cleanExamples.length === 0) return toast.error("Add at least 1 Example Case");

        try {
            const finalTestCases = { examples: cleanExamples, hidden: cleanHidden };
            
            await API.post('/Question/input', {
                ...form,
                testcases: JSON.stringify(finalTestCases)
            });
            
            toast.success("Question Created Successfully!");
            
            // Reset Form
            setForm({ question: '', category: '' });
            setExamples([{ input: '', expected_output: '' }]);
            setHidden([{ input: '', expected_output: '' }]);
        } catch (err) {
            toast.error("Failed to save question");
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6 text-white border-b border-gray-800 pb-4">
                Add New Problem
            </h1>
            
            <div className="bg-darker p-6 rounded-xl border border-gray-800 shadow-xl">
                
                {/* Top Section: Inputs + AI Button */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    
                    {/* Description (Taking up 2 columns) */}
                    <div className="md:col-span-2 flex flex-col">
                        <label className="text-gray-400 text-sm font-semibold mb-2 block">Problem Description</label>
                        <textarea 
                            value={form.question} 
                            onChange={(e) => setForm({...form, question: e.target.value})}
                            className="flex-1 w-full p-3 bg-black border border-gray-700 rounded text-white focus:border-accent outline-none min-h-[120px]" 
                            placeholder="e.g. Write a program that takes an integer N and prints the sum of 1 to N."
                        />
                    </div>

                    {/* Category & AI Button (Taking up 2 columns) */}
                    <div className="md:col-span-2 flex flex-col gap-4">
                        <div>
                            <label className="text-gray-400 text-sm font-semibold mb-2 block">Category</label>
                            <input 
                                value={form.category} 
                                onChange={(e) => setForm({...form, category: e.target.value})}
                                className="w-full p-3 bg-black border border-gray-700 rounded text-white focus:border-accent outline-none"
                                placeholder="e.g. Math, Arrays, DP"
                            />
                        </div>

                        {/* AI Button */}
                        <button 
                            onClick={handleGenerateAI}
                            disabled={isGenerating}
                            className="flex-1 w-full bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 text-purple-300 font-bold py-3 rounded flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {isGenerating ? (
                                <Loader2 className="animate-spin" size={20}/>
                            ) : (
                                <></>
                            )}
                            <span>{isGenerating ? "Generating..." : "Auto-Generate Test Cases"}</span>
                        </button>
                    </div>
                </div>

                <hr className="border-gray-800 mb-6" />

                {/* Test Cases Area */}
                <TestCaseList 
                    title="Run Cases (Visible Examples)" 
                    cases={examples} 
                    setCases={setExamples} 
                    limit={3} 
                    icon={Eye} 
                />
                
                <TestCaseList 
                    title="Submit Cases (Hidden Tests)" 
                    cases={hidden} 
                    setCases={setHidden} 
                    icon={EyeOff} 
                />

                {/* Publish Button */}
                <button 
                    onClick={handleSubmit} 
                    className="w-full mt-4 bg-accent hover:bg-blue-600 text-white font-bold py-4 rounded flex items-center justify-center gap-2 transition shadow-lg shadow-blue-900/20"
                >
                    <Save size={20} /> Publish Question
                </button>
            </div>
        </div>
    );
};

export default Admin;