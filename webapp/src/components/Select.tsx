import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Search, Check, X, Loader2 } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  inline?: boolean;
  size?: 'sm' | 'md';
  searchPlaceholder?: string;
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'انتخاب کنید...',
  error,
  searchable = true,
  disabled = false,
  loading = false,
  emptyMessage = 'موردی یافت نشد.',
  className = '',
  inline = false,
  size = 'md',
  searchPlaceholder = 'جستجو کنید...',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [portalStyle, setPortalStyle] = useState<{
    top: number; left: number; width: number; above: boolean;
  }>({ top: 0, left: 0, width: 0, above: false });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Reset active index when filtered options change
  useEffect(() => {
    setActiveIndex(-1);
  }, [filteredOptions.length]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Calculate portal position on open & re-calculate on scroll/resize
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const estimatedHeight = Math.min(240, filteredOptions.length * 44 + (searchable ? 48 : 0) + 16);
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const showAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

      setPortalStyle({
        top: showAbove ? rect.top - 8 : rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, inline ? 200 : 0),
        above: showAbove,
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, filteredOptions.length, searchable, inline]);

  // Click outside & Escape detection
  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideDropdown = listRef.current?.contains(target);
      if (!insideTrigger && !insideDropdown) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleInteraction);
    document.addEventListener('touchstart', handleInteraction, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active option into view
  useEffect(() => {
    if (activeIndex >= 0 && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const handleSelect = useCallback((val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
    triggerRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const maxIndex = filteredOptions.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => prev < maxIndex ? prev + 1 : 0);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => prev > 0 ? prev - 1 : maxIndex);
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(maxIndex);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex <= maxIndex) {
          handleSelect(filteredOptions[activeIndex].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        triggerRef.current?.focus();
        break;
    }
  }, [isOpen, filteredOptions, activeIndex, handleSelect]);

  const handleTriggerClick = () => {
    if (!disabled) {
      if (!isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const estimatedHeight = Math.min(240, filteredOptions.length * 44 + (searchable ? 48 : 0) + 16);
        const spaceBelow = window.innerHeight - rect.bottom - 8;
        const spaceAbove = rect.top - 8;
        const showAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
        setPortalStyle({
          top: showAbove ? rect.top - 8 : rect.bottom + 8,
          left: rect.left,
          width: Math.max(rect.width, inline ? 200 : 0),
          above: showAbove,
        });
      }
      setIsOpen(prev => !prev);
      if (isOpen) setSearchQuery('');
    }
  };

  const handleOptionHover = (index: number) => {
    setActiveIndex(index);
  };

  const dropdownId = `select-dropdown-${label?.replace(/\s+/g, '-') || 'default'}`;
  const activeDescendantId = activeIndex >= 0 ? `${dropdownId}-option-${activeIndex}` : undefined;

  const renderTrigger = () => (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={dropdownId}
      aria-activedescendant={activeDescendantId}
      aria-label={label}
      aria-required={required}
      disabled={disabled}
      onClick={handleTriggerClick}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center justify-between w-full text-right font-sans outline-none transition-colors duration-150
        ${inline
          ? 'bg-transparent border-none text-xs font-bold text-slate-700 cursor-pointer'
          : `${size === 'sm' ? 'h-auto px-3 py-2 text-xs' : 'h-13 px-5 text-sm'} rounded-xl border bg-slate-50 text-slate-900 cursor-pointer
             ${error
               ? 'border-rose-200/60 focus:border-rose-500/80 focus:ring-4 focus:ring-rose-500/5'
               : isOpen
                 ? 'border-indigo-500 ring-4 ring-indigo-500/5 bg-white'
                 : 'border-slate-200/40 hover:border-slate-200/60'
             }`
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className={selectedOption && !inline ? 'text-slate-900' : inline ? 'text-slate-700' : 'text-slate-400'}>
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      {!inline && (
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      )}
    </button>
  );

  const renderSearchBar = () => (
    <div className="relative border-b border-slate-100/50 p-2 bg-slate-50/50 flex items-center shrink-0">
      <Search className="absolute right-4 w-4 h-4 text-slate-400 pointer-events-none" />
      <input
        ref={searchInputRef}
        type="text"
        role="searchbox"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); }}
        placeholder={searchPlaceholder}
        className="w-full py-2 pr-8 pl-8 text-xs bg-white border border-slate-200/40 rounded-lg outline-none focus:border-indigo-500 font-sans"
        onKeyDown={handleKeyDown}
      />
      {searchQuery && (
        <button
          type="button"
          onClick={() => setSearchQuery('')}
          className="absolute left-4 p-1 hover:bg-slate-100 rounded text-slate-400"
          tabIndex={-1}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );

  const renderOptions = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center gap-2 py-8 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs font-bold">در حال بارگذاری...</span>
        </div>
      );
    }

    if (filteredOptions.length === 0) {
      return (
        <div className="px-4 py-8 text-center text-xs text-slate-400 font-medium">
          {emptyMessage}
        </div>
      );
    }

    optionRefs.current = optionRefs.current.slice(0, filteredOptions.length);

    return filteredOptions.map((opt, index) => {
      const isSelected = opt.value === value;
      const isFocused = index === activeIndex;

      return (
        <button
          key={opt.value}
          ref={(el) => { optionRefs.current[index] = el; }}
          id={`${dropdownId}-option-${index}`}
          type="button"
          role="option"
          aria-selected={isSelected}
          onClick={() => handleSelect(opt.value)}
          onMouseEnter={() => handleOptionHover(index)}
          className={`
            w-full text-right px-4 py-2.5 md:py-3 text-xs font-sans flex items-center justify-between transition-colors duration-100
            ${isSelected ? 'bg-indigo-50 text-indigo-800 font-bold' : 'text-slate-700 hover:bg-slate-50'}
            ${isFocused ? 'bg-slate-50' : ''}
          `}
        >
          <span className="min-w-0 truncate">{opt.label}</span>
          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0 mr-2" />}
        </button>
      );
    });
  };

  const renderDropdown = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="select-dropdown"
          id={dropdownId}
          role="listbox"
          aria-label={label}
          ref={listRef}
          initial={{ opacity: 0, scale: 0.95, y: portalStyle.above ? 4 : -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: portalStyle.above ? 4 : -4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: portalStyle.top,
            left: portalStyle.left,
            width: portalStyle.width,
            maxHeight: 'min(240px, 60vh)',
            transformOrigin: portalStyle.above ? 'bottom' : 'top',
            zIndex: 100,
          }}
          className="bg-white border border-slate-100/80 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {searchable && !loading && renderSearchBar()}
          <div className="overflow-y-auto no-scrollbar py-1" style={{ maxHeight: 'inherit' }}>
            {renderOptions()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      ref={containerRef}
      className={`
        font-sans relative
        ${inline ? 'inline-flex flex-col' : 'w-full flex flex-col gap-1.5 text-right'}
      `}
    >
      {label && !inline && (
        <label className="text-xs font-bold text-slate-700 tracking-tight mr-1">
          {label}
          {required && <span className="text-rose-500 mr-0.5">*</span>}
        </label>
      )}

      {renderTrigger()}

      {createPortal(renderDropdown(), document.body)}

      {error && !inline && (
        <span className="text-[11px] text-rose-600 font-semibold mt-0.5 mr-1">
          {error}
        </span>
      )}
    </div>
  );
};
