import ReactECharts from 'echarts-for-react';
import { useDashboardStats } from '../../hooks/useQueries';

const colorForPct = (pct) => {
  if (pct < 30) return '#DC2626';
  if (pct < 70) return '#D97706';
  return '#059669';
};

function Gauge({ title, submitted, expected, pct }) {
  const color = colorForPct(pct);
  const option = {
    series: [{
      type: 'gauge',
      startAngle: 210,
      endAngle: -30,
      min: 0,
      max: 100,
      radius: '88%',
      center: ['50%', '58%'],
      pointer: { show: false },
      progress: { show: true, roundCap: true, width: 14, itemStyle: { color } },
      axisLine: { roundCap: true, lineStyle: { width: 14, color: [[1, '#E5E7EB']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      detail: {
        valueAnimation: true,
        formatter: '{value}%',
        color,
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Outfit',
        offsetCenter: [0, '-6%'],
      },
      data: [{ value: pct }],
    }],
  };

  return (
    <div className="col-6 text-center">
      <div style={{ height: '140px' }}>
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} settings={{ notMerge: true }} />
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{title}</div>
      <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{submitted}/{expected} scores submitted</div>
    </div>
  );
}

export default function ScoringProgressGauges() {
  const { data, isLoading } = useDashboardStats();
  if (isLoading || !data?.scoringProgress) return null;

  const { creator, executive } = data.scoringProgress;

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <h6 className="mb-2 fw-bold" style={{ color: '#111827', fontSize: '15px' }}>Scoring Progress</h6>
        <div className="row">
          <Gauge title="Creator Jury" submitted={creator.submitted} expected={creator.expected} pct={creator.pct} />
          <Gauge title="Executive Jury" submitted={executive.submitted} expected={executive.expected} pct={executive.pct} />
        </div>
      </div>
    </div>
  );
}
