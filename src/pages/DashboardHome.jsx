import React from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import KpiCards from '../components/kpis/KpiCards';
import StageProgressBar from '../components/kpis/StageProgressBar';
import ShortlistStatusCards from '../components/kpis/ShortlistStatusCards';
import TopPerformersLeaderboard from '../components/kpis/TopPerformersLeaderboard';
import ScoringProgressGauges from '../components/kpis/ScoringProgressGauges';
import PlatformCompletenessBar from '../components/kpis/PlatformCompletenessBar';
import CategoryCoverageTable from '../components/kpis/CategoryCoverageTable';
import JuryActivityChart from '../components/kpis/JuryActivityChart';
import ScoreDistributionChart from '../components/kpis/ScoreDistributionChart';
import JuryTable from '../components/JuryTable';
import { useJuries } from '../hooks/useQueries';
import { deleteJury, assignJuryCategory } from '../util/api';

const rowContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const colItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.33, 1, 0.32, 1] } },
};

export default function DashboardHome() {
  const queryClient = useQueryClient();
  const { data: juries = [], isLoading } = useJuries();

  const handleDelete = async (id) => {
    try {
      await deleteJury(id);
      queryClient.invalidateQueries({ queryKey: ['juries'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete jury member');
    }
  };

  const handleAssignCategory = async (id, category) => {
    try {
      await assignJuryCategory(id, category);
      queryClient.invalidateQueries({ queryKey: ['juries'] });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign category');
    }
  };

  return (
    <div className='container-fluid px-3'>

      {/* KPI Row — live, role-aware platform stats */}
      <div className="mb-4">
        <KpiCards />
      </div>

      {/* Platform stage progress */}
      {/* <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12" variants={colItem}>
          <StageProgressBar />
        </motion.div>
      </motion.div> */}

      {/* Shortlist status + Top performers */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
         <motion.div className="col-6 col-xxl-6" variants={colItem}>
          <CategoryCoverageTable />
        </motion.div>
        <motion.div className="col-6 col-xxl-6" variants={colItem}>
          <TopPerformersLeaderboard />
        </motion.div>
      </motion.div>

      {/* Scoring progress gauges + Platform data completeness */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {/* <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <ScoringProgressGauges />
        </motion.div> */}
        {/* <motion.div className="col-12 col-xxl-6" variants={colItem}>
          <PlatformCompletenessBar />
        </motion.div> */}
      </motion.div>

      {/* Per-category coverage + Jury activity */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
       
        <motion.div className="col-6 col-xxl-6" variants={colItem}>
          <JuryActivityChart />
        </motion.div>

        <motion.div className="col-6" variants={colItem}>
          <ScoreDistributionChart />
        </motion.div>
      </motion.div>

      {/* Score distribution */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        
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
            isLoading={isLoading}
          />
        </motion.div>
        {/* <div className="col-12 col-xl-4">
          <TopKeyWords variant="status" />
        </div> */}
      </motion.div>

    </div>
  );
}
