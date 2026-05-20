import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getAIPerformance } from '../services/api';
import { useDateRange } from '../context/DateRangeContext';

const AI_SERIES = [
  { key: 'resolved_by_ai',    label: 'Resolved by AI',     color: '#376AB3' },
  { key: 'escalated_to_agent', label: 'Escalated to Agent', color: '#4FAA94' },
  { key: 'other',             label: 'Other',              color: '#86C7B1' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

const SentimentBar = () => {
  const { startDate, endDate } = useDateRange();

  const { data: response, isLoading } = useQuery({
    queryKey: ['aiPerformance', startDate, endDate],
    queryFn: () => getAIPerformance(startDate, endDate),
  });

  const apiData = response?.data;

  const chartData = AI_SERIES.map(s => ({
    ...s,
    value: apiData?.[s.key]?.percentage ?? 0,
    count: apiData?.[s.key]?.count ?? 0,
  }));

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (p) => `${p.name}: ${p.value}%`,
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151', fontFamily: 'Outfit', fontSize: 12 },
      borderRadius: 10,
    },
    series: [{
      type: 'pie',
      radius: ['38%', '95%'],
      center: ['50%', '50%'],
      data: chartData.map(d => ({
        name: d.label,
        value: d.value,
        itemStyle: { color: d.color, borderWidth: 1, borderColor: '#fff' },
      })),
      label: { show: false },
      emphasis: { scale: true, scaleSize: 5 },
    }],
  };

  return (
    <div className="card h-100" style={CARD_STYLE}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="mb-0 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>AI Performance</h6>
        </div>
        {isLoading ? (
          <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '220px' }}>
            <span className="spinner-border spinner-border-sm text-secondary" />
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2" style={{ flex: 1, minHeight: '200px' }}>
            <div style={{ flex: '0 0 52%', alignSelf: 'stretch', minHeight: '200px' }}>
              <ReactECharts option={option} style={{ height: '100%', width: '100%', minHeight: '200px' }} />
            </div>
            <div style={{ flex: 1 }}>
              {chartData.map(d => (
                <div key={d.key} className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                    <span style={{ color: '#374151', fontSize: 'clamp(12px, 0.9vw, 15px)' }}>{d.label}:</span>
                  </div>
                  <span className="fw-medium" style={{ color: '#111827', fontSize: 'clamp(12px, 0.9vw, 15px)' }}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentBar;
