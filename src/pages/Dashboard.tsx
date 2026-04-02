import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
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
  UserRound,
  Package,
  FlaskConical,
  ChevronRight,
  MoreVertical
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
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, parseISO, isSameDay } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<any>(null);
  const [bookingStatus, setBookingStatus] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [topDoctors, setTopDoctors] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cid = profile?.clinicId || 'default-clinic';
        const [insightsRes, statusRes, appRes, docRes, payRes] = await Promise.all([
          api.get(`/api/dashboard/insights/${cid}`),
          api.get(`/api/dashboard/booking-status/${cid}`),
          api.get('/api/demo/appointments'),
          api.get('/api/demo/doctors'),
          api.get('/api/demo/payments')
        ]);

        setInsights(insightsRes.data);
        setBookingStatus(statusRes.data.map((item: any) => ({ name: item.status, value: item.count })));
        setUpcomingAppointments(appRes.data.slice(0, 4));
        setTopDoctors(docRes.data.slice(0, 3));
        setPaymentHistory(payRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      fetchData();
    }
  }, [profile]);

  const renderInsights = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <InsightCard label="Total Appointments" value={insights?.total_appointments || 0} icon={Calendar} color="text-blue-600" bg="bg-blue-50" />
      <InsightCard label="Total Patients" value={insights?.total_patients || 0} icon={Users} color="text-purple-600" bg="bg-purple-50" />
      <InsightCard label="Total Doctors" value={insights?.total_doctors || 0} icon={Stethoscope} color="text-emerald-600" bg="bg-emerald-50" />
      <InsightCard label="Total Services" value={insights?.total_services || 0} icon={Package} color="text-amber-600" bg="bg-amber-50" />
      <InsightCard label="Active Services" value={insights?.active_services || 0} icon={Activity} color="text-rose-600" bg="bg-rose-50" />
      <InsightCard label="Total Revenue" value={`रू ${insights?.total_revenue?.toLocaleString() || 0}`} icon={CreditCard} color="text-indigo-600" bg="bg-indigo-50" />
    </div>
  );

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">Insights</h1>
          <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Select Date Range</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">Apply Filter</button>
        </div>
      </div>

      {renderInsights()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Upcoming Appointments</h3>
            <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="p-5 space-y-4">
            {upcomingAppointments.map((app, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                    {app.patient_name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.patient_name}</p>
                    <p className="text-xs text-gray-500">{app.type} • {app.doctor_name}</p>
                  </div>
                </div>
                <p className="text-xs font-medium text-gray-400">{app.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Top Doctors</h3>
            <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
          </div>
          <div className="p-5 space-y-4">
            {topDoctors.map((doc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                    {doc.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialty}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-gray-400">4 Appointments</p>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50">
            <h3 className="font-bold text-gray-900">Booking Status</h3>
          </div>
          <div className="p-5 h-[250px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatus.length > 0 ? bookingStatus : [{name: 'No Data', value: 1}]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {bookingStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Payment History</h3>
          <button className="text-xs text-blue-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Patient</th>
                <th className="px-6 py-3">Date And Time</th>
                <th className="px-6 py-3">Doctor</th>
                <th className="px-6 py-3">Clinic</th>
                <th className="px-6 py-3">Services</th>
                <th className="px-6 py-3">Charges</th>
                <th className="px-6 py-3">Payment Mode</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paymentHistory.map((pay, i) => (
                <tr key={i} className="text-sm hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-[10px]">
                        {pay.patient_id[0]}
                      </div>
                      <span className="font-bold text-gray-900">Patient {pay.patient_id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{pay.created_at}</td>
                  <td className="px-6 py-4 text-gray-500">Dr. Jeffrey Williams</td>
                  <td className="px-6 py-4 text-gray-500">Main Center</td>
                  <td className="px-6 py-4 text-gray-500">General Consultation</td>
                  <td className="px-6 py-4 font-bold text-gray-900">रू {pay.amount}</td>
                  <td className="px-6 py-4 text-gray-500">{pay.payment_method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${pay.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCalendarDashboard = (title: string) => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Home &gt; Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option>Select Date Range</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">Apply Filter</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <InsightCard label="Total Appointments" value={insights?.total_appointments || 0} icon={Calendar} color="text-blue-600" bg="bg-blue-50" />
        <InsightCard label="Total Patients" value={insights?.total_patients || 0} icon={Users} color="text-purple-600" bg="bg-purple-50" />
        <InsightCard label="Active Services" value={insights?.active_services || 0} icon={Activity} color="text-rose-600" bg="bg-rose-50" />
        <InsightCard label="Today's Appointments" value="0" icon={Clock} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Appointment Calendar</h3>
          <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
        <div className="p-5">
          {/* Mock Calendar Grid */}
          <div className="grid grid-cols-7 border-t border-l border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-3 text-center text-xs font-bold text-gray-400 border-r border-b border-gray-100 bg-gray-50 uppercase tracking-wider">
                {day}
              </div>
            ))}
            {Array.from({length: 31}).map((_, i) => (
              <div key={i} className="min-h-[100px] p-2 border-r border-b border-gray-100 text-xs text-gray-400 relative">
                {i + 1}
                {i === 15 && (
                  <div className="absolute bottom-2 left-2 right-2 bg-emerald-500 text-white p-1 rounded text-[8px] font-bold truncate">
                    Dr. Jeffrey Williams - Patient Aarav Sharma
                  </div>
                )}
                {i === 20 && (
                  <div className="absolute bottom-2 left-2 right-2 bg-blue-500 text-white p-1 rounded text-[8px] font-bold truncate">
                    Dr. Sarah Smith - Patient Priya Thapa
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const getDashboard = () => {
    if (loading) return <div className="flex items-center justify-center h-[60vh]"><Activity className="w-10 h-10 text-blue-600 animate-spin" /></div>;

    switch (profile?.role) {
      case 'super_admin': return renderSuperAdminDashboard();
      case 'clinic_admin': return renderSuperAdminDashboard();
      case 'doctor': return renderCalendarDashboard("Doctor's Dashboard");
      case 'patient': return renderCalendarDashboard("Patient's Dashboard");
      case 'receptionist': return renderCalendarDashboard("Receptionist's Dashboard");
      default: return renderSuperAdminDashboard();
    }
  };

  return getDashboard();
};

const InsightCard: React.FC<{ label: string; value: string | number; icon: any; color: string; bg: string }> = ({ label, value, icon: Icon, color, bg }) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center gap-3">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center`}>
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-gray-900">{value}</h3>
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">{label}</p>
    </div>
  </div>
);

const Filter: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
  </svg>
);

export default Dashboard;
