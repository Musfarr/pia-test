import React from 'react';
import ReactECharts from 'echarts-for-react';

const AI_DATA = [
  { name: 'Resolved by AI',     value: 30, color: '#376AB3' },
  { name: 'Escalated to Agent', value: 25, color: '#4FAA94' },
  { name: 'Web Chat',           value: 20, color: '#86C7B1' },
  { name: 'Mobile App',         value: 15, color: '#EDC176' },
  { name: 'SMS',                value: 10, color: '#F1AB8F' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

const SentimentBar = () => {
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
      data: AI_DATA.map(d => ({
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
        <h6 className="mb-4 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>AI Performance</h6>
        <div className="d-flex align-items-center gap-2">
          <div style={{ flex: '0 0 52%', height: '260px' }}>
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            {AI_DATA.map(d => (
              <div key={d.name} className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: d.color, flexShrink: 0 }} />
                  <span style={{ color: '#374151', fontSize: '16px' }}>{d.name}:</span>
                </div>
                <span className="fw-medium" style={{ color: '#111827', fontSize: '16px' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentBar;
