/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-right font-sans">
        {label && (
          <label 
            htmlFor={inputId} 
            className="text-xs font-bold text-slate-700 tracking-tight mr-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute right-3 text-slate-400 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            id={inputId}
            ref={ref}
            className={`
              w-full h-13 text-sm rounded-2xl border bg-slate-50 text-slate-900 font-sans tracking-wide
              transition-all duration-200 outline-none placeholder:text-slate-400
              ${icon ? 'pr-10' : 'pr-5'} pl-5
              ${error 
                ? 'border-rose-200/60 focus:border-rose-500/80 focus:ring-4 focus:ring-rose-500/5 bg-white' 
                : 'border-slate-200/40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 focus:bg-white'
              }
              disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200
              ${className}
            `}
            {...props}
          />
        </div>

        {error ? (
          <span className="text-[11px] text-rose-600 font-semibold mt-0.5 mr-1">
            {error}
          </span>
        ) : helperText ? (
          <span className="text-[11px] text-slate-400 mt-0.5 leading-relaxed mr-1">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
