import React, { useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User,
  Users,
  Activity,
  Bell,
  LogOut,
  Settings,
  Camera,
  LayoutDashboard,
  BarChart3,
  Target,
  FileText,
  Calendar,
  Wrench,
} from 'lucide-react';
import { Button } from './ui/button';
import { api } from '../services/api';
import logo from '../assets/logo.png';
import { toast } from 'sonner';

const Sidebar = ({ isMobile = false, onClose }) => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Get user ID - handle both id and _id properties
  const userId = user?.id || user?._id || '';

  // Admin navigation links
  const adminNavigationLinks = [
    {
      href: `/admin/dashboard/${userId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
      active: location.pathname.includes('/admin/dashboard')
    },
    {
      href: `/admin/volunteers/${userId}`,
      label: "Volunteers",
      icon: Users,
      active: location.pathname.includes('/admin/volunteers')
    },
    {
      href: `/admin/activities/${userId}`,
      label: "Activities",
      icon: BarChart3,
      active: location.pathname.includes('/admin/activities')
    },
    {
      href: `/admin/calendar/${userId}`,
      label: "Calendar",
      icon: Calendar,
      active: location.pathname.includes('/admin/calendar')
    },
    {
      href: `/admin/members-status/${userId}`,
      label: "Members Status",
      icon: Target,
      active: location.pathname.includes('/admin/members-status')
    },
    {
      href: `/admin/reports/${userId}`,
      label: "Reports",
      icon: FileText,
      active: location.pathname.includes('/admin/reports')
    },
    {
      href: `/admin/leaders/${userId}`,
      label: "Leaders",
      icon: Users,
      active: location.pathname.includes('/admin/leaders')
    },
    {
      href: `/notifications/${userId}`,
      label: "Notifications",
      icon: Bell,
      active: location.pathname.includes('/notifications/')
    },
    {
      href: `/admin/settings/${userId}`,
      label: "Settings",
      icon: Settings,
      active: location.pathname.includes('/settings/')
    },
    {
      href: `/admin/maintenance/${userId}`,
      label: "Maintenance",
      icon: Wrench,
      active: location.pathname.includes('/admin/maintenance')
    },
  ];

  // Volunteer navigation links
  const volunteerNavigationLinks = [
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
      active: location.pathname === `/activities/${userId}`
    },
    {
      href: `/activities/history`,
      label: "Activity History",
      icon: FileText,
      active: location.pathname.includes('/activities/history')
    },
    {
      href: `/member-status/${userId}`,
      label: "Members Status",
      icon: Users,
      active: location.pathname.includes('/member-status/')
    },
    {
      href: `/notifications/${userId}`,
      label: "Notifications",
      icon: Bell,
      active: location.pathname.includes('/notifications/')
    },
    {
      href: `/settings/${userId}`,
      label: "Settings",
      icon: Settings,
      active: location.pathname.includes('/settings/')
    },
  ];

  // Choose navigation links based on user role
  const navigationLinks = user?.role === 'admin' ? adminNavigationLinks : volunteerNavigationLinks;

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (3MB)
    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB');
      return;
    }

    try {
      setIsUploading(true);
      const base64Photo = await convertToBase64(file);

      const result = await api.profile.updatePhoto({ photo: base64Photo });

      if (result.success) {
        // Update the user context with new photo
        if (updateUser) {
          updateUser({ ...user, photo: result.data.photo });
        }
        toast.success('Photo updated successfully!');
      } else {
        toast.error(result.message || 'Failed to update photo');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Failed to update photo. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const renderAvatar = () => {
    if (user?.photo) {
      return (
        <img
          src={user.photo}
          alt={`${user?.givenName} ${user?.familyName}`}
          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
        />
      );
    }

    return (
      <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
        <User className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-lg ${isMobile ? 'w-full' : 'w-72'} h-full flex flex-col ${isMobile ? 'min-h-screen' : ''}`}>
      {/* Logo Section */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Philippine Red Cross Logo"
            className="w-10 h-10 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-800 truncate">Red Cross</h1>
            <p className="text-xs text-gray-500 truncate">
              {user?.role === 'admin' ? 'Admin Portal' : 'Volunteer Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="relative group flex-shrink-0">
            <button
              onClick={handleAvatarClick}
              className="relative cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              disabled={isUploading}
              title="Click to upload photo"
            >
              {renderAvatar()}

              {/* Upload overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Camera className="w-5 h-5 text-white" />
              </div>

              {/* Loading indicator */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              )}
            </button>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              Click to upload photo
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>

            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.givenName} {user?.familyName}
            </p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {user?.role || 'Volunteer'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {navigationLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.href}
              onClick={() => handleNavigation(link.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${link.active
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${link.active ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className="font-medium truncate">{link.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Section - Fixed */}
      <div className="p-4 border-t border-gray-200 space-y-2 flex-shrink-0">
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
