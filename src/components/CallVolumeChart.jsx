import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ReactECharts from 'echarts-for-react';
import { getCallVolume } from '../services/api';

export default function CallVolumeChart() {
  const [days, setDays] = useState(7);

  const { data: response, isLoading } = useQuery({
    queryKey: ['callVolume', days],
    queryFn: () => getCallVolume(days),
  });

  const data = Array.isArray(response?.data)
    ? response.data
    : Array.isArray(response?.data?.data)
      ? response.data.data
      : Array.isArray(response?.data?.records)
        ? response.data.records
        : [];

  const dates = data.map((item) => item.date ?? item.day ?? '--');
  const leadCalls = data.map((item) => item.lead_calls ?? item.resolved_queries ?? 0);
  const issueCalls = data.map((item) => item.issue_calls ?? item.closed_queries ?? 0);
  const totalCalls = data.map(
    (item) => item.total_calls ?? item.total_queries ?? (Number(item.lead_calls ?? item.resolved_queries ?? 0) + Number(item.issue_calls ?? item.closed_queries ?? 0))
  );

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#475569', fontFamily: 'Outfit' },
      padding: [10, 15],
      borderRadius: 8,
      shadowBlur: 10,
      shadowColor: 'rgba(0,0,0,0.05)'
    },
    legend: {
      data: ['Resolved', 'Closed', 'Total'],
      textStyle: { color: '#64748b', fontFamily: 'Outfit', fontSize: 12 },
      bottom: '0%',
      icon: 'circle'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '12%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLine: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' }
    },
    series: [
      {
        name: 'Resolved',
        type: 'bar',
        stack: 'total',
        data: leadCalls,
        itemStyle: { color: '#7cb342', borderRadius: [4, 4, 0, 0] },
        barWidth: '40%'
      },
      {
        name: 'Closed',
        type: 'bar',
        stack: 'total',
        data: issueCalls,
        itemStyle: { color: '#cbd5e1', borderRadius: [0, 0, 0, 0] },
        barWidth: '40%'
      },
      {
        name: 'Total',
        type: 'line',
        data: totalCalls,
        itemStyle: { color: '#212529' },
        lineStyle: { width: 3, type: 'solid' },
        symbol: 'circle',
        symbolSize: 8,
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(124, 179, 66, 0.1)' },
              { offset: 1, color: 'rgba(124, 179, 66, 0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div className="card h-100 border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="mb-1 fw-bold">Call Volume</h5>
            <p className="text-muted small mb-0">Daily call traffic trends</p>
          </div>
          <select
            className="form-select form-select-sm border-0 bg-light px-3"
            style={{ width: 'auto', borderRadius: 'var(--radius-sm)' }}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={15}>Last 15 Days</option>
            <option value={30}>Last 30 Days</option>
          </select>
        </div>

        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '320px' }}>
            <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
          </div>
        ) : (
          <div style={{ height: '320px', width: '100%' }}>
            <ReactECharts
              option={option}
              style={{ height: '100%', width: '100%' }}
              settings={{ notMerge: true }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
