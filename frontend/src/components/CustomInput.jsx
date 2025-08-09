import React, { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Eye, EyeOff } from "lucide-react";

const CustomInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  error = "",
  children,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === "password";

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const getInputType = () => {
    if (isPasswordType) {
      return showPassword ? "text" : "password";
    }
    return type;
  };

  const renderInput = () => {
    switch (type) {
      case "select":
        return (
          <select
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-[4.5px] border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
            }`}
            {...props}
          >
            {children}
          </select>
        );

      case "checkbox":
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={onChange}
            className={`h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded ${
              error ? "border-red-300" : ""
            }`}
            {...props}
          />
        );

      case "textarea":
        return (
          <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
            }`}
            rows={4}
            {...props}
          />
        );

      default:
        return (
          <Input
            type={getInputType()}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
              isPasswordType ? "pr-12" : ""
            } ${
              error ? "border-red-300 focus:ring-red-500" : "border-gray-300"
            }`}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        {renderInput()}

        {isPasswordType && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            onClick={handleTogglePassword}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default CustomInput;
