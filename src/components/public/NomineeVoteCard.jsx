import React from 'react';
import { motion } from 'framer-motion';

export default function NomineeVoteCard({ nominee, index, selected, voted, locked, onSelect }) {
  const name = nominee.name || 'Unknown';
  const initial = name.charAt(0).toUpperCase();
  const profileImage = nominee.profileImage;

  const cardClass = [
    'pv-nominee-card',
    selected ? 'pv-nominee-card--selected' : '',
    voted ? 'pv-nominee-card--voted' : '',
    locked ? 'pv-nominee-card--locked' : '',
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={cardClass}
      role="radio"
      aria-checked={selected || voted}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.23, 1, 0.32, 1] }}
      whileTap={!locked && !voted ? { scale: 0.98 } : undefined}
      onClick={() => !locked && !voted && onSelect(nominee._id)}
    >
      <div className="pv-nominee-avatar">
        {profileImage ? (
          <img src={profileImage} alt={name} />
        ) : (
          initial
        )}
      </div>
      <div className="pv-nominee-info">
        <div className="pv-nominee-name">{name}</div>
        {voted && <div className="pv-nominee-sub" style={{ color: '#059669' }}>Your Vote</div>}
      </div>
      <div className="pv-nominee-check">
        {(selected || voted) && <i className={`bi ${voted ? 'bi-check-lg' : 'bi-check'}`}></i>}
      </div>
    </motion.div>
  );
}
