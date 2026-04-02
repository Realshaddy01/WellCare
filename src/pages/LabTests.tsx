import React, { useEffect, useState } from 'react';
import { Search, Plus, FlaskConical, X, Trash2, Edit2, FileText, CheckCircle2, Clock } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const LabTests: React.FC = () => {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    test_name: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    result: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testRes, patRes] = await Promise.all([
        api.get('/api/demo/lab-tests'),
        api.get('/api/demo/patients')
      ]);
      setTests(testRes.data);
      setPatients(patRes.data);
    } catch (err) {
      toast.error('Failed to fetch lab tests');
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
      if (editingTest) {
        await api.post('/api/demo/lab-tests', { ...formData, id: editingTest.id, patient_name: patient?.name });
        toast.success('Test updated successfully');
      } else {
        await api.post('/api/demo/lab-tests', { ...formData, patient_name: patient?.name });
        toast.success('Test added successfully');
      }
      setShowModal(false);
      setEditingTest(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save test');
    }
  };

  const handleEdit = (test: any) => {
    setEditingTest(test);
    setFormData({
      patient_id: test.patient_id?.toString() || '',
      test_name: test.test_name,
      date: test.date,
      status: test.status || 'Pending',
      result: test.result || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      toast.info('Delete functionality is being configured');
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lab Tests</h1>
          <p className="text-gray-500">Manage laboratory requests and results.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingTest(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            New Test Request
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by test or patient..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading tests...</td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No tests found.</td></tr>
              ) : tests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FlaskConical className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{test.test_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{test.patient_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{test.date}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      test.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {test.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {test.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-gray-500 italic">{test.result || 'Awaiting results...'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(test)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(test.id)}
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
              <h2 className="text-xl font-bold text-gray-900">{editingTest ? 'Edit Lab Test' : 'New Test Request'}</h2>
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
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Test Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Blood Count, Thyroid Profile"
                  value={formData.test_name}
                  onChange={e => setFormData({...formData, test_name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                    <option>Completed</option>
                  </select>
                </div>
              </div>
              {formData.status === 'Completed' && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Result Summary</label>
                  <textarea 
                    value={formData.result}
                    onChange={e => setFormData({...formData, result: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Enter test results or observations..."
                  />
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  {editingTest ? 'Update' : 'Save Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTests;
