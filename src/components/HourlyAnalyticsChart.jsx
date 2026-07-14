import { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { hourlyAnalytics } from '../data/dashboardData';

export default function HourlyAnalyticsChart() {
  const [showDuration, setShowDuration] = useState(true);

  const data = hourlyAnalytics;
  const hours = data.map(item => `${item.hour}:00`);
  const calls = data.map(item => item.call_count);
  const avgDuration = data.map(item => item.avg_duration);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', lineStyle: { color: '#e2e8f0' } },
      backgroundColor: '#fff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      textStyle: { color: '#475569', fontFamily: 'Outfit' },
      padding: [10, 15],
      borderRadius: 8
    },
    legend: {
      data: ['Calls', 'Avg Duration (min)'],
      textStyle: { color: '#64748b', fontFamily: 'Outfit' },
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
      data: hours,
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11, fontFamily: 'Outfit' }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Calls',
        nameTextStyle: { color: '#94a3b8', padding: [0, 0, 0, -30] },
        splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
        axisLabel: { color: '#94a3b8', fontSize: 11 }
      },
      {
        type: 'value',
        name: 'Duration',
        show: showDuration,
        nameTextStyle: { color: '#94a3b8' },
        axisLabel: { color: '#94a3b8', formatter: '{value}m', fontSize: 11 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Calls',
        type: 'bar',
        data: calls,
        itemStyle: {
          color: '#c5e1a5',
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: { color: '#7cb342' }
        },
        barWidth: '50%'
      },
      ...(showDuration ? [{
        name: 'Avg Duration (min)',
        type: 'line',
        yAxisIndex: 1,
        data: avgDuration,
        smooth: true,
        itemStyle: { color: '#212529' },
        lineStyle: { width: 3 },
        symbol: 'circle',
        symbolSize: 6
      }] : [])
    ]
  };

  return (
    <div className="card h-100 border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="mb-1 fw-bold">Hourly Insights</h5>
            <p className="text-muted small mb-0">Communication peak times</p>
          </div>
          <button
            className={`btn btn-sm ${showDuration ? 'btn-primary shadow-sm' : 'btn-light text-secondary'}`}
            style={{ fontSize: '0.8rem', borderRadius: '8px' }}
            onClick={() => setShowDuration(!showDuration)}
          >
            {showDuration ? 'Hide Duration' : 'Show Duration'}
          </button>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ReactECharts
            option={option}
            style={{ height: '100%', width: '100%' }}
            settings={{ notMerge: true }}
          />
        </div>
      </div>
    </div>
  );
}
