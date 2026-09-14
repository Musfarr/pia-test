import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A dropdown multi-select for picking categories.
 *
 * Props:
 *   categories  — [{ _id, name, ... }]  full list of available categories
 *   selected    — [String]              array of selected category *names* (matches current backend contract)
 *   onToggle    — (categoryName) => void  called when a checkbox is flipped
 */
export default function CategoryMultiSelect({ categories, selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedSet = new Set(selected || []);
  const selectedCount = selectedSet.size;
  let selectionLabel = 'Select categories';
  if (selectedCount === 1) {
    selectionLabel = '1 category selected';
  } else if (selectedCount > 1) {
    selectionLabel = `${selectedCount} categories selected`;
  }

  return (
    <div className="custom-select-wrap" ref={ref}>
      <button
        type="button"
        className={`custom-select-trigger custom-select-trigger--sm ${open ? 'is-open' : ''}`}
        style={{ minWidth: '170px' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-truncate" style={{ fontSize: '12px' }}>
          {selectionLabel}
        </span>
        <i className={`bi bi-chevron-down custom-select-chevron ${open ? 'is-open' : ''}`} style={{ fontSize: '11px' }}></i>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="custom-select-menu"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              minWidth: '220px',
              maxHeight: '240px',
              textAlign: 'left',
            }}
          >
            {categories.length === 0 ? (
              <div className="custom-select-empty">
                No categories available
              </div>
            ) : (
              categories.map((cat) => {
                const checked = selectedSet.has(cat.name);
                return (
                  <label
                    key={cat._id}
                    className={`custom-select-option custom-select-option--sm ${checked ? 'is-selected' : ''}`}
                    style={{ cursor: 'pointer', marginBottom: '1px' }}
                  >
                    <div className="d-flex align-items-center gap-2 text-truncate">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggle(cat.name)}
                        style={{ accentColor: '#5006ba', cursor: 'pointer' }}
                      />
                      <span className="text-truncate" style={{ fontSize: '12.5px' }}>{cat.name}</span>
                    </div>
                  </label>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
