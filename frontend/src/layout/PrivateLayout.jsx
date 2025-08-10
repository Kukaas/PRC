import React, { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Button } from "../components/ui/button";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import logo from "../assets/logo.png";

const PrivateLayout = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:sticky md:top-0 md:h-screen">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-80">
          <Sidebar isMobile={true} onClose={() => setIsMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <Sidebar isMobile={true} onClose={() => setIsMobileSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Logo - Right Side */}
            <div className="flex items-center space-x-2">
              <img
                src={logo}
                alt="Philippine Red Cross Logo"
                className="w-8 h-8 object-contain"
              />
              <div>
                <h1 className="text-sm font-bold text-gray-800">Red Cross</h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full pl-0 md:pl-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
