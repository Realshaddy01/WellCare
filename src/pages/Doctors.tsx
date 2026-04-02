import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Stethoscope, Star, MapPin, DollarSign, X, Trash2, Edit2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    fees: '',
    rating: 4.5,
    clinic_id: 'default-clinic'
  });

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/demo/doctors');
      setDoctors(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        // Update logic (not fully implemented in backend yet, but following pattern)
        await api.post('/api/demo/doctors', { ...formData, id: editingDoctor.id });
        toast.success('Doctor updated successfully');
      } else {
        await api.post('/api/demo/doctors', formData);
        toast.success('Doctor added successfully');
      }
      setShowModal(false);
      setEditingDoctor(null);
      setFormData({ name: '', specialty: '', fees: '', rating: 4.5, clinic_id: 'default-clinic' });
      fetchDoctors();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save doctor');
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoctor(doc);
    setFormData({
      name: doc.name || '',
      specialty: doc.specialty || '',
      fees: doc.fees?.toString() || '',
      rating: doc.rating || 4.5,
      clinic_id: doc.clinic_id || 'default-clinic'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    try {
      // Delete logic (not fully implemented in backend yet, but following pattern)
      // For now, we'll just toast and re-fetch if backend supported it
      toast.info('Delete functionality is being configured');
    } catch (err) {
      toast.error('Failed to delete doctor');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Doctors Directory</h1>
          <p className="text-gray-500">Manage healthcare professionals and their specialties.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingDoctor(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
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
              placeholder="Search by name, specialty, or HomeCare center..." 
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
            {(Array.isArray(doctors) ? doctors : []).map((doc) => (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-8 h-8" />
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg text-amber-600 text-xs font-bold">
                    <Star className="w-3 h-3 fill-current" />
                    {Number(doc.rating || 0).toFixed(1)}
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
                  <button 
                    onClick={() => handleEdit(doc)}
                    className="flex-1 py-2 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Profile
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-2 border border-gray-100 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specialty</label>
                <input 
                  required
                  type="text" 
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Consultation Fee (रू)</label>
                <input 
                  required
                  type="number" 
                  value={formData.fees}
                  onChange={(e) => setFormData({...formData, fees: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  {editingDoctor ? 'Update' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
