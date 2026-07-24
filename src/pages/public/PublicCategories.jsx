import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePublicCategories } from '../../hooks/usePublicQueries';
import CategoryCard from '../../components/public/CategoryCard';

export default function PublicCategories() {
  const navigate = useNavigate();
  const { data, isLoading } = usePublicCategories();

  const categories = data?.categories || [];
  const currentStage = data?.currentStage || 'setup';
  const votedCount = categories.filter((c) => c.hasVoted).length;
  const totalCount = categories.length;
  const progressPct = totalCount ? (votedCount / totalCount) * 100 : 0;

  // Stage gate — before public_voting
  const stageOrder = ['setup', 'creator_rating', 'executive_rating', 'public_voting', 'completed'];
  const stageIdx = stageOrder.indexOf(currentStage);

  if (isLoading) {
    return (
      <div className="pv-cat-grid">
        {[1,2,3,4].map((i) => (
          <div key={i} className="pv-skel" style={{ aspectRatio: '3/4' }} />
        ))}
      </div>
    );
  }

  // Stage gate: voting not yet open
  if (stageIdx < stageOrder.indexOf('public_voting')) {
    return (
      <motion.div
        className="pv-gate"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <i className="bi bi-hourglass-split pv-gate-icon"></i>
        <h2 className="pv-gate-title">Voting Opens Soon</h2>
        <p className="pv-gate-text">
          The public voting stage hasn't started yet. Check back soon to vote for your favorite influencers!
        </p>
      </motion.div>
    );
  }

  // Stage gate: voting closed
  if (currentStage === 'completed') {
    return (
      <motion.div
        className="pv-gate"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <i className="bi bi-flag-fill pv-gate-icon"></i>
        <h2 className="pv-gate-title">Voting Has Closed</h2>
        <p className="pv-gate-text">
          Thanks for voting — results coming soon!
        </p>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Progress strip */}
      <motion.div
        className="pv-progress-strip"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="pv-progress-text">
          {votedCount} of {totalCount} categories voted
        </div>
        <div className="pv-progress-bar">
          <div className="pv-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </motion.div>

      {/* Category grid */}
      <div className="pv-cat-grid">
        {categories.map((cat, i) => (
          <CategoryCard
            key={cat._id}
            category={cat}
            index={i}
            onClick={() => navigate(`/vote/category/${cat._id}`)}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="pv-gate">
          <i className="bi bi-inbox pv-gate-icon"></i>
          <h2 className="pv-gate-title">No Categories Yet</h2>
          <p className="pv-gate-text">Categories will appear here once they're set up.</p>
        </div>
      )}
    </div>
  );
}
