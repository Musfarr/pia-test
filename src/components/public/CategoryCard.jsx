import React from 'react';
import { motion } from 'framer-motion';

export default function CategoryCard({ category, index, onClick }) {
  const name = category.name || 'Unknown';
  const initial = name.charAt(0).toUpperCase();
  const hasVoted = category.hasVoted;

  // Fallback image — initials tile
  const fallbackImage = `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="300" height="400" fill="#d4d4d8"/><text x="50%" y="50%" font-size="120" font-weight="bold" fill="#9CA3AF" text-anchor="middle" dy=".35em">${initial}</text></svg>`
  )}`;

  return (
    <motion.div
      className="pv-cat-card"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      <img src={fallbackImage} alt={name} onError={(e) => { e.target.src = fallbackImage; }} />
      <div className="pv-cat-overlay">
        <div className="pv-cat-name">{name}</div>
      </div>
      <div className={`pv-cat-badge ${hasVoted ? 'pv-cat-badge--voted' : 'pv-cat-badge--open'}`}>
        {hasVoted ? (
          <><i className="bi bi-check-circle-fill me-1"></i>Voted</>
        ) : (
          <>Vote</>
        )}
      </div>
    </motion.div>
  );
}
