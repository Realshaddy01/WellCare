import React, { useEffect, useState } from 'react';
import { Search, Plus, Pill, X, Trash2, Edit2, ShoppingBag, CheckCircle2, Clock } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Pharmacy: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    medication: '',
    dosage: '',
    frequency: '',
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [presRes, patRes] = await Promise.all([
        api.get('/api/demo/prescriptions'),
        api.get('/api/demo/patients')
      ]);
      setPrescriptions(presRes.data);
      setPatients(patRes.data);
    } catch (err) {
      toast.error('Failed to fetch pharmacy data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patient_id);
    try {
      if (editingPrescription) {
        await api.post('/api/demo/prescriptions', { ...formData, id: editingPrescription.id, patient_name: patient?.name });
        toast.success('Prescription updated successfully');
      } else {
        await api.post('/api/demo/prescriptions', { ...formData, patient_name: patient?.name });
        toast.success('Prescription added successfully');
      }
      setShowModal(false);
      setEditingPrescription(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save prescription');
    }
  };

  const handleEdit = (pres: any) => {
    setEditingPrescription(pres);
    setFormData({
      patient_id: pres.patient_id?.toString() || '',
      medication: pres.medication,
      dosage: pres.dosage || '',
      frequency: pres.frequency || '',
      status: pres.status || 'Pending',
      date: pres.date || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      toast.info('Delete functionality is being configured');
    } catch (err) {
      toast.error('Failed to delete prescription');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pharmacy</h1>
          <p className="text-gray-500">Manage prescriptions and medication dispensing.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingPrescription(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            New Prescription
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by medication or patient..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Medication</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Dosage / Frequency</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading pharmacy data...</td></tr>
              ) : (Array.isArray(prescriptions) && prescriptions.length === 0) ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No prescriptions found.</td></tr>
              ) : (Array.isArray(prescriptions) ? prescriptions : []).map((pres) => (
                <tr key={pres.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                        <Pill className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{pres.medication}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pres.patient_name}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-gray-900">{pres.dosage}</span>
                      <span className="text-xs text-gray-500">{pres.frequency}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{pres.date}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      pres.status === 'Dispensed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {pres.status === 'Dispensed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {pres.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(pres)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(pres.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingPrescription ? 'Edit Prescription' : 'New Prescription'}</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Patient</label>
                <select 
                  required
                  value={formData.patient_id}
                  onChange={e => setFormData({...formData, patient_id: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select patient</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Medication</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Paracetamol, Amoxicillin"
                  value={formData.medication}
                  onChange={e => setFormData({...formData, medication: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Dosage</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 500mg"
                    value={formData.dosage}
                    onChange={e => setFormData({...formData, dosage: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                  <input 
                    required
                    type="text" 
                    placeholder="e.g. 3 times a day"
                    value={formData.frequency}
                    onChange={e => setFormData({...formData, frequency: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                  <input 
                    required
                    type="date" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Pending</option>
                    <option>Dispensed</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  {editingPrescription ? 'Update' : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pharmacy;
