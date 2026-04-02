import React, { useState } from 'react';
import { Search, Plus, Filter, CreditCard, Download, ExternalLink, CheckCircle2, Clock, AlertCircle, Wallet } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const Billing: React.FC = () => {
  const [isPaying, setIsPaying] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  const handleKhaltiPayment = async (invoice: any) => {
    setIsPaying(true);
    // In a real app, you'd trigger the Khalti SDK here.
    // For this demo, we'll simulate a successful payment and verify it on the server.
    try {
      toast.info('Simulating Khalti Payment...');
      // Simulate server-side verification
      const res = await api.post('/api/payments/verify/khalti', {
        token: 'fake-token-123',
        amount: 1000 // amount in paisa
      });
      toast.success('Payment verified successfully via Dr. Sathi HomeCare Hosting Server!');
    } catch (err) {
      toast.error('Payment verification failed on server.');
    } finally {
      setIsPaying(false);
    }
  };
  const invoices = [
    { id: 'INV-204', patient: 'Aarav Sharma', amount: 'रू 1,500', date: 'Mar 15, 2026', status: 'Paid', method: 'Khalti' },
    { id: 'INV-205', patient: 'Priya Thapa', amount: 'रू 2,200', date: 'Mar 20, 2026', status: 'Unpaid', method: '-' },
    { id: 'INV-206', patient: 'Suman Gurung', amount: 'रू 800', date: 'Mar 22, 2026', status: 'Partially Paid', method: 'Cash' },
    { id: 'INV-207', patient: 'Maya Rai', amount: 'रू 3,500', date: 'Mar 25, 2026', status: 'Paid', method: 'eSewa' },
  ];

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
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100">
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
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-blue-600">{inv.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{inv.patient}</td>
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
                    <div className="flex items-center gap-3">
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
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Download className="w-4 h-4" />
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

export default Billing;
