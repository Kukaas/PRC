import React, { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, LogOut, User, Heart, Home, Users, Settings, FileText } from "lucide-react";
import { useAuth } from "./AuthContext";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navigationLinks = [
    { href: "/", label: "Home", icon: Home, active: location.pathname === "/" },
    { href: "#", label: "Volunteer", icon: Users, active: location.pathname === "/volunteer" },
    { href: "#", label: "Services", icon: Settings, active: location.pathname === "/services" },
    { href: "#", label: "About us", icon: FileText, active: location.pathname === "/about" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={logo}
                alt="Philippine Red Cross Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-800">Philippine Red Cross</h1>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center space-x-2 font-medium transition-all duration-200 px-3 py-2 rounded-lg ${
                    link.active
                      ? "text-red-600 bg-red-50 border border-red-200"
                      : "text-gray-600 hover:text-red-600 hover:bg-red-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                  <User className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700 font-medium text-sm">
                    {user?.givenName} {user?.familyName}
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-lg transition-all duration-200"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-4 py-2 rounded-lg transition-all duration-200"
                  asChild
                >
                  <Link to="/login">Login</Link>
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                  asChild
                >
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-100 rounded-lg">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white border-l border-gray-200">
                <div className="flex flex-col h-full">
                  {/* Mobile Logo */}
                  <div className="flex items-center space-x-3 mb-8 p-4 border-b border-gray-100">
                    <div className="relative">
                      <img
                        src={logo}
                        alt="Philippine Red Cross Logo"
                        className="w-10 h-10 object-contain"
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <Heart className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      Philippine Red Cross
                    </span>
                  </div>

                  {/* Mobile Navigation Links */}
                  <nav className="flex flex-col space-y-2 mb-8 px-4">
                    {navigationLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={`flex items-center space-x-3 font-medium transition-all duration-200 py-3 px-4 rounded-lg ${
                            link.active
                              ? "text-red-600 bg-red-50 border border-red-200"
                              : "text-gray-700 hover:text-red-600 hover:bg-red-50"
                          }`}
                          onClick={closeMobileMenu}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile Action Buttons */}
                  <div className="flex flex-col space-y-3 mt-auto p-4 border-t border-gray-100">
                    {isAuthenticated ? (
                      <>
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                          <User className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700 font-medium text-sm">
                            {user?.givenName} {user?.familyName}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-full py-3 px-4 rounded-lg transition-all duration-200"
                          onClick={() => {
                            handleLogout();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 w-full py-3 px-4 rounded-lg transition-all duration-200"
                          asChild
                        >
                          <Link to="/login" onClick={closeMobileMenu}>
                            Login
                          </Link>
                        </Button>
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white w-full py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          asChild
                        >
                          <Link to="/signup" onClick={closeMobileMenu}>
                            Sign up
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
