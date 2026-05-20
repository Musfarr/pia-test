import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getConversationsTrend } from '../services/api';
import { useDateRange } from '../context/DateRangeContext';

const SERIES_CONFIG = [
  { name: 'Voice Calls', key: 'voice_calls', color: '#1B3A7A' },
  { name: 'Web',         key: 'web',         color: '#60A5FA' },
  { name: 'Total',       key: 'total',       color: '#2DD4BF' },
];

const CARD_STYLE = {
  borderRadius: '16px',
  border: 'none',
  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.06)',
};

export default function CallVolumeChart() {
  const { startDate, endDate } = useDateRange();

  const { data: response, isLoading } = useQuery({
    queryKey: ['conversationsTrend', startDate, endDate],
    queryFn: () => getConversationsTrend(startDate, endDate),
  });

  const apiData = response?.data;
  const labels = apiData?.labels ?? [];
  const datasets = apiData?.datasets ?? {};

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
      data: SERIES_CONFIG.map(s => s.name),
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
      data: labels,
      axisLine: { show: true },
      axisTick: { show: true },
      splitLine: { show: true },
      axisLabel: { color: '#9CA3AF', fontSize: 12, fontFamily: 'Outfit', rotate: labels.length > 10 ? 30 : 0 },
    },
    yAxis: {
      type: 'value',
      splitNumber: 5,
      splitLine: { lineStyle: { color: '#F3F4F6', type: 'dashed' } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9CA3AF', fontSize: 14, fontFamily: 'Outfit' },
    },
    series: SERIES_CONFIG.map(s => ({
      name: s.name,
      type: 'line',
      data: datasets?.[s.key] ?? [],
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
        </div>
        <div style={{ minHeight: '280px', height: '280px', width: '100%', position: 'relative' }}>
          {isLoading && (
            <div className="d-flex align-items-center justify-content-center h-100">
              <span className="spinner-border spinner-border-sm text-secondary" />
            </div>
          )}
          {!isLoading && (
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} settings={{ notMerge: true }} />
          )}
        </div>
      </div>
    </div>
  );
}
