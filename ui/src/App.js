import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailsPage from './pages/GroupDetailsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateGroupPage />} />
        {/* The :slug parameter will capture the group's unique ID */}
        <Route path="/group/:slug" element={<GroupDetailsPage />} />
        {/* Optional: Redirect any unknown paths to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;