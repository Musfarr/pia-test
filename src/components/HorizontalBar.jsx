import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const INTENTS_DATA = [
  { name: 'Billing Inquiry',    pct: 24.8, icon: 'bi-currency-dollar', bg: '#D1FAE5', ic: '#059669' },
  { name: 'Balance Check',      pct: 18.7, icon: 'bi-credit-card-2-front', bg: '#DBEAFE', ic: '#3B82F6' },
  { name: 'Internet Packages',  pct: 16.1, icon: 'bi-wifi',            bg: '#EDE9FE', ic: '#7C3AED' },
  { name: 'Product Activation', pct: 12.3, icon: 'bi-box-seam',        bg: '#D1FAE5', ic: '#059669' },
  { name: 'Complaints',         pct: 8.9,  icon: 'bi-chat-square-text',bg: '#FCE7F3', ic: '#EC4899' },
  { name: 'AI Performance',     pct: 19.2, icon: 'bi-lightning-charge',bg: '#FEF3C7', ic: '#D97706' },
];

const MAX_PCT = 30;

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};


export default function HorizontalBar({ variant = 'intents' }) {
  const [days, setDays] = useState(7);

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
          itemStyle: { color: '#1B3A7A' },
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
          color: '#1B3A7A',
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
        data: [{ value: 86.7, name: 'Resolution Rate' }],
      }],
    };

    return (
      <div className="card h-100" style={CARD_STYLE}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Sentiment Analytics</h6>
            <select className="date-filter-select" value={days} onChange={e => setDays(Number(e.target.value))}>
              <option value={7}>7 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <div style={{ height: '210px' }}>
            <ReactECharts option={gaugeOption} style={{ height: '100%', width: '100%' }} />
          </div>
          <div className="d-flex gap-3 mb-3">
            <div className="text-center p-3 rounded-3 flex-fill" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: 1.2 }}>2.4h</div>
              <div className="d-flex align-items-center justify-content-center gap-1 mt-1">
                <i className="bi bi-arrow-repeat" style={{ color: '#9CA3AF', fontSize: '12px' }} />
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Avg Time</span>
              </div>
            </div>
            <div className="text-center p-3 rounded-3 flex-fill" style={{ backgroundColor: '#F9FAFB' }}>
              <div className="fw-bold" style={{ fontSize: '22px', color: '#111827', lineHeight: 1.2 }}>347</div>
              <div className="d-flex align-items-center justify-content-center gap-1 mt-1">
                <i className="bi bi-person-check" style={{ color: '#9CA3AF', fontSize: '12px' }} />
                <span style={{ color: '#6B7280', fontSize: '12px' }}>Resolved</span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <span className="d-inline-flex align-items-center gap-1 px-3 py-2 rounded-pill fw-semibold"
              style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '13px' }}>
              <i className="bi bi-arrow-up-short" style={{ fontSize: '16px' }} />
              6.3% vs last 7 days
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100" style={CARD_STYLE}>
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Top Intents</h6>
          <select className="date-filter-select" value={days} onChange={e => setDays(Number(e.target.value))}>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
          </select>
        </div>
        <div className="d-flex flex-column gap-2">
          {INTENTS_DATA.map(item => (
            <div key={item.name} className="d-flex align-items-center gap-3 pb-3">
              <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '32px', height: '32px', backgroundColor: item.bg }}>
                <i className={`bi ${item.icon}`} style={{ color: item.ic, fontSize: '14px' }} />
              </div>
              <span style={{ color: '#374151', fontSize: '16px', fontWeight: 500, minWidth: '120px' }}>{item.name}</span>
              <div style={{ flex: 1, height: '12px', backgroundColor: '#E5E7EB', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(item.pct / MAX_PCT) * 100}%`,
                  background: '#4FAA94',
                  borderRadius: '10px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span className="fw-semibold" style={{ color: '#111827', fontSize: '13px', minWidth: '45px', textAlign: 'right' }}>{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
