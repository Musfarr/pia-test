import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getChannelDistribution } from '../services/api';

const CHANNEL_PALETTE = ['#376AB3', '#86C7B1', '#4FAA94', '#EDC176', '#F1AB8F', '#A78BFA'];

const CHANNEL_META = {
  gsm:    { icon: 'bi-telephone' },
  webrtc: { icon: 'bi-globe2' },
};

function getDateRange(days) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);
  const fmt = d => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

const WordBubble = () => {
  const [days, setDays] = useState(30);
  const { startDate, endDate } = useMemo(() => getDateRange(days), [days]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['channelDistribution', startDate, endDate],
    queryFn: () => getChannelDistribution(startDate, endDate),
  });

  const distribution = response?.data?.distribution ?? [];

  const chartData = distribution.map((d, i) => ({
    name: d.label ?? d.channel,
    value: d.percentage ?? 0,
    count: d.count ?? 0,
    color: CHANNEL_PALETTE[i % CHANNEL_PALETTE.length],
    icon: CHANNEL_META[d.channel]?.icon ?? 'bi-broadcast',
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
        name: d.name,
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
          <h6 className="mb-0 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>Channel Distribution</h6>
          <select
            className="date-filter-select"
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          >
            <option value={7}>7 Days</option>
            <option value={15}>15 Days</option>
            <option value={30}>30 Days</option>
          </select>
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
                <div key={d.name} className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${d.icon}`} style={{ color: '#9CA3AF', fontSize: 'clamp(12px, 0.9vw, 15px)', width: '16px' }} />
                    <span style={{ color: '#374151', fontSize: 'clamp(12px, 0.9vw, 15px)' }}>{d.name}:</span>
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

export default WordBubble;
