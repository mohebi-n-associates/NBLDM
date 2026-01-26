import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const Sections = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"];

export default function StudentView() {
    const [values, setValues] = useState([20, 20, 20, 20, 20]); // Initial balanced state
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hasSubmitted = localStorage.getItem('allocation_submitted');
        if (hasSubmitted) {
            setSubmitted(true);
        }
    }, []);

    const total = values.reduce((a, b) => a + b, 0);

    const handleChange = (index, newValue) => {
        // Update state directly without locking
        const newValues = [...values];
        newValues[index] = newValue;
        setValues(newValues);
    };

    const handleSubmit = async () => {
        if (total === 0) {
            alert("Please allocate at least some points.");
            return;
        }
        setLoading(true);

        try {
            console.log("Starting submission...");
            // Normalize values to sum to ~100
            const normalizedValues = values.map(v => parseFloat(((v / total) * 100).toFixed(1)));
            const normalizedTotal = normalizedValues.reduce((a, b) => a + b, 0);

            // Use a fixed session ID for now
            const sessionId = 'class_01';

            // Create a timeout promise that rejects after 10 seconds
            const timeout = new Promise((_, reject) => {
                setTimeout(() => reject(new Error("Request timed out check your internet connection")), 10000);
            });

            // Race the network request against the timeout
            await Promise.race([
                addDoc(collection(db, 'sessions', sessionId, 'allocations'), {
                    values: normalizedValues,
                    total: normalizedTotal, // Should be ~100
                    originalTotal: total, // Keep track of what they actually entered
                    createdAt: serverTimestamp()
                }),
                timeout
            ]);

            console.log("Submission successful!");
            localStorage.setItem('allocation_submitted', 'true');
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting document: ", error);
            alert(`Failed to submit: ${error.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <h2 className="text-2xl font-bold text-green-600 mb-4">Submission Received!</h2>
                    <p className="text-gray-600">Thank you for participating.</p>
                    <div className="mt-6">
                        <p className="text-sm text-gray-500">Your allocation (normalized):</p>
                        <div className="mt-2 space-y-2">
                            {Sections.map((label, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                    <span>{label}</span>
                                    <span className="font-medium">{parseFloat(((values[i] / total) * 100).toFixed(1))}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <a href="#/results" className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                            View Class Results →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6">
                <header className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Class Allocation</h1>
                    <p className="text-sm text-gray-500">Distribute points in proportion.</p>
                </header>

                <div className="space-y-6">
                    {Sections.map((label, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                <span className={`text-sm font-bold text-blue-600`}>
                                    {values[index]}
                                    <span className="text-gray-300 font-normal ml-1">
                                        ({total > 0 ? ((values[index] / total) * 100).toFixed(0) : 0}%)
                                    </span>
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={values[index]}
                                onChange={(e) => handleChange(index, parseInt(e.target.value) || 0)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600">Total Points:</span>
                        <span className="text-xl font-bold text-blue-600">
                            {total}
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={total === 0 || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all
              ${total > 0 && !loading
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Submitting...' : 'Submit Allocation'}
                    </button>

                    <div className="mt-4 text-center">
                        <a href="#/results" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">
                            Skip to Results
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
