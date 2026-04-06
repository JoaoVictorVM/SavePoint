"use client";

import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-[#18181B]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-[16px]
            border text-sm resize-none
            transition-all duration-[150ms] ease
            placeholder:text-[#A1A1AA]
            focus:outline-none focus:ring-2 focus:ring-[#06E09B] focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-[#FF453A]" : "border-[#E4E4E7]"}
            ${className}
          `}
          rows={4}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-xs text-[#FF453A] flex items-center gap-1"
            role="alert"
          >
            <span>⚠</span> {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
