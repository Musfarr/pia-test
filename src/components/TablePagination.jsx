import React from 'react';
import CustomSelect from './CustomSelect';

export default function TablePagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const perPageOptions = pageSizeOptions.map((opt) => ({
    value: opt,
    label: String(opt),
  }));

  return (
    <div className="clt-footer">
      <span className="clt-cell">
        Showing <strong style={{ color: '#111827' }}>{from}</strong>–<strong style={{ color: '#111827' }}>{to}</strong> of <strong style={{ color: '#111827' }}>{totalItems}</strong>
      </span>

      <div className="d-flex align-items-center gap-3">
        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-2">
            <span className="clt-cell" style={{ fontSize: '13px', color: '#6B7280' }}>Per page:</span>
            <CustomSelect
              value={pageSize}
              onChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1);
              }}
              options={perPageOptions}
              size="sm"
              direction="up"
              searchable={false}
              triggerStyle={{ minWidth: '60px', height: '30px' }}
            />
          </div>
        )}

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="clt-page-btn"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            title="Previous page"
            aria-label="Previous page"
          >
            <i className="bi bi-chevron-left" style={{ fontSize: '12px' }}></i>
          </button>
          <span className="clt-page-indicator">
            {page} <span style={{ color: '#D1D5DB', margin: '0 2px' }}>/</span> {totalPages}
          </span>
          <button
            type="button"
            className="clt-page-btn"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            title="Next page"
            aria-label="Next page"
          >
            <i className="bi bi-chevron-right" style={{ fontSize: '12px' }}></i>
          </button>
        </div>
      </div>
    </div>
  );
}
