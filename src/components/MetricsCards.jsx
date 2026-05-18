import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { getDashboardStats } from '../services/api';


const FALLBACK_SPARK = [0];

const PALETTE = ['#376AB3', '#4FAA94', '#86C7B1', '#EDC176', '#A78BFA'];

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

function formatChange(pct) {
  if (pct == null) return null;
  const sign = pct >= 0 ? '+' : '';
  return `${sign}${pct}%`;
}

export default function MetricsCards({ startDate, endDate }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboardStats', startDate, endDate],
    queryFn: () => getDashboardStats(startDate, endDate),
  });

  const data = response?.data;

  const metrics = [
    {
      label: 'Total Conversations',
      value: data?.total_conversations?.value ?? '—',
      change: formatChange(data?.total_conversations?.change_percent),
      positive: data?.total_conversations?.positive || false,
      spark: data?.total_conversations?.sparkline?.length ? data.total_conversations.sparkline : FALLBACK_SPARK,
      color: PALETTE[0],
    },
    {
      label: 'Calls Handled (Voice)',
      value: data?.calls_handled_voice?.value ?? '—',
      change: formatChange(data?.calls_handled_voice?.change_percent),
      positive: data?.calls_handled_voice?.positive || false,
      spark: data?.calls_handled_voice?.sparkline?.length ? data.calls_handled_voice.sparkline : FALLBACK_SPARK,
      color: PALETTE[1],
    },
    {
      label: 'Calls Handled (WebRTC)',
      value: data?.calls_handled_webrtc?.value ?? '—',
      change: formatChange(data?.calls_handled_webrtc?.change_percent),
      positive: data?.calls_handled_webrtc?.positive || false,
      spark: data?.calls_handled_webrtc?.sparkline?.length ? data.calls_handled_webrtc.sparkline : FALLBACK_SPARK,
      color: PALETTE[2],
    },
    {
      label: 'Avg. Resolution Time',
      value: data?.avg_resolution_time?.value ?? '—',
      change: formatChange(data?.avg_resolution_time?.change_percent),
      positive: data?.avg_resolution_time?.positive || false,
      spark: data?.avg_resolution_time?.sparkline?.length ? data.avg_resolution_time.sparkline : FALLBACK_SPARK,
      color: PALETTE[3],
    },
    {
      label: 'Total Minutes',
      value: data?.total_minutes?.value != null ? data.total_minutes.value.toFixed(1) : '—',
      change: formatChange(data?.total_minutes?.change_percent),
      positive: data?.total_minutes?.positive || false,
      spark: data?.total_minutes?.sparkline?.length ? data.total_minutes.sparkline : FALLBACK_SPARK,
      color: PALETTE[4],
    },
  ];


  return (
    <div className="row g-4">
      {metrics.map((m, i) => (
        <motion.div
          key={i}
          className="col-sm-6 col-xl"
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
