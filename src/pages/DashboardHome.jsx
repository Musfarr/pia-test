import React from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import KpiCards from '../components/kpis/KpiCards';
import StageProgressBar from '../components/kpis/StageProgressBar';
import TopPerformersLeaderboard from '../components/kpis/TopPerformersLeaderboard';
import ScoringProgressGauges from '../components/kpis/ScoringProgressGauges';
import CategoryCoverageTable from '../components/kpis/CategoryCoverageTable';
import JuryActivityChart from '../components/kpis/JuryActivityChart';
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

      {/* Row 1: KPI Cards — unchanged */}
      <div className="mb-4">
        <KpiCards />
      </div>

      {/* Row 2: Stage progress bar — full width */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12" variants={colItem}>
          <StageProgressBar />
        </motion.div>
      </motion.div>

      {/* Row 3: Category coverage + Top performers */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12 col-lg-6" variants={colItem}>
          <CategoryCoverageTable />
        </motion.div>
        <motion.div className="col-12 col-lg-6" variants={colItem}>
          <TopPerformersLeaderboard />
        </motion.div>
      </motion.div>

      {/* Row 4: Jury needs attention + Scoring progress gauges */}
      <motion.div
        className="row g-4 mb-4"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        <motion.div className="col-12 col-lg-6" variants={colItem}>
          <JuryActivityChart />
        </motion.div>
        <motion.div className="col-12 col-lg-6" variants={colItem}>
          <ScoringProgressGauges />
        </motion.div>
      </motion.div>

      {/* Row 5: Jury table — unchanged */}
      <motion.div
        className="row g-4 mb-5"
        variants={rowContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <motion.div className="col-12" variants={colItem}>
          <JuryTable
            juries={juries}
            onDelete={handleDelete}
            onAssignCategory={handleAssignCategory}
            viewAllHref="/dashboard/jury"
            isLoading={isLoading}
          />
        </motion.div>
      </motion.div>

    </div>
  );
}
