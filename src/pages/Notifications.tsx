import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, AlertCircle, Info, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Appointment', message: 'Patient Aarav Sharma booked an appointment for tomorrow.', time: '2 mins ago', type: 'info', read: false },
    { id: 2, title: 'Payment Received', message: 'Invoice #INV-204 has been paid via Khalti.', time: '1 hour ago', type: 'success', read: false },
    { id: 3, title: 'Low Stock Alert', message: 'Surgical Gloves are running low in inventory.', time: '3 hours ago', type: 'warning', read: true },
    { id: 4, title: 'System Update', message: 'Dr. Sathi HomeCare will undergo maintenance at 2 AM.', time: '5 hours ago', type: 'error', read: true },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('Notification deleted');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-rose-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Notifications</h1>
          <p className="text-gray-500">Stay updated with the latest activities.</p>
        </div>
        <button 
          onClick={markAllAsRead}
          className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
        >
          <Check className="w-4 h-4" />
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Bell className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No notifications</h3>
            <p className="text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`p-5 rounded-3xl border transition-all flex items-start gap-4 group ${
                notif.read ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50/50 border-blue-100 shadow-sm'
              }`}
            >
              <div className="mt-1">{getIcon(notif.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className={`text-sm font-bold ${notif.read ? 'text-gray-900' : 'text-blue-900'}`}>{notif.title}</h3>
                  <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{notif.message}</p>
              </div>
              <button 
                onClick={() => deleteNotification(notif.id)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const XCircle: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

export default Notifications;
