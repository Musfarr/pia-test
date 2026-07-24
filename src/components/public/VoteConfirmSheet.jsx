import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoteConfirmSheet({ open, nominee, categoryName, loading, error, onConfirm, onCancel }) {
  const name = nominee?.name || '';
  const initial = name.charAt(0).toUpperCase();
  const profileImage = nominee?.profileImage;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="pv-sheet-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="pv-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pv-sheet-handle" />

            <div className="pv-sheet-avatar">
              {profileImage ? <img src={profileImage} alt={name} /> : initial}
            </div>

            <h3 className="pv-sheet-title">{name}</h3>
            <p className="pv-sheet-text">
              Confirm your vote for <strong>{name}</strong> in <strong>{categoryName}</strong>.
              <br />This cannot be changed.
            </p>

            {error && (
              <div className="pv-error" style={{ marginBottom: '16px' }}>
                <i className="bi bi-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}

            <div className="pv-sheet-btns">
              <button className="pv-btn-ghost" onClick={onCancel} disabled={loading}>
                Cancel
              </button>
              <button className="pv-btn-primary" onClick={onConfirm} disabled={loading}>
                {loading ? (
                  <><output className="spinner-border spinner-border-sm me-2"></output>Confirming…</>
                ) : 'Confirm Vote'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
