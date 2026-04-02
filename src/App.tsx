import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Records from './pages/Records';

// Placeholder for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center text-gray-400 mb-6">
      <Activity className="w-10 h-10" />
    </div>
    <h2 className="text-2xl font-bold text-gray-900">{title} Page</h2>
    <p className="text-gray-500 mt-2">This feature is coming soon to Dr. Sathi HomeCare.</p>
  </div>
);

import { Activity } from 'lucide-react';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clinics" element={<Placeholder title="Clinics" />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="patients" element={<Patients />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="records" element={<Records />} />
            <Route path="billing" element={<Billing />} />
            <Route path="inventory" element={<Placeholder title="Inventory" />} />
            <Route path="lab" element={<Placeholder title="Lab Tests" />} />
            <Route path="pharmacy" element={<Placeholder title="Pharmacy" />} />
            <Route path="notifications" element={<Placeholder title="Notifications" />} />
            <Route path="settings" element={<Placeholder title="Settings" />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
