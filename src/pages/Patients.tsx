import React from 'react';
import { Search, Plus, Filter, MoreVertical, Download, UserRound } from 'lucide-react';

const Patients: React.FC = () => {
  const patients = [
    { id: '1', name: 'Aarav Sharma', email: 'aarav@example.com', phone: '9841234567', gender: 'Male', age: 28, lastVisit: 'Mar 15, 2026', status: 'Active' },
    { id: '2', name: 'Priya Thapa', email: 'priya@example.com', phone: '9801234567', gender: 'Female', age: 24, lastVisit: 'Mar 20, 2026', status: 'Active' },
    { id: '3', name: 'Suman Gurung', email: 'suman@example.com', phone: '9811234567', gender: 'Male', age: 35, lastVisit: 'Feb 10, 2026', status: 'Inactive' },
    { id: '4', name: 'Maya Rai', email: 'maya@example.com', phone: '9851234567', gender: 'Female', age: 31, lastVisit: 'Mar 25, 2026', status: 'Active' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Patients</h1>
          <p className="text-gray-500">Manage patient records and medical history.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" />
            Add Patient
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Patient Name</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Gender / Age</th>
                <th className="px-6 py-4">Last Visit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <UserRound className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-900">{patient.email}</span>
                      <span className="text-xs text-gray-500">{patient.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{patient.gender}, {patient.age}y</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{patient.lastVisit}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      patient.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 text-sm font-bold hover:underline">View Profile</button>
                      <button className="p-1 text-gray-400 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Patients;
