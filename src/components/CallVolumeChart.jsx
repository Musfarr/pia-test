import { useState } from 'react';
import ReactECharts from 'echarts-for-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

const STATIC_DATA = {
  voiceCalls: [50, 88, 155, 248, 348, 458, 592, 748, 908, 1108, 1358, 1820],
  whatsapp:   [50, 82, 134, 218, 308, 408, 518, 658, 798, 958, 1108, 1480],
  web:        [50, 72, 114, 178, 254, 336, 428, 528, 628, 758, 888, 1150],
  other:      [50, 62, 88, 124, 168, 224, 288, 364, 434, 514, 594, 748],
};

const SERIES = [
  { name: 'Voice Calls', key: 'voiceCalls', color: '#1B3A7A' },
  { name: 'WhatsApp',    key: 'whatsapp',   color: '#2DD4BF' },
  { name: 'Web',         key: 'web',        color: '#60A5FA' },
  { name: 'Other Channels', key: 'other',   color: '#FBBF24' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

export default function CallVolumeChart() {
  const [days, setDays] = useState(7);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: '#E5E7EB', type: 'dashed' } },
      backgroundColor: '#fff',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: { color: '#374151', fontFamily: 'Outfit', fontSize: 12 },
      padding: [10, 14],
      borderRadius: 10,
    },
    legend: {
      data: SERIES.map(s => s.name),
      bottom: 0,
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: '#6B7280', fontFamily: 'Outfit', fontSize: 12 },
      itemGap: 24,
    },
    grid: { left: 0, right: 0, top: 16, bottom: 44, containLabel: true },
    xAxis: {
      type: 'category',
      data: MONTHS,
      axisLine: { show: true },
      axisTick: { show: true },
      splitLine: { show: true },
      axisLabel: { color: '#9CA3AF', fontSize: 14, fontFamily: 'Outfit' },
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 1820,
      splitNumber: 5,
      splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9CA3AF', fontSize: 14, fontFamily: 'Outfit' },
    },
    series: SERIES.map(s => ({
      name: s.name,
      type: 'line',
      data: STATIC_DATA[s.key],
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: { color: s.color, borderWidth: 2 },
      lineStyle: { color: s.color, width: 3.5 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: s.color + '22' }, { offset: 1, color: s.color + '00' }],
        },
      },
    })),
  };

  return (
    <div className="card h-100" style={CARD_STYLE}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-medium" style={{ color: '#111827', fontSize: '18px' }}>Conversations Trend</h6>
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
        <div style={{ height: '300px', width: '100%' }}>
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} settings={{ notMerge: true }} />
        </div>
      </div>
    </div>
  );
}
