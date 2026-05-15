import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const SENTIMENT_DATA = [
  { name: 'Positive',      value: 47.4, color: '#376AB3' },
  { name: 'Neutral',       value: 35.1, color: '#4FAA94' },
  { name: 'Negative',      value: 12.1, color: '#86C7B1' },
  { name: 'Very Negative', value: 5.4,  color: '#EDC176' },
];

const LLM_SERVICES = [
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
  { name: 'LLM Services',        status: 'Operational' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};


export default function TopKeyWords({ variant = 'sentiment' }) {
  const [days, setDays] = useState(7);

  if (variant === 'status') {
    return (
      <div className="card h-100" style={CARD_STYLE}>
        <div className="card-body p-4">
          <h6 className="mb-4 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>LLM Services</h6>
          <div className="d-flex flex-column gap-2">
            {LLM_SERVICES.map((item, i) => (
              <div
                key={i}
                className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                style={{ backgroundColor: '#F9FAFB' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill" style={{ color: '#10B981', fontSize: '14px' }} />
                  <span style={{ color: '#374151', fontSize: '14px', fontWeight: 500 }}>{item.name}</span>
                </div>
                <span className="fw-semibold" style={{ color: '#10B981', fontSize: '13px' }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {d}%',
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151', fontFamily: 'Outfit', fontSize: 12 },
      borderRadius: 10,
    },
    series: [{
      type: 'pie',
      radius: ['38%', '95%'],
      center: ['38%', '50%'],
      data: SENTIMENT_DATA.map(d => ({
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
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h6 className="mb-0 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>Sentiment Analytics</h6>
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
        <div className="d-flex align-items-center gap-2">
          <div style={{ flex: '0 0 52%', height: '240px', position: 'relative' }}>
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
            <div style={{
              position: 'absolute', top: '48%', left: '38%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <div style={{ color: '#9CA3AF', fontSize: '11px', lineHeight: 1.4 }}>Total</div>
              <div style={{ color: '#111827', fontSize: '18px', fontWeight: 700, lineHeight: 1.2 }}>18,020</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {SENTIMENT_DATA.map(d => (
              <div key={d.name} className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ color: '#374151', fontSize: '16px' }}>{d.name}</span>
                </div>
                <span className="fw-medium" style={{ color: '#111827', fontSize: '16px' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}