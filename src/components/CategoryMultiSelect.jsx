import { useState, useRef, useEffect } from 'react';

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
    <div className="position-relative" ref={ref}>
      <button
        type="button"
        className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2"
        style={{ minWidth: '160px', justifyContent: 'space-between' }}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-truncate">
          {selectionLabel}
        </span>
        <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: '12px' }}></i>
      </button>

      {open && (
        <div
          className="position-absolute bg-white border rounded shadow-sm"
          style={{
            top: '100%',
            left: 0,
            zIndex: 1050,
            minWidth: '220px',
            maxHeight: '240px',
            overflowY: 'auto',
            padding: '6px',
            marginTop: '4px',
          }}
        >
          {categories.length === 0 ? (
            <div className="text-center py-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>
              No categories available
            </div>
          ) : (
            categories.map((cat) => {
              const checked = selectedSet.has(cat.name);
              return (
                <label
                  key={cat._id}
                  className="d-flex align-items-center gap-2 px-2 py-1 rounded"
                  style={{ cursor: 'pointer', fontSize: '14px', backgroundColor: checked ? '#EEF4FF' : 'transparent' }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(cat.name)}
                    style={{ accentColor: '#5006ba' }}
                  />
                  <span className="text-truncate">{cat.name}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
