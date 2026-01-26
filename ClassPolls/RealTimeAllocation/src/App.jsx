import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import StudentView from './components/StudentView';
import DashboardView from './components/DashboardView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StudentView />} />
        <Route path="/dashboard" element={<DashboardView />} />
        <Route path="/results" element={<DashboardView />} />
      </Routes>
    </Router>
  );
}

export default App;
