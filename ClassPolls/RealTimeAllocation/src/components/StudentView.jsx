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
        const currentVal = values[index];
        const diff = newValue - currentVal;

        // If increasing, check if we exceed 100
        if (diff > 0 && total + diff > 100) {
            // Cap the new value to what's remaining
            const maxAllowed = 100 - (total - currentVal);
            newValue = maxAllowed;
        }

        // Update state
        const newValues = [...values];
        newValues[index] = newValue;
        setValues(newValues);
    };

    const handleSubmit = async () => {
        if (total !== 100) return;
        setLoading(true);

        try {
            // Use a fixed session ID for now
            const sessionId = 'class_01';
            await addDoc(collection(db, 'sessions', sessionId, 'allocations'), {
                values: values,
                total: total,
                createdAt: serverTimestamp()
            });

            localStorage.setItem('allocation_submitted', 'true');
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting document: ", error);
            alert("Failed to submit. Please try again.");
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
                        <p className="text-sm text-gray-500">Your allocation:</p>
                        <div className="mt-2 space-y-2">
                            {Sections.map((label, i) => (
                                <div key={i} className="flex justify-between text-xs">
                                    <span>{label}</span>
                                    <span className="font-medium">{values[i]}%</span>
                                </div>
                            ))}
                        </div>
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
                    <p className="text-sm text-gray-500">Distribute 100 points across the sections.</p>
                </header>

                <div className="space-y-6">
                    {Sections.map((label, index) => (
                        <div key={index} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">{label}</label>
                                <span className="text-sm font-bold text-blue-600">{values[index]}</span>
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
                        <span className="text-gray-600">Total Allocated:</span>
                        <span className={`text-xl font-bold ${total === 100 ? 'text-green-600' : total > 100 ? 'text-red-600' : 'text-blue-600'}`}>
                            {total} / 100
                        </span>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={total !== 100 || loading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all
              ${total === 100 && !loading
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Submitting...' : 'Submit Allocation'}
                    </button>
                </div>
            </div>
        </div>
    );
}
