import { useQuery } from '@tanstack/react-query';
import { getDashboardAnalytics } from '../services/api';

export default function MetricsCards({ startDate, endDate }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboardAnalytics', startDate, endDate],
    queryFn: () => getDashboardAnalytics(startDate, endDate),
  });

  const data = response?.data;

  const metrics = [
    {
      label: 'TOTAL CALLS',
      value: data?.total_calls ?? '--',
      icon: 'bi-telephone',
      color: 'var(--primary)',
      bg: 'var(--primary-light)'
    },
    {
      label: 'RESOLVED',
      value: data?.resolved_queries ?? '--',
      icon: 'bi-check2-circle',
      color: 'var(--success)',
      bg: '#ecfdf5'
    },
    {
      label: 'CLOSED',
      value: data?.closed_queries ?? '--',
      icon: 'bi-x-circle',
      color: 'var(--warning)',
      bg: '#fffbeb'
    },
    {
      label: 'AVG DURATION',
      value: data?.avg_call_duration ? data.avg_call_duration.toFixed(2) + 'm' : '--',
      icon: 'bi-clock-history',
      color: '#8b5cf6',
      bg: '#f5f3ff'
    },
    {
      label: 'TOTAL MINUTES',
      value: data?.total_call_minutes ?? '--',
      icon: 'bi-graph-up-arrow',
      color: '#ec4899',
      bg: '#fdf2f8'
    },
  ];

  return (
    <div className="row g-4">
      {metrics.map((metric, index) => (
        <div key={index} className="col-12 col-sm-6 col-lg">
          <div className="card h-100 border-0" style={{ borderRadius: 'var(--radius-md)' }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="text-secondary fw-semibold small text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                  {metric.label}
                </div>
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px', backgroundColor: metric.bg, color: metric.color }}
                >
                  <i className={`bi ${metric.icon}`} style={{ fontSize: '1rem' }}></i>
                </div>
              </div>
              <div>
                <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                  {isLoading ? (
                    <div className="spinner-border spinner-border-sm text-secondary" />
                  ) : (
                    metric.value
                  )}
                </h2>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
