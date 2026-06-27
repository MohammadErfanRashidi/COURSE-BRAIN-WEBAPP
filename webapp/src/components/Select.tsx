/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { useClickOutside } from '../hooks/useClickOutside';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  selectedValue,
  onChange,
  placeholder = 'انتخاب کنید...',
  error,
  searchable = true,
  disabled = false,
  searchPlaceholder = 'جستجو کنید...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useClickOutside({
    isOpen,
    onClose: () => setIsOpen(false),
    menuRef: containerRef,
  });

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleSelect = (value: string) => {
    onChange(value);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="w-full flex flex-col gap-1.5 text-right font-sans relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-slate-700 tracking-tight mr-1">
          {label}
        </label>
      )}

      {/* Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full h-13 px-5 text-sm rounded-2xl border bg-slate-50 text-slate-900 font-sans
          flex items-center justify-between transition-all duration-200 outline-none
          ${disabled ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'cursor-pointer'}
          ${error 
            ? 'border-rose-200/60 focus:border-rose-500/80 focus:ring-4 focus:ring-rose-500/5' 
            : isOpen 
              ? 'border-indigo-500 ring-4 ring-indigo-500/5 bg-white'
              : 'border-slate-150 hover:border-slate-200'
          }
        `}
      >
        <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 left-0 top-[calc(100%+6px)] z-50 bg-white border border-slate-100 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] max-h-60 flex flex-col overflow-hidden animate-in fade-in-50 slide-in-from-top-1 duration-150">
          {/* Search bar inside dropdown */}
          {searchable && (
            <div className="relative border-b border-slate-100 p-2 bg-slate-50/50 flex items-center">
              <Search className="absolute right-4 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full py-1.5 pr-8 pl-8 text-xs bg-white border border-slate-150 rounded-lg outline-none focus:border-indigo-500 font-sans"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 p-1 hover:bg-slate-100 rounded text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto flex-1 no-scrollbar py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === selectedValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`
                      w-full text-right px-4 py-2.5 text-xs font-sans flex items-center justify-between transition-colors
                      ${isSelected ? 'bg-indigo-50 text-indigo-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                موردی یافت نشد.
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-[11px] text-rose-600 font-semibold mt-0.5 mr-1">
          {error}
        </span>
      )}
    </div>
  );
};
