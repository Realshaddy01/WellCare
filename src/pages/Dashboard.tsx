import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Stethoscope,
  UserRound
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Mon', appointments: 12, revenue: 4500 },
  { name: 'Tue', appointments: 19, revenue: 5200 },
  { name: 'Wed', appointments: 15, revenue: 4800 },
  { name: 'Thu', appointments: 22, revenue: 6100 },
  { name: 'Fri', appointments: 30, revenue: 7500 },
  { name: 'Sat', appointments: 10, revenue: 3200 },
  { name: 'Sun', appointments: 5, revenue: 1500 },
];

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [serverStats, setServerStats] = useState<{ total_patients: number; total_revenue: number } | null>(null);

  useEffect(() => {
    if (profile?.clinicId) {
      axios.get(`/api/stats/${profile.clinicId}`)
        .then(res => setServerStats(res.data))
        .catch(err => console.error('Failed to fetch server stats', err));
    }
  }, [profile?.clinicId]);

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Analytics</h1>
        <p className="text-gray-500">Overview of all clinics and healthcare providers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Clinics" value="24" change="+2" icon={Activity} color="bg-blue-500" />
        <StatCard label="Total Doctors" value={serverStats?.total_doctors?.toString() || "168"} change="+12" icon={Stethoscope} color="bg-purple-500" />
        <StatCard label="Total Patients" value={serverStats?.total_patients?.toLocaleString() || "4,872"} change="+487" icon={UserRound} color="bg-emerald-500" />
        <StatCard label="Total Revenue" value={`रू ${serverStats?.total_revenue?.toLocaleString() || "1.2M"}`} change="+15%" icon={CreditCard} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Revenue by Month</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Appointments Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="appointments" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDoctorDashboard = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Doctor's Schedule</h1>
        <p className="text-gray-500">Manage your appointments and patient records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Today's Appointments" value="12" change="Next at 10:30 AM" icon={Calendar} color="bg-blue-500" />
        <StatCard label="Pending Consultations" value="4" change="High Priority" icon={Clock} color="bg-amber-500" />
        <StatCard label="Total Earnings" value="रू 12,400" change="+8% this week" icon={CreditCard} color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Appointments</h3>
            <button className="text-sm text-blue-600 font-semibold hover:underline">View Calendar</button>
          </div>
          <div className="space-y-4">
            {[
              { patient: 'Aarav Sharma', time: '10:30 AM', type: 'Follow-up', status: 'Confirmed' },
              { patient: 'Priya Thapa', time: '11:15 AM', type: 'New Consultation', status: 'Pending' },
              { patient: 'Suman Gurung', time: '01:00 PM', type: 'Video Call', status: 'Confirmed' },
              { patient: 'Maya Rai', time: '02:30 PM', type: 'Routine Checkup', status: 'Confirmed' },
            ].map((app, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {app.patient[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{app.patient}</p>
                    <p className="text-xs text-gray-500">{app.type} • {app.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {app.status}
                  </span>
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Patient Vitals</h3>
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Last Patient</p>
              <p className="text-sm font-bold text-gray-900">Aarav Sharma</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">BP</p>
                  <p className="text-sm font-bold text-gray-900">120/80</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Temp</p>
                  <p className="text-sm font-bold text-gray-900">98.6°F</p>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
              Start New Encounter
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatientDashboard = () => (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Health Portal</h1>
        <p className="text-gray-500">Welcome back, {profile?.displayName}. Your health is our priority.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-200">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Book Your Next Consultation</h2>
            <p className="text-blue-100 mb-6 max-w-md">Find the best specialists and book an appointment in just a few clicks.</p>
            <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg">
              Find a Doctor
            </button>
          </div>
          <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-blue-500 opacity-20" />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Upcoming</h3>
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-emerald-600 font-bold">Tomorrow</p>
                <p className="text-sm font-bold text-gray-900">Dr. Jeffrey Williams</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">General Consultation • 10:00 AM</p>
            <button className="w-full py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all">
              Join Video Call
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-8">Medical History</h3>
          <div className="space-y-4">
            {[
              { date: 'Mar 15, 2026', doctor: 'Dr. Sarah Smith', type: 'Blood Test', result: 'Normal' },
              { date: 'Feb 20, 2026', doctor: 'Dr. Jeffrey Williams', type: 'General Checkup', result: 'Completed' },
              { date: 'Jan 10, 2026', doctor: 'Dr. Mike Ross', type: 'X-Ray', result: 'View Report' },
            ].map((record, i) => (
              <div key={i} className="flex items-center justify-between p-4 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-bold text-gray-900">{record.type}</p>
                  <p className="text-xs text-gray-500">{record.doctor} • {record.date}</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:underline">{record.result}</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Invoices</h3>
          <div className="space-y-4">
            {[
              { id: 'INV-204', amount: 'रू 1,500', date: 'Mar 15', status: 'Paid' },
              { id: 'INV-198', amount: 'रू 2,200', date: 'Feb 20', status: 'Paid' },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{inv.id}</p>
                  <p className="text-xs text-gray-500">{inv.date}</p>
                </div>
                <p className="text-sm font-bold text-gray-900">{inv.amount}</p>
              </div>
            ))}
            <button className="w-full mt-4 py-3 border-2 border-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all">
              View All Billing
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDefaultDashboard = () => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-6">
        <Activity className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Welcome to WellCare</h2>
      <p className="text-gray-500 mt-2 max-w-md">Your role is being configured. Please contact your administrator if this takes too long.</p>
    </div>
  );

  const getDashboard = () => {
    switch (profile?.role) {
      case 'super_admin': return renderSuperAdminDashboard();
      case 'doctor': return renderDoctorDashboard();
      case 'patient': return renderPatientDashboard();
      case 'clinic_admin': return renderSuperAdminDashboard(); // Similar for now
      case 'receptionist': return renderDoctorDashboard(); // Similar for now
      default: return renderDefaultDashboard();
    }
  };

  return getDashboard();
};

const StatCard: React.FC<{ label: string; value: string; change: string; icon: any; color: string }> = ({ label, value, change, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4 group hover:shadow-md transition-all">
    <div className="flex items-center justify-between">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-white shadow-lg shadow-${color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'}`}>
        {change}
      </span>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
