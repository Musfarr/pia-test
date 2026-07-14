import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { dashboardMetrics } from '../data/dashboardData';

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

export default function MetricsCards() {
  return (
    <div className="row g-4">
      {dashboardMetrics.map((m, i) => (
        <motion.div
          key={i}
          className="col-sm-6 col-lg-4 col-xxl"
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
                    {m.value}
                  </span>
                  {/* <span className={`metrics-card-badge ${m.positive ? 'positive' : 'negative'}`}>
                    {m.change}
                  </span> */}
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
