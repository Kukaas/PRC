import React from "react";
import Header from "../components/Header.jsx";
import logo from "../assets/logo.png";

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="bg-gray-900 text-gray-200 border-t border-gray-800 pt-5">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Philippine Red Cross" className="h-8 w-auto" />
              <span className="text-sm sm:text-base font-semibold tracking-wide">Philippine Red Cross</span>
            </div>
            <div className="text-xs text-gray-400">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
