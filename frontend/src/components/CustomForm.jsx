import React from "react";
import { Card, CardContent } from "./ui/card";

const CustomForm = ({
  title,
  children,
  onSubmit,
  className = "",
  logo = null,
}) => {
  return (
    <Card className={`w-full max-w-md mx-auto bg-white shadow-xl ${className}`}>
      <CardContent className="p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Logo */}
          {logo && (
            <div className="flex justify-center mb-6">
              <img
                src={logo}
                alt="Philippine Red Cross Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          )}

          {/* Title */}
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">{children}</div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CustomForm;
