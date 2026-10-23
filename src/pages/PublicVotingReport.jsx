import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import { useVotesByCategory } from '../hooks/useQueries';
import CustomSelect from '../components/CustomSelect';
import '../styles/votingReport.css';

const fmt = (n) => Number(n || 0).toLocaleString('en-US');

const SORT_OPTIONS = [
  { value: 'votes', label: 'Most votes' },
  { value: 'close', label: 'Closest races' },
  { value: 'name', label: 'A to Z' },
];

const formatDay = (isoDate) =>
  new Date(`${isoDate}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

// How far ahead the leader is, in votes and as a share of the category's votes
const getLead = (category) => {
  const [first, second] = category.nominees;
  if (!first || first.votes === 0) return null;
  const gap = first.votes - (second?.votes || 0);
  return { gap, closeRace: category.totalVotes > 0 && gap / category.totalVotes < 0.05 };
};

const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay: i * 0.06, ease: [0.23, 1, 0.32, 1] },
});

function SummaryCards({ summary }) {
  const turnout = summary.verified > 0 ? Math.round((summary.voted / summary.verified) * 100) : 0;
  const cards = [
    { icon: 'bi-check2-square', label: 'Votes Cast', value: fmt(summary.totalVotes), sub: 'for the Top 5 finalists' },
    { icon: 'bi-people', label: 'People Who Voted', value: fmt(summary.voted), sub: `${turnout}% of verified phones` },
    { icon: 'bi-bar-chart-steps', label: 'Votes Per Person', value: summary.avgVotesPerVoter, sub: 'on average' },
    { icon: 'bi-hourglass-split', label: 'Verified, Not Voted', value: fmt(summary.verifiedNotVoted), sub: `${fmt(summary.verified)} verified in total` },
  ];

  return (
    <div className="row g-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          className="col-sm-6 col-lg-3"
          {...fadeUp(i)}
          whileHover={{ y: -3, transition: { duration: 0.18 } }}
        >
          <div className="card kpi-card h-100">
            <div className="kpi-card-body">
              <div className="kpi-icon-wrap kpi-icon-wrap--brand">
                <i className={`bi ${c.icon}`} />
              </div>
              <span className="kpi-label">{c.label}</span>
              <div className="kpi-value-row">
                <span className="kpi-value">{c.value}</span>
                <span className="kpi-sub">{c.sub}</span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Busiest day gets the darkest purple, the quietest the lightest, however many days there are
const SHADE_DARK = [41, 5, 94];
const SHADE_LIGHT = [221, 214, 254];
const shade = (rank, count) => {
  const t = count > 1 ? rank / (count - 1) : 0;
  const [r, g, b] = SHADE_DARK.map((c, i) => Math.round(c + (SHADE_LIGHT[i] - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
};

const formatShare = (votes, total) => {
  const pct = total > 0 ? (votes / total) * 100 : 0;
  if (pct > 0 && pct < 0.1) return '<0.1';
  return String(Math.round(pct * 10) / 10);
};

const RANGES = [
  { value: 5, label: '5 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 'all', label: 'All' },
];

// First calendar day (Pakistan time) inside a "last N days" window that ends today
const windowStart = (n) => {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - (n - 1));
  return d.toISOString().slice(0, 10);
};

const inRange = (rows, range) => (range === 'all' ? rows : rows.filter((r) => r.date >= windowStart(range)));
const rangeLabel = (range) => (range === 'all' ? 'the whole season' : `the last ${range} days`);

function RangeToggle({ range, onChange }) {
  return (
    <div className="vr-range" role="group" aria-label="Show votes for">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          className={`vr-range-btn ${range === r.value ? 'vr-range-btn--active' : ''}`}
          aria-pressed={range === r.value}
          onClick={() => onChange(r.value)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

function VotesPerDay({ allDays, range, onRangeChange }) {
  const chartRef = useRef(null);
  const days = inRange(allDays, range);
  const total = days.reduce((sum, d) => sum + d.votes, 0);
  const ranked = [...days].sort((a, b) => b.votes - a.votes);
  const peak = ranked[0];
  const periodLabel = rangeLabel(range);
  const colorOf = (date) => shade(ranked.findIndex((d) => d.date === date), ranked.length);
  // The list is capped in height and scrolls, newest day first
  const newestFirst = [...days].reverse();
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const option = {
    animation: !reduceMotion,
    tooltip: {
      trigger: 'item',
      confine: true,
      borderWidth: 0,
      textStyle: { fontFamily: 'Outfit, sans-serif', color: '#111827' },
      formatter: (p) => `<b>${p.name}</b><br/>${fmt(p.value)} votes (${formatShare(p.value, total)}%)`,
    },
    title: {
      text: fmt(total),
      subtext: 'votes in total',
      left: 'center',
      top: 'center',
      itemGap: 2,
      textStyle: { fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 700, color: '#111827' },
      subtextStyle: { fontFamily: 'Outfit, sans-serif', fontSize: 13, color: '#9CA3AF' },
    },
    series: [{
      type: 'pie',
      radius: ['62%', '88%'],
      center: ['50%', '50%'],
      startAngle: 90,
      avoidLabelOverlap: false,
      label: { show: false },
      labelLine: { show: false },
      itemStyle: { borderColor: '#F4F4F6', borderWidth: 3, borderRadius: 8 },
      emphasis: { scaleSize: 6 },
      data: days.map((d) => ({
        name: formatDay(d.date),
        value: d.votes,
        itemStyle: { color: colorOf(d.date) },
      })),
    }],
  };

  const highlight = (index, type) =>
    chartRef.current?.getEchartsInstance().dispatchAction({ type, seriesIndex: 0, dataIndex: index });

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="mb-0 insight-card-title">Votes Per Day</h6>
          <RangeToggle range={range} onChange={onRangeChange} />
        </div>

        {!days.length ? (
          <p className="mb-0 text-center py-5" style={{ color: '#9CA3AF', fontSize: '13px' }}>
            No votes in {periodLabel}.
          </p>
        ) : (

        <div className="row align-items-center g-4">
          <div className="col-12 col-md-5">
            <ReactECharts ref={chartRef} option={option} style={{ height: '260px' }} notMerge />
          </div>

          <div className="col-12 col-md-7">
            <p className="vr-insight">
              <strong>{formatDay(peak.date)}</strong> was the busiest day in {periodLabel}, with {formatShare(peak.votes, total)}% of its votes. Pakistan time.
            </p>
            <div className="d-flex flex-column gap-3 kpi-scroll-list vr-day-list" role="list">
              {newestFirst.map((d) => (
                <div
                  key={d.date}
                  role="listitem"
                  className="vr-day-row"
                  onMouseEnter={() => highlight(days.indexOf(d), 'highlight')}
                  onMouseLeave={() => highlight(days.indexOf(d), 'downplay')}
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="vr-day-name">
                      <span className="vr-day-dot" style={{ background: colorOf(d.date) }} />
                      {formatDay(d.date)}
                      {d.date === peak.date && <span className="vr-peak-tag">Busiest</span>}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba' }}>
                      {fmt(d.votes)}
                      <span className="kpi-sub ms-1" style={{ fontWeight: 400 }}>{formatShare(d.votes, total)}%</span>
                    </span>
                  </div>
                  <div className="gradient-progress-track" style={{ height: '6px' }}>
                    <div
                      className="gradient-progress-fill"
                      style={{ width: `${total > 0 ? (d.votes / total) * 100 : 0}%`, background: colorOf(d.date) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

const hourLabel = (h) => {
  const suffix = h < 12 ? 'am' : 'pm';
  return `${h % 12 === 0 ? 12 : h % 12} ${suffix}`;
};
const hourRange = (h) => `${hourLabel(h)} to ${hourLabel((h + 1) % 24)}`;

const LINE_FONT = { fontFamily: 'Outfit, sans-serif', color: '#9CA3AF', fontSize: 12 };

// Every hour from the first to the last hour that has votes, quiet hours filled in as 0
const fillHours = (rows) => {
  if (!rows.length) return [];
  const key = (r) => `${r.date} ${String(r.hour).padStart(2, '0')}`;
  const byKey = new Map(rows.map((r) => [key(r), r.votes]));
  const first = new Date(`${rows[0].date}T${String(rows[0].hour).padStart(2, '0')}:00:00Z`);
  const last = new Date(`${rows[rows.length - 1].date}T${String(rows[rows.length - 1].hour).padStart(2, '0')}:00:00Z`);
  const out = [];
  for (let t = first; t <= last; t = new Date(t.getTime() + 3600000)) {
    const iso = t.toISOString();
    const date = iso.slice(0, 10);
    const hour = Number(iso.slice(11, 13));
    out.push({ date, hour, votes: byKey.get(`${date} ${String(hour).padStart(2, '0')}`) || 0 });
  }
  return out;
};

const areaStyle = {
  color: {
    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: 'rgba(101, 16, 180, 0.28)' },
      { offset: 1, color: 'rgba(101, 16, 180, 0.02)' },
    ],
  },
};

function VotesByHour({ allHours, range, onRangeChange }) {
  const [view, setView] = useState('timeline');
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const rows = useMemo(() => inRange(allHours, range), [allHours, range]);
  const timeline = useMemo(() => fillHours(rows), [rows]);

  // Typical day: the same clock hour added up across every day in the period
  const profile = useMemo(() => {
    const byHour = Array.from({ length: 24 }, (_, h) => ({ hour: h, votes: 0 }));
    rows.forEach((r) => { byHour[r.hour].votes += r.votes; });
    return byHour;
  }, [rows]);
  const peak = profile.reduce((best, h) => (h.votes > best.votes ? h : best), profile[0]);
  const quiet = profile.reduce((low, h) => (h.votes < low.votes ? h : low), profile[0]);
  const periodLabel = rangeLabel(range);

  const common = {
    animation: !reduceMotion,
    grid: { left: 8, right: 16, top: 24, bottom: 12, containLabel: true },
    tooltip: {
      trigger: 'axis',
      confine: true,
      borderWidth: 0,
      textStyle: { fontFamily: 'Outfit, sans-serif', color: '#111827' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { ...LINE_FONT, formatter: (v) => (v >= 1000 ? `${v / 1000}k` : v) },
      splitLine: { lineStyle: { color: '#E5E7EB' } },
    },
  };
  const lineSeries = (data) => ({
    type: 'line',
    smooth: 0.3,
    showSymbol: false,
    symbolSize: 8,
    lineStyle: { width: 3, color: '#5006ba' },
    itemStyle: { color: '#5006ba' },
    areaStyle,
    data,
  });

  const timelineOption = {
    ...common,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: timeline.map((r) => `${r.date} ${r.hour}`),
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisTick: { show: false },
      // Only label midnight, so each day starts with its date
      axisLabel: {
        ...LINE_FONT,
        interval: 0,
        formatter: (value) => (value.endsWith(' 0') ? formatDay(value.slice(0, 10)) : ''),
      },
    },
    tooltip: {
      ...common.tooltip,
      formatter: (items) => {
        const r = timeline[items[0].dataIndex];
        return `<b>${formatDay(r.date)}, ${hourRange(r.hour)}</b><br/>${fmt(r.votes)} votes`;
      },
    },
    series: [lineSeries(timeline.map((r) => r.votes))],
  };

  const profileOption = {
    ...common,
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: profile.map((h) => hourLabel(h.hour)),
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisTick: { show: false },
      axisLabel: { ...LINE_FONT, interval: 2 },
    },
    tooltip: {
      ...common.tooltip,
      formatter: (items) => {
        const h = profile[items[0].dataIndex];
        return `<b>${hourRange(h.hour)}</b><br/>${fmt(h.votes)} votes in ${periodLabel}`;
      },
    },
    series: [{
      ...lineSeries(profile.map((h) => h.votes)),
      markPoint: {
        symbol: 'circle',
        symbolSize: 12,
        itemStyle: { color: '#5006ba', borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: [{ coord: [hourLabel(peak.hour), peak.votes] }],
      },
    }],
  };

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <h6 className="mb-0 insight-card-title">Votes By Hour</h6>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <div className="vr-range" role="group" aria-label="Choose a view">
              {[{ value: 'timeline', label: 'Day by day' }, { value: 'profile', label: 'Typical day' }].map((v) => (
                <button
                  key={v.value}
                  type="button"
                  className={`vr-range-btn ${view === v.value ? 'vr-range-btn--active' : ''}`}
                  aria-pressed={view === v.value}
                  onClick={() => setView(v.value)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <RangeToggle range={range} onChange={onRangeChange} />
          </div>
        </div>

        {!rows.length ? (
          <p className="mb-0 text-center py-5" style={{ color: '#9CA3AF', fontSize: '13px' }}>
            No votes in {periodLabel}.
          </p>
        ) : (
          <>
            <p className="vr-insight">
              {view === 'timeline'
                ? <>Each point is one hour of {periodLabel}, in Pakistan time. Each day starts at the date label.</>
                : <>Most votes come between <strong>{hourRange(peak.hour)}</strong> ({fmt(peak.votes)} votes). The quietest hour is <strong>{hourRange(quiet.hour)}</strong> ({fmt(quiet.votes)} votes).</>}
            </p>
            <ReactECharts
              option={view === 'timeline' ? timelineOption : profileOption}
              style={{ height: '280px' }}
              notMerge
            />
          </>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category }) {
  const lead = getLead(category);
  const top = category.nominees[0]?.votes || 0;

  return (
    <div className="card insight-card h-100">
      <div className="insight-card-body">
        <div className="d-flex align-items-start justify-content-between gap-3 mb-1">
          <h6 className="mb-0 insight-card-title">{category.name}</h6>
          <div className="text-end flex-shrink-0">
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#5006ba', lineHeight: 1.1 }}>{fmt(category.totalVotes)}</div>
            <div className="kpi-sub" style={{ fontSize: '11px' }}>votes</div>
          </div>
        </div>

        <div className="mb-3" style={{ fontSize: '13px', color: '#6B7280', minHeight: '20px' }}>
          {!lead && 'No votes yet'}
          {lead && !lead.closeRace && (
            <span><strong style={{ color: '#111827' }}>{category.nominees[0].name}</strong> leads by {fmt(lead.gap)} votes</span>
          )}
          {lead?.closeRace && (
            <span style={{ color: '#D97706', fontWeight: 600 }}>
              <i className="bi bi-lightning-charge-fill me-1" />Close race, only {fmt(lead.gap)} votes apart
            </span>
          )}
          {!category.active && (
            <span className="ms-2" style={{ color: '#9CA3AF' }}>(hidden from voters)</span>
          )}
        </div>

        {!category.nominees.length ? (
          <p className="mb-0 text-center py-3" style={{ color: '#9CA3AF', fontSize: '13px' }}>No finalists yet</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {category.nominees.map((n, i) => (
              <div key={n._id} className="d-flex align-items-center gap-3">
                <div className={`leaderboard-rank ${i === 0 && n.votes > 0 ? 'leaderboard-rank--gold' : 'leaderboard-rank--default'}`}
                  style={{ width: '30px', height: '30px', fontSize: '13px' }}>
                  {i + 1}
                </div>
                <div className="vr-avatar">
                  {n.profileImage ? <img src={n.profileImage} alt={n.name} /> : n.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-fill" style={{ minWidth: 0 }}>
                  <div className="d-flex align-items-baseline justify-content-between gap-2 mb-1">
                    <span className="vr-name">{n.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba', flexShrink: 0 }}>
                      {fmt(n.votes)}
                      <span className="kpi-sub ms-1" style={{ fontWeight: 400 }}>{n.share}%</span>
                    </span>
                  </div>
                  <div className="gradient-progress-track" style={{ height: '8px' }}>
                    <div
                      className={i === 0 && n.votes > 0 ? 'gradient-progress-fill' : 'gradient-progress-fill vr-fill-soft'}
                      style={{ width: `${top > 0 ? (n.votes / top) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReportSkeleton() {
  return (
    <div className="container-fluid px-3">
      <div className="row g-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-sm-6 col-lg-3">
            <div className="card kpi-card h-100">
              <div className="kpi-card-body">
                <div className="kpi-skel-icon" />
                <div className="kpi-skel-line" style={{ width: '60%' }} />
                <div className="kpi-skel-line" style={{ width: '40%', height: '20px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PublicVotingReport() {
  const { data, isLoading, isError, refetch } = useVotesByCategory();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('votes');
  const [range, setRange] = useState(7);

  const categories = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    const rows = data.categories.filter((c) => c.name.toLowerCase().includes(q));
    if (sort === 'name') return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'close') {
      // Closest races first; categories without votes go last
      const gapShare = (c) => {
        const lead = getLead(c);
        return lead && c.totalVotes > 0 ? lead.gap / c.totalVotes : Infinity;
      };
      return [...rows].sort((a, b) => gapShare(a) - gapShare(b));
    }
    return [...rows].sort((a, b) => b.totalVotes - a.totalVotes);
  }, [data, search, sort]);

  if (isLoading) return <ReportSkeleton />;

  if (isError || !data) {
    return (
      <div className="container-fluid px-3">
        <div className="card insight-card">
          <div className="insight-card-body text-center py-5">
            <i className="bi bi-exclamation-circle" style={{ fontSize: '2rem', color: '#D1D5DB', display: 'block', marginBottom: '8px' }} />
            <p style={{ color: '#9CA3AF', fontSize: '13px' }}>We could not load the voting report.</p>
            <button className="btn btn-sm" style={{ background: '#5006ba', color: '#fff', borderRadius: '8px' }} onClick={() => refetch()}>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3">
      <div className="mb-4">
        <h6 className="cat-form-title mb-1">Public Voting Report</h6>
        <p className="cat-form-subtitle mb-0">
          Season {data.season}. Updated at {new Date(data.generatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} and refreshes every minute.
        </p>
      </div>

      <div className="mb-4">
        <SummaryCards summary={data.summary} />
      </div>

      {data.perDay.length > 0 && (
        <motion.div className="mb-4" {...fadeUp(4)}>
          <VotesPerDay allDays={data.perDay} range={range} onRangeChange={setRange} />
        </motion.div>
      )}

      {data.perHour.length > 0 && (
        <motion.div className="mb-4" {...fadeUp(5)}>
          <VotesByHour allHours={data.perHour} range={range} onRangeChange={setRange} />
        </motion.div>
      )}

      <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
        <h6 className="clt-title">Votes in Each Category</h6>
        <div className="d-flex align-items-center gap-2">
          <div className="clt-search-wrap">
            <i className="bi bi-search clt-search-icon" />
            <input
              className="clt-search-input"
              placeholder="Search a category"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CustomSelect value={sort} onChange={setSort} options={SORT_OPTIONS} size="sm" align="right" searchable={false} />
        </div>
      </div>

      <div className="row g-4 mb-5">
        {categories.map((c, i) => (
          <motion.div key={c._id} className="col-12 col-xl-6" {...fadeUp(Math.min(i, 8))}>
            <CategoryCard category={c} />
          </motion.div>
        ))}
        {categories.length === 0 && (
          <div className="col-12 text-center py-4" style={{ color: '#9CA3AF', fontSize: '13px' }}>
            No category matches your search.
          </div>
        )}
      </div>
    </div>
  );
}
