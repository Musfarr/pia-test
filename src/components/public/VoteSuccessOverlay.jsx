import React from 'react';
import { motion } from 'framer-motion';

export default function VoteSuccessOverlay({ nomineeName, categoryName }) {
  return (
    <motion.div
      className="pv-success-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
      >
        <i className="bi bi-check-circle-fill pv-success-icon"></i>
      </motion.div>
      <motion.h2
        className="pv-success-title"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Vote Submitted!
      </motion.h2>
      <motion.p
        className="pv-success-sub"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        You voted for {nomineeName} in {categoryName}
      </motion.p>
    </motion.div>
  );
}
