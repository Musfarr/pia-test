import ReactECharts from 'echarts-for-react';
import { resolutionRate, topIntents } from '../data/dashboardData';

const INTENT_PALETTE = [
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
  { bg: 'rgb(31 30 31)', ic: '#dbff00' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};


export default function HorizontalBar({ variant = 'intents' }) {
  const gaugeData = resolutionRate;

  const intents = topIntents.map((item, index) => ({
    ...item,
    ...INTENT_PALETTE[index % INTENT_PALETTE.length],
  }));

  const maxPct = intents.length ? Math.max(...intents.map(d => d.pct), 1) : 1;

  if (variant === 'gauge') {
    const gaugeOption = {
      series: [{
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        min: 0,
        max: 100,
        radius: '88%',
        center: ['50%', '58%'],
        pointer: { show: false },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
          itemStyle: { color: '#5006ba' },
        },
        axisLine: {
          roundCap: true,
          lineStyle: { width: 18, color: [[1, '#E5E7EB']] },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          color: '#5006ba',
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'Outfit',
          offsetCenter: [0, '-8%'],
        },
        title: {
          offsetCenter: [0, '18%'],
          color: '#6B7280',
          fontSize: 12,
          fontFamily: 'Outfit',
        },
        data: [{ value: gaugeData?.resolution_rate ?? 0, name: 'Resolution Rate' }],
      }],
    };

    return (
      <div className="card h-100" style={CARD_STYLE}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Completion Rate</h6>
          </div>
          <div style={{ minHeight: '180px', height: '180px' }}>
            <ReactECharts option={gaugeOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="d-flex gap-3 mb-3">
            <div className="text-center p-3 rounded-3 flex-fill" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: 1.2 }}>
                {gaugeData?.avg_time ?? '—'}
              </div>
              <div className="d-flex align-items-center justify-content-center gap-1 mt-1">
                <i className="bi bi-arrow-repeat" style={{ color: '#9CA3AF', fontSize: '12px' }} />
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Avg Time</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-3 flex-fill" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: 1.2 }}>
                {gaugeData?.resolved_count ?? '—'}
              </div>
              <div className="d-flex align-items-center justify-content-center gap-1 mt-1">
                <i className="bi bi-person-check" style={{ color: '#9CA3AF', fontSize: '12px' }} />
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Resolved</span>
              </div>
            </div>
          </div>
          {/* <div className="text-center">
            <span className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold"
              style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '13px' }}>
              <i className="bi bi-arrow-up-short" style={{ fontSize: '16px' }} />
              {gaugeData?.rate_change != null ? `${gaugeData.rate_change}%` : '—'} resolution rate
            </span>
          </div> */}
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100" style={CARD_STYLE}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Completion status per category</h6>
        </div>
        <div className="d-flex flex-column gap-2">
          {intents.map(item => (
            <div key={item.name} className="d-flex align-items-center gap-3 pb-3">
              <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '32px', height: '32px', backgroundColor: item.bg }}>
                <i className="bi bi-chat-dots" style={{ color: item.ic, fontSize: '14px' }} />
              </div>
              <span style={{ color: '#374151', fontSize: 'clamp(12px, 0.9vw, 15px)', fontWeight: 500, minWidth: '100px' }}>{item.name}</span>
              <div style={{ flex: 1, height: '12px', backgroundColor: '#E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(item.pct / maxPct) * 100}%`, background: '#5006ba', borderRadius: '10px', transition: 'width 0.6s ease' }} />
              </div>
              <span className="fw-semibold" style={{ color: '#111827', fontSize: '13px', minWidth: '45px', textAlign: 'right' }}>{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
