import React from 'react';
import { Bell, Search, Menu, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header: React.FC<{ toggleSidebar: () => void }> = ({ toggleSidebar }) => {
  const { profile } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex items-center h-16 px-6 bg-white border-b border-gray-200">
      {/* Sidebar Toggle (Mobile) */}
      <button 
        onClick={toggleSidebar}
        className="p-2 mr-4 text-gray-500 rounded-lg hover:bg-gray-100 lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md hidden md:block">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input 
          type="text" 
          className="block w-full pl-10 pr-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:ring-blue-500 focus:border-blue-500 transition-all" 
          placeholder="Search patients, doctors, appointments..." 
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notifications */}
        <button className="relative p-2 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 cursor-pointer group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-semibold text-gray-900">{profile?.displayName || 'User'}</span>
            <span className="text-xs text-gray-500 capitalize">{profile?.role?.replace('_', ' ') || 'Role'}</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-500 transition-all">
            {profile?.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;
