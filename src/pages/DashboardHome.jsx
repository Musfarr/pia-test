import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MetricsCards from '../components/MetricsCards';
import CallVolumeChart from '../components/CallVolumeChart';
import SentimentBar from '../components/SentimentBar';
import WordBubble from '../components/WordBubble';
import HorizontalBar from '../components/HorizontalBar';
import JuryTable from '../components/JuryTable';
import TopKeyWords from '../components/TopKeyWords';
import { juries as initialJuries } from '../data/dashboardData';

const rowContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const colItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.33, 1, 0.32, 1] } },
};

export default function DashboardHome() {
  const [juries, setJuries] = useState(initialJuries);

  const handleDelete = (id) => {
    setJuries((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAssignCategory = (id, category) => {
    setJuries((prev) => prev.map((item) => (item.id === id ? { ...item, category } : item)));
  };

  return (
    <div className='container-fluid px-3'>

      {/* Metrics Row — internal card stagger handled inside MetricsCards */}
      <div className="mb-4">
        <MetricsCards />
      </div>

      {/* Conversations Trend + Channel Distribution */}
      {/* <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <CallVolumeChart />
        </motion.div>
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <WordBubble />
        </motion.div>
      </motion.div> */}

      {/* AI Performance + Sentiment Analytics */}
      {/* <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <SentimentBar />
        </motion.div>
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <TopKeyWords variant="sentiment" />
        </motion.div>
      </motion.div> */}

      {/* Top Intents + Resolution Rate */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <HorizontalBar variant="intents" />
        </motion.div>
        <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <HorizontalBar variant="gauge" />
        </motion.div>
      </motion.div>

      {/* AI Performance Table */}
      <motion.div
        className="row g-4 mb-5"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div className="col-12 col-xl-12" variants={colItem}>
          <JuryTable
            juries={juries}
            onDelete={handleDelete}
            onAssignCategory={handleAssignCategory}
            viewAllHref="/dashboard/jury"
          />
        </motion.div>
        {/* <div className="col-12 col-xl-4">
          <TopKeyWords variant="status" />
        </div> */}
      </motion.div>

    </div>
  );
}
