import React, { useEffect, useState } from 'react';
import { Search, Plus, Filter, CreditCard, Download, ExternalLink, CheckCircle2, Clock, AlertCircle, Wallet, X, Trash2, Edit2 } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patient_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Unpaid',
    method: '-'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, patRes] = await Promise.all([
        api.get('/api/demo/payments'), // Using payments as invoices for now
        api.get('/api/demo/patients')
      ]);
      setInvoices(invRes.data);
      setPatients(patRes.data);
    } catch (err) {
      toast.error('Failed to fetch billing data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleKhaltiPayment = async (invoice: any) => {
    setIsPaying(true);
    try {
      toast.info('Simulating Khalti Payment...');
      const res = await api.post('/api/payments/verify/khalti', {
        token: 'fake-token-123',
        amount: parseInt(String(invoice.amount).replace(/[^0-9]/g, '')) * 100
      });
      toast.success('Payment verified successfully via Dr. Sathi HomeCare Hosting Server!');
      fetchData();
    } catch (err) {
      toast.error('Payment verification failed on server.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patient_id);
    try {
      if (editingInvoice) {
        await api.post('/api/demo/payments', {
          ...formData,
          id: editingInvoice.id,
          patient_name: patient?.name || editingInvoice.patient_name
        });
        toast.success('Invoice updated successfully');
      } else {
        await api.post('/api/demo/payments', {
          ...formData,
          patient_name: patient?.name
        });
        toast.success('Invoice created successfully');
      }
      setShowModal(false);
      setEditingInvoice(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to save invoice');
    }
  };

  const handleEdit = (inv: any) => {
    setEditingInvoice(inv);
    setFormData({
      patient_id: inv.patient_id?.toString() || '',
      amount: inv.amount.replace(/[^0-9]/g, ''),
      date: inv.date,
      status: inv.status,
      method: inv.method
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      toast.info('Delete functionality is being configured');
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-600';
      case 'Unpaid': return 'bg-red-50 text-red-600';
      case 'Partially Paid': return 'bg-amber-50 text-amber-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CheckCircle2 className="w-3.5 h-3.5" />;
      case 'Unpaid': return <AlertCircle className="w-3.5 h-3.5" />;
      case 'Partially Paid': return <Clock className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-gray-500">Manage payments, invoices, and financial reports.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={() => { setEditingInvoice(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Outstanding', value: 'रू 12,450', color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Revenue (This Month)', value: 'रू 84,200', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Refunds', value: 'रू 2,100', color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <div key={i} className={`${stat.bg} p-6 rounded-2xl border border-white shadow-sm`}>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by invoice ID or patient..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Loading invoices...</td></tr>
              ) : (Array.isArray(invoices) && invoices.length === 0) ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">No invoices found.</td></tr>
              ) : (Array.isArray(invoices) ? invoices : []).map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-blue-600">{inv.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{inv.patient_name || inv.patient}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{inv.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{inv.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <CreditCard className="w-3.5 h-3.5" />
                      {inv.method}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 w-fit text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${getStatusStyle(inv.status)}`}>
                      {getStatusIcon(inv.status)}
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {inv.status === 'Unpaid' && (
                        <button 
                          onClick={() => handleKhaltiPayment(inv)}
                          disabled={isPaying}
                          className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white text-[10px] font-bold rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          <Wallet className="w-3 h-3" />
                          Pay Khalti
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(inv)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(inv.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
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
              <h2 className="text-xl font-bold text-gray-900">{editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h2>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (NPR)</label>
                  <input 
                    required
                    type="number" 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>Unpaid</option>
                    <option>Paid</option>
                    <option>Partially Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method</label>
                  <select 
                    value={formData.method}
                    onChange={e => setFormData({...formData, method: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option>-</option>
                    <option>Khalti</option>
                    <option>eSewa</option>
                    <option>Cash</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  {editingInvoice ? 'Update' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
