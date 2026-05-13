import React from 'react';
import MetricsCards from '../components/MetricsCards';
import CallVolumeChart from '../components/CallVolumeChart';
import HourlyAnalyticsChart from '../components/HourlyAnalyticsChart';
import SentimentBar from '../components/SentimentBar';
import WordBubble from '../components/WordBubble';
import HorizontalBar from '../components/HorizontalBar';
import CallLogTable from '../components/CallLogTable';
import TopKeyWords from '../components/TopKeyWords';

export default function DashboardHome() {
  return (
    <div className='container-fluid px-3'>
      {/* Metrics Row */}
      <div className="mb-5">
        <MetricsCards />
      </div>

      {/* Main Charts Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-6">
          <CallVolumeChart />
        </div>
        <div className="col-12 col-xl-6">
          <WordBubble />
        </div>



        <div className="col-12 col-xl-6">
          <SentimentBar />
        </div>
        
        <div className="col-12 col-xl-6">
          <TopKeyWords />
        </div>
      </div>

      {/* Analytics Insights Row */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-xl-12">
          <HourlyAnalyticsChart />
        </div>
      </div>

      {/* Topics & Classification Row */}
      <div className="row g-4 mb-5">
        
        <div className="col-12 col-lg-6">
          <HorizontalBar />
        </div>
        <div className="col-12 col-lg-6">
          <HorizontalBar />
        </div>
      </div>

      {/* Detailed Logs Section */}

      <div className="row g-4 mb-5">

        <div className="mt-5 pb-5 col-12 col-xl-8">
          <CallLogTable />
        </div>

        <div className="mt-5 pb-5 col-12 col-xl-4">
          <TopKeyWords />
        </div>
    </div>
  </div>
  );
}
