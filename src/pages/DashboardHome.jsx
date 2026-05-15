import React from 'react';
import MetricsCards from '../components/MetricsCards';
import CallVolumeChart from '../components/CallVolumeChart';
import SentimentBar from '../components/SentimentBar';
import WordBubble from '../components/WordBubble';
import HorizontalBar from '../components/HorizontalBar';
import CallLogTable from '../components/CallLogTable';
import TopKeyWords from '../components/TopKeyWords';

export default function DashboardHome() {
  return (
    <div className='container-fluid px-3'>

      {/* Metrics Row */}
      <div className="mb-4">
        <MetricsCards />
      </div>

      {/* Conversations Trend + Channel Distribution */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <CallVolumeChart />
        </div>
        <div className="col-12 col-xl-6">
          <WordBubble />
        </div>
      </div>

      {/* AI Performance + Sentiment Analytics */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <SentimentBar />
        </div>
        <div className="col-12 col-xl-6">
          <TopKeyWords variant="sentiment" />
        </div>
      </div>

      {/* Top Intents + Resolution Rate */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-6">
          <HorizontalBar variant="intents" />
        </div>
        <div className="col-12 col-lg-6">
          <HorizontalBar variant="gauge" />
        </div>
      </div>

      {/* AI Performance Table + Status Widget */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-12">
          <CallLogTable />
        </div>
        {/* <div className="col-12 col-xl-4">
          <TopKeyWords variant="status" />
        </div> */}
      </div>

    </div>
  );
}
