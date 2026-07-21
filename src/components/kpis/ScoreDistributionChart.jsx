import ReactECharts from 'echarts-for-react';
import { useDashboardStats } from '../../hooks/useQueries';

const LABELS = ['0-20', '20-40', '40-60', '60-80', '80-100'];

export default function ScoreDistributionChart() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.scoreDistribution) return null;

  const buckets = data.scoreDistribution;
  const values = LABELS.map((l) => buckets[l] || 0);
  const hasData = values.some((v) => v > 0);

  const option = {
    grid: { left: 36, right: 12, top: 20, bottom: 28 },
    xAxis: {
      type: 'category',
      data: LABELS,
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280', fontSize: 11, fontFamily: 'Outfit' },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#F3F4F6' } },
      axisLabel: { color: '#9CA3AF', fontSize: 11, fontFamily: 'Outfit' },
    },
    series: [{
      type: 'bar',
      data: values,
      barWidth: '46%',
      itemStyle: {
        borderRadius: [8, 8, 0, 0],
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: '#6510b4' }, { offset: 1, color: '#29055e' }],
        },
      },
    }],
    tooltip: { trigger: 'axis' },
  };

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <h6 className="mb-2 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Score Distribution</h6>
        {!hasData ? (
          <p className="mb-0 text-center py-5" style={{ color: '#9CA3AF', fontSize: '13px' }}>No scores submitted yet</p>
        ) : (
          <div style={{ height: '210px' }}>
            <ReactECharts option={option} style={{ height: '100%', width: '100%' }} settings={{ notMerge: true }} />
          </div>
        )}
        <p className="mb-0 mt-2" style={{ fontSize: '11.5px', color: '#9CA3AF' }}>
          Average score (0–100) across all submitted jury scores
        </p>
      </div>
    </div>
  );
}
