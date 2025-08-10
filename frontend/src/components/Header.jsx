import React, { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "./AuthContext";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "#", label: "Volunteer" },
    { href: "#", label: "Services" },
    { href: "#", label: "About us" },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 bg-cyan-300 px-6 py-4 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-4">
          <img
            src={logo}
            alt="Philippine Red Cross Logo"
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-black hover:text-blue-800 font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-700" />
                <span className="text-gray-700 font-medium">
                  {user?.givenName} {user?.familyName}
                </span>
              </div>
              <Button
                variant="outline"
                className="bg-white text-red-600 border-red-600 hover:bg-red-50 px-6 py-2"
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
                className="bg-white text-red-600 border-red-600 hover:bg-red-50 px-6 py-2"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
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
              <Button variant="ghost" size="sm" className="p-3">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-cyan-50">
              <div className="flex flex-col h-full">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-3 mb-8 p-4">
                  <img
                    src={logo}
                    alt="Philippine Red Cross Logo"
                    className="w-10 h-10 object-contain"
                  />
                  <span className="text-lg font-semibold text-gray-800">
                    Philippine Red Cross
                  </span>
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-4 mb-8">
                  {navigationLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="text-gray-700 hover:text-blue-800 font-medium transition-colors py-3 px-4 rounded-lg hover:bg-cyan-100"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Action Buttons */}
                <div className="flex flex-col space-y-3 mt-auto">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-cyan-100 rounded-lg">
                        <User className="h-5 w-5 text-gray-700" />
                        <span className="text-gray-700 font-medium">
                          {user?.givenName} {user?.familyName}
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        className="bg-white text-red-600 border-red-600 hover:bg-red-50 w-full py-3 px-6"
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
                        className="bg-white text-red-600 border-red-600 hover:bg-red-50 w-full py-3 px-6"
                        asChild
                      >
                        <Link to="/login" onClick={closeMobileMenu}>
                          Login
                        </Link>
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white w-full py-3 px-6"
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
    </header>
  );
};

export default Header;
