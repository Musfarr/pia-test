import React from 'react';
import { motion } from 'framer-motion';
import athleteIcon from '../../assets/caticon/athlete.webp';
import automotiveIcon from '../../assets/caticon/automotive.webp';
import instagramIcon from '../../assets/caticon/instagram-creator.webp';
import youtubeIcon from '../../assets/caticon/youtube-creator.webp';

const CAT_ICONS = [athleteIcon, automotiveIcon, instagramIcon, youtubeIcon];

export default function CategoryCard({ category, index, onClick }) {
  const name = category.name || 'Unknown';
  const hasVoted = category.hasVoted;

  // Deterministic icon based on index — stable across re-renders
  const icon = CAT_ICONS[index % CAT_ICONS.length];

  return (
    <motion.div
      className={`pv-cat-card ${hasVoted ? 'pv-cat-card--voted' : ''}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.23, 1, 0.32, 1] }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
    >
      {/* Category icon */}
      <div className="pv-cat-icon">
        <img src={icon} alt={name} />
      </div>

      {/* Category name */}
      <div className="pv-cat-name">{name}</div>

      {/* Status tag */}
      <div className={`pv-cat-tag ${hasVoted ? 'pv-cat-tag--voted' : 'pv-cat-tag--open'}`}>
        {hasVoted ? (
          <><i className="bi bi-check-circle-fill"></i>Voted</>
        ) : (
          <><i className="bi bi-chevron-right"></i>Vote</>
        )}
      </div>
    </motion.div>
  );
}
