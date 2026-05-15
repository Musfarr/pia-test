import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { getDashboardAnalytics } from '../services/api';


const SPARK = {
  conversations: [65, 72, 68, 80, 75, 88, 92, 85, 95, 100, 108, 120],
  calls:         [90, 85, 78, 80, 72, 68, 65, 70, 62, 58, 55, 60],
  digital:       [80, 82, 79, 85, 83, 80, 78, 82, 79, 77, 75, 78],
  resolution:    [60, 65, 70, 72, 75, 78, 80, 82, 85, 88, 90, 92],
};

const PALETTE = ['#376AB3', '#4FAA94', '#86C7B1', '#EDC176'];

function Sparkline({ data, color }) {
  const option = {
    grid: { left: 0, right: 0, top: 4, bottom: 0 },
    xAxis: { type: 'category', show: false, data: data.map((_, i) => i), boundaryGap: false },
    yAxis: { type: 'value', show: false },
    series: [{
      type: 'line',
      data,
      smooth: true,
      symbol: 'none',
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [{ offset: 0, color: color + '28' }, { offset: 1, color: color + '00' }],
        },
      },
    }],
  };
  return (
    <ReactECharts
      option={option}
      style={{ height: '56px', width: '100%' }}
      settings={{ notMerge: true }}
    />
  );
}

export default function MetricsCards({ startDate, endDate }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboardAnalytics', startDate, endDate],
    queryFn: () => getDashboardAnalytics(startDate, endDate),
  });

  const data = response?.data;

  const metrics = [
    {
      label: 'Total Conversations',
      value: data?.total_calls ?? '128,746',
      change: '+10%',
      positive: true,
      spark: SPARK.conversations,
      color: PALETTE[0],
    },
    {
      label: 'Calls Handled (voice)',
      value: data?.resolved_queries ?? '45,762',
      change: '-8%',
      positive: false,
      spark: SPARK.calls,
      color: PALETTE[1],
    },
    {
      label: 'Digital Interactions',
      value: data?.closed_queries ?? '83,074',
      change: '-1.4%',
      positive: false,
      spark: SPARK.digital,
      color: PALETTE[2],
    },
    {
      label: 'Avg. Resolutions Time',
      value: data?.avg_call_duration ? data.avg_call_duration.toFixed(2) + 'm' : '02:48',
      change: '+10%',
      positive: true,
      spark: SPARK.resolution,
      color: PALETTE[3],
    },
  ];

  /* Name */


  return (
    <div className="row g-4">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          className="col-12 col-sm-6 col-xl-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
        >
          <div className="card h-100 metrics-card">
            <div className="card-body metrics-card-body">
              <div className="metrics-card-header ">
                {/* Row 1: trend icon + label */}
                <div className="metrics-card-label">
                  <i
                    className={`bi bi-chevron-double-${m.positive ? 'up' : 'down'} metrics-card-label-icon ${m.positive ? 'positive' : 'negative'}`}
                  />
                  <span className="metrics-card-label-text">{m.label}</span>
                </div>
                {/* Row 2: value + badge */}
                <div className="metrics-card-value">
                  <span className="metrics-card-value-number">
                    {isLoading ? <span className="spinner-border spinner-border-sm text-secondary" /> : m.value}
                  </span>
                  <span className={`metrics-card-badge ${m.positive ? 'positive' : 'negative'}`}>
                    {m.change}
                  </span>
                </div>
              </div>
              {/* Row 3: sparkline */}
              <Sparkline data={m.spark} color={m.color} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
