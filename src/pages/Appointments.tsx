import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Search, Filter, ChevronLeft, ChevronRight, Video, MapPin, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const Appointments: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const appointments = [
    { id: '1', patient: 'Aarav Sharma', doctor: 'Dr. Jeffrey Williams', time: '10:30 AM', date: new Date(), type: 'video', status: 'confirmed' },
    { id: '2', patient: 'Priya Thapa', doctor: 'Dr. Sarah Smith', time: '11:15 AM', date: new Date(), type: 'in-person', status: 'pending' },
    { id: '3', patient: 'Suman Gurung', doctor: 'Dr. Mike Ross', time: '01:00 PM', date: new Date(), type: 'video', status: 'confirmed' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-gray-500">Schedule and manage patient consultations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView(view === 'calendar' ? 'list' : 'calendar')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            {view === 'calendar' ? 'List View' : 'Calendar View'}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" />
            Book Appointment
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900">{format(currentDate, 'MMMM yyyy')}</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Today
              </button>
              <button 
                onClick={() => addMonths(currentDate, 1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayAppointments = appointments.filter(app => isSameDay(app.date, day));
              return (
                <div 
                  key={i} 
                  className={`min-h-[120px] p-2 border-r border-b border-gray-50 transition-colors hover:bg-gray-50/50 cursor-pointer ${
                    !isSameMonth(day, monthStart) ? 'bg-gray-50/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-sm font-medium ${
                      isSameDay(day, new Date()) 
                        ? 'w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center' 
                        : isSameMonth(day, monthStart) ? 'text-gray-900' : 'text-gray-300'
                    }`}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.map((app) => (
                      <div 
                        key={app.id} 
                        className={`text-[10px] p-1.5 rounded-lg border truncate ${
                          app.type === 'video' 
                            ? 'bg-blue-50 border-blue-100 text-blue-700' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        }`}
                      >
                        <span className="font-bold">{app.time}</span> {app.patient}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search appointments..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Doctor</th>
                  <th className="px-6 py-4">Date & Time</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {app.patient[0]}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{app.patient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{app.doctor}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{format(app.date, 'MMM d, yyyy')}</span>
                        <span className="text-xs text-gray-500">{app.time}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        {app.type === 'video' ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                        <span className="capitalize">{app.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                        app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 text-sm font-bold hover:underline">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
