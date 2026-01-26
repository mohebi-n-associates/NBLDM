import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Sections = ["Section 1", "Section 2", "Section 3", "Section 4", "Section 5"];

export default function DashboardView() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const loadData = () => {
        setLoading(true);
        setError(null);

        const q = query(collection(db, 'sessions', 'class_01', 'allocations'), orderBy('createdAt', 'desc'));

        // Timeout check
        const timeoutId = setTimeout(() => {
            setLoading((currentLoading) => {
                if (currentLoading) {
                    setError("Connection taking too long. Check your internet or firewall.");
                    return false;
                }
                return currentLoading;
            });
        }, 8000);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            clearTimeout(timeoutId);
            const submissions = snapshot.docs.map(doc => doc.data());
            setData(submissions);
            setLoading(false);
        }, (err) => {
            clearTimeout(timeoutId);
            console.error("Error fetching data:", err);
            setError(err.message);
            setLoading(false);
        });

        return () => {
            clearTimeout(timeoutId);
            unsubscribe();
        };
    };

    useEffect(() => {
        const cleanup = loadData();
        return cleanup;
    }, []);

    const generateHistogramData = (sectionIndex) => {
        const bins = new Array(10).fill(0);
        // Labels for 0-10, 11-20, ... 91-100
        const labels = ["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100"];

        data.forEach(sub => {
            if (sub.values && sub.values[sectionIndex] !== undefined) {
                const val = sub.values[sectionIndex];
                // 0-9 -> bin 0, 10-19 -> bin 1, ... 90-99 -> bin 9, 100 -> bin 9
                // Wait, 10 is bin 1. 0-9 is bin 0.
                // Math.floor((val - 1) / 10) ? No.
                // Let's stick to standard 0-9, 10-19? Or 1-10?
                // Sliders usually include 0.
                // Let's do 0-10, 11-20.
                // If val is 0 to 10. 
                // Bin 0: 0-10. Bin 1: 11-20.
                // Then index = floor((val - 1) / 10)? 
                // If val=0, -0.1 -> floor -> -1. Bad.

                // Let's just use 10 even bins based on simple division:
                // 0-9, 10-19 ... 90-99, 100.
                // 100 will arguably be in its own bin or merged with 90-99.
                // Let's merge 100 into the last bin.
                let binIndex = Math.floor(val / 10);
                if (binIndex >= 10) binIndex = 9; // Handle 100
                bins[binIndex]++;
            }
        });

        return {
            labels: ["0-9", "10-19", "20-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80-89", "90-100"],
            datasets: [
                {
                    label: 'Frequency',
                    data: bins,
                    backgroundColor: 'rgba(59, 130, 246, 0.6)', // Tailwind blue-500 with opacity
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                    precision: 0
                },
                title: {
                    display: true,
                    text: 'Students'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-xl text-gray-600 animate-pulse">Loading live results...</div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Issue</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10">
            <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Real-Time Allocation Results</h1>
                    <p className="text-gray-500">Live view of student submissions</p>
                </div>
                <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-blue-100 flex items-center">
                    <div className="mr-4 p-3 bg-blue-100 rounded-full text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Responses</div>
                        <div className="text-3xl font-bold text-gray-800">{data.length}</div>
                    </div>
                </div>
            </header>

            {data.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                    <p className="text-lg">Waiting for submissions...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {Sections.map((label, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-50 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex justify-between">
                                {label}
                                <span className="text-xs font-normal px-2 py-1 bg-gray-100 rounded text-gray-500">Avg: {Math.round(data.reduce((acc, curr) => acc + (curr.values[index] || 0), 0) / data.length)}%</span>
                            </h3>
                            <div className="h-64">
                                <Bar options={{ ...options, maintainAspectRatio: false }} data={generateHistogramData(index)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
