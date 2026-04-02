import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Save, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    bio: profile?.bio || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password updated successfully');
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                    {profile?.photoURL ? (
                      <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10" />
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-gray-900">{profile?.name}</h3>
                  <p className="text-sm text-gray-500 uppercase tracking-wider font-bold">{profile?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Email Address</label>
                    <input 
                      type="email" 
                      disabled
                      value={formData.email}
                      className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bio</label>
                  <textarea 
                    rows={4}
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                <p className="text-sm text-gray-500">Update your password and secure your account.</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Current Password</label>
                  <input 
                    type="password" 
                    value={formData.currentPassword}
                    onChange={e => setFormData({...formData, currentPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500">Choose how you want to be notified.</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'email_notif', label: 'Email Notifications', desc: 'Receive updates via email' },
                  { id: 'sms_notif', label: 'SMS Notifications', desc: 'Receive alerts on your phone' },
                  { id: 'push_notif', label: 'Push Notifications', desc: 'Receive alerts in your browser' },
                  { id: 'app_notif', label: 'Appointment Reminders', desc: 'Get notified about upcoming appointments' },
                ].map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="p-8 space-y-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-gray-900">Privacy & Data</h3>
                <p className="text-sm text-gray-500">Manage your data and privacy settings.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Public Profile</p>
                    <p className="text-xs text-gray-500">Allow others to see your professional profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="p-6 border border-rose-100 bg-rose-50 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">Delete Account</h4>
                    <p className="text-xs text-rose-600 mt-1">Once you delete your account, there is no going back. Please be certain.</p>
                  </div>
                  <button className="px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-100">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
