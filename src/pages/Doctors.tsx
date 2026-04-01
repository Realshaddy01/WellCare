import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Stethoscope, Star, MapPin, DollarSign } from 'lucide-react';
import axios from 'axios';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/demo/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Doctors Directory</h1>
          <p className="text-gray-500">Manage healthcare professionals and their specialties.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
            <Plus className="w-4 h-4" />
            Add New Doctor
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, specialty, or clinic..." 
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

        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {doctors.map((doc) => (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {doc.rating.toFixed(1)}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">{doc.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-4">{doc.specialty}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Main Clinic, Kathmandu</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Consultation Fee: रू {doc.fees}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all">
                    View Profile
                  </button>
                  <button className="px-3 py-2 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Doctors;
