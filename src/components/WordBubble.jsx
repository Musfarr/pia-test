import React from 'react';
import ReactECharts from 'echarts-for-react';

const CHANNEL_DATA = [
  { name: 'Voice Calls', value: 30, color: '#376AB3', icon: 'bi-telephone' },
  { name: 'WhatsApp',    value: 25, color: '#4FAA94', icon: 'bi-whatsapp' },
  { name: 'Web Chat',    value: 20, color: '#86C7B1', icon: 'bi-globe2' },
  { name: 'Mobile App',  value: 15, color: '#EDC176', icon: 'bi-phone' },
  { name: 'SMS',         value: 10, color: '#F1AB8F', icon: 'bi-chat-left-text' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

const WordBubble = () => {
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
      data: CHANNEL_DATA.map(d => ({
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
        <h6 className="mb-4 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>Channel Distribution</h6>
        <div className="d-flex align-items-center gap-2">
          <div style={{ flex: '0 0 52%', height: '260px' }}>
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
          </div>
          <div style={{ flex: 1 }}>
            {CHANNEL_DATA.map(d => (
              <div key={d.name} className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${d.icon}`} style={{ color: '#9CA3AF', fontSize: '16px', width: '16px' }} />
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

export default WordBubble;
