/**
 * Shared skeleton for list-only pages.
 * Shows a card with a table header row and an empty-state placeholder.
 *
 * Props:
 *   title        — card title
 *   subtitle     — card subtitle
 *   columns      — [String]  table column headers
 *   emptyMessage — text shown in the empty state
 */
export default function SkeletonListPage({ title, subtitle, columns, emptyMessage }) {
  return (
    <div className="container-fluid px-3">
      <div className="card clt-card">
        <div className="clt-header">
          <div>
            <h6 className="clt-title">{title}</h6>
            <p className="clt-subtitle">{subtitle}</p>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr className="clt-thead-row">
                  {columns.map((col, i) => (
                    <th
                      key={col}
                      className={`clt-th ${i === 0 ? 'ps-4' : 'text-center'} ${i === columns.length - 1 ? 'pe-4' : ''}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="border-top-0">
                <tr>
                  <td colSpan={columns.length} className="text-center py-5">
                    <i className="bi bi-inbox" style={{ fontSize: '2.5rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }}></i>
                    <p className="mb-0" style={{ color: '#9CA3AF', fontSize: '14px' }}>{emptyMessage}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
