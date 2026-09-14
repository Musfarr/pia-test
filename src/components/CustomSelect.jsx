import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  size = 'md',
  align = 'left',
  direction = 'down',
  className = '',
  triggerStyle = {},
  menuStyle = {},
  searchable,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options to [{ value, label }]
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt._id || opt.id,
          label: opt.label !== undefined ? opt.label : opt.name || String(opt.value),
        };
      }
      return { value: opt, label: String(opt) };
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = useMemo(() => {
    return normalizedOptions.find((opt) => String(opt.value) === String(value));
  }, [normalizedOptions, value]);

  // Determine if search input should be shown (default: true if > 7 options)
  const showSearch = searchable !== undefined ? searchable : normalizedOptions.length > 7;

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!showSearch || !searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, searchQuery, showSearch]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen, showSearch]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select-wrap ${isOpen ? 'is-open' : ''} ${className}`} ref={containerRef}>
      <button
        type="button"
        className={`custom-select-trigger ${size === 'sm' ? 'custom-select-trigger--sm' : ''} ${isOpen ? 'is-open' : ''}`}
        style={triggerStyle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <i
          className={`bi bi-chevron-down custom-select-chevron ${isOpen ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`custom-select-menu ${direction === 'up' ? 'custom-select-menu-up' : ''} ${align === 'right' ? 'custom-select-menu-right' : ''}`}
            style={menuStyle}
            initial={{ opacity: 0, y: direction === 'up' ? 4 : -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: direction === 'up' ? 4 : -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
          >
            {showSearch && (
              <div className="custom-select-search-wrap">
                <i className="bi bi-search custom-select-search-icon" />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="custom-select-search-input"
                  placeholder="Filter options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="custom-select-empty">No options found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    className={`custom-select-option ${size === 'sm' ? 'custom-select-option--sm' : ''} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleSelect(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="text-truncate">{opt.label}</span>
                    {isSelected && (
                      <i className="bi bi-check2" style={{ fontSize: '14px', color: '#5006ba', flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
