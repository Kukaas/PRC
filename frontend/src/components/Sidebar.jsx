import React from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Home,
  Users,
  Activity,
  Bell,
  LogOut, 
  Settings,
  Heart,
  Shield,
  Droplets,
  BookOpen
} from 'lucide-react';
import { Button } from './ui/button';
import logo from '../assets/logo.png';

const Sidebar = ({ isMobile = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get user ID - handle both id and _id properties
  const userId = user?.id || user?._id || '';

  const navigationLinks = [
    {
      href: `/profile/${userId}`,
      label: "My Information",
      icon: User,
      active: location.pathname.includes('/profile/')
    },
    {
      href: `/activities/${userId}`,
      label: "Activities",
      icon: Activity,
      active: location.pathname.includes('/activities/')
    },
    {
      href: `/members/${userId}`,
      label: "Members Status",
      icon: Users,
      active: location.pathname.includes('/members/')
    },
    {
      href: `/notifications/${userId}`,
      label: "Notifications",
      icon: Bell,
      active: location.pathname.includes('/notifications/')
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavigation = (href) => {
    navigate(href);
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className={`bg-white shadow-lg ${isMobile ? 'w-full' : 'w-64'} h-full flex flex-col`}>
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Philippine Red Cross Logo"
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Red Cross</h1>
            <p className="text-xs text-gray-500">Volunteer Portal</p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.givenName} {user?.familyName}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || 'Volunteer'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-2">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => handleNavigation(link.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                link.active
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${link.active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium">{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          onClick={() => handleNavigation(`/settings/${userId}`)}
          className="w-full justify-start text-gray-700 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="w-5 h-5 mr-3 text-gray-400" />
          Settings
        </Button>

        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
