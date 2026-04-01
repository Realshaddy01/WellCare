import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserRound, 
  Stethoscope, 
  Settings, 
  LogOut, 
  FileText, 
  CreditCard, 
  Bell, 
  Package, 
  FlaskConical, 
  Pill, 
  ChevronRight, 
  Activity, 
  Home, 
  Menu, 
  X 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { cn } from '../lib/utils';

const Sidebar: React.FC<{ isOpen: boolean; toggle: () => void }> = ({ isOpen, toggle }) => {
  const { profile, isAdmin, isDoctor, isPatient, isReceptionist, isClinicAdmin } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
    { name: 'Clinics', icon: Home, path: '/clinics', roles: ['super_admin'] },
    { name: 'Doctors', icon: Stethoscope, path: '/doctors', roles: ['super_admin', 'clinic_admin', 'patient'] },
    { name: 'Patients', icon: UserRound, path: '/patients', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist'] },
    { name: 'Appointments', icon: Calendar, path: '/appointments', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
    { name: 'EMR / Records', icon: FileText, path: '/records', roles: ['super_admin', 'clinic_admin', 'doctor', 'patient'] },
    { name: 'Billing', icon: CreditCard, path: '/billing', roles: ['super_admin', 'clinic_admin', 'receptionist', 'patient'] },
    { name: 'Inventory', icon: Package, path: '/inventory', roles: ['super_admin', 'clinic_admin'] },
    { name: 'Lab Tests', icon: FlaskConical, path: '/lab', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
    { name: 'Pharmacy', icon: Pill, path: '/pharmacy', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
    { name: 'Notifications', icon: Bell, path: '/notifications', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['super_admin', 'clinic_admin', 'doctor', 'receptionist', 'patient'] },
  ];

  const filteredItems = menuItems.filter(item => profile && item.roles.includes(profile.role));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={toggle}
        />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-50 transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-0 lg:w-20 overflow-hidden"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-bottom border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="text-white w-5 h-5" />
              </div>
              {isOpen && <span className="font-bold text-xl text-gray-900 tracking-tight">WellCare</span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
            {filteredItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  "group-hover:scale-110 transition-transform duration-200"
                )} />
                {isOpen && <span className="font-medium text-sm">{item.name}</span>}
                {isOpen && <ChevronRight className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />}
              </NavLink>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors group"
              )}
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              {isOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
