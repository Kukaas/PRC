"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props} />
  );
}

function RadioGroupItem({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center">
        <CircleIcon
          className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

// New component specifically for yes/no questions
function YesNoRadioGroup({
  value,
  onValueChange,
  label,
  className,
  error,
  required = false
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${label?.toLowerCase().replace(/\s+/g, '-')}-yes`} />
          <label htmlFor={`${label?.toLowerCase().replace(/\s+/g, '-')}-yes`} className="text-sm text-gray-700 cursor-pointer">
            Yes
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${label?.toLowerCase().replace(/\s+/g, '-')}-no`} />
          <label htmlFor={`${label?.toLowerCase().replace(/\s+/g, '-')}-no`} className="text-sm text-gray-700 cursor-pointer">
            No
          </label>
        </div>
      </RadioGroup>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

export { RadioGroup, RadioGroupItem, YesNoRadioGroup }
