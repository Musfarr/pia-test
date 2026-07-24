import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMyVotes, usePublicCategories } from '../../hooks/usePublicQueries';

export default function PublicMyVotes() {
  const navigate = useNavigate();
  const { data: votesData, isLoading: votesLoading } = useMyVotes();
  const { data: catData } = usePublicCategories();

  const votes = votesData?.votes || [];
  const categories = catData?.categories || [];

  // Build a map of voted categories
  const votedMap = new Map(votes.map((v) => [String(v.category?._id), v]));

  // All categories — voted ones show the nominee, unvoted show "Not voted yet"
  const rows = categories.map((cat) => {
    const vote = votedMap.get(String(cat._id));
    return { category: cat, vote };
  });

  if (votesLoading) {
    return (
      <div className="pv-votes-list">
        {[1,2,3,4].map((i) => (
          <div key={i} className="pv-skel" style={{ height: '80px' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="pv-section-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 className="pv-section-title">My Votes</h2>
          <p className="pv-section-sub">{votes.length} of {categories.length} categories voted</p>
        </div>
      </div>

      <div className="pv-votes-list">
        {rows.map((row, i) => {
          const cat = row.category;
          const vote = row.vote;
          const nomineeName = vote?.nominee?.name || '';
          const initial = nomineeName.charAt(0).toUpperCase();
          const profileImage = vote?.nominee?.profileImage;

          return (
            <motion.div
              key={cat._id}
              className={`pv-vote-row ${!vote ? 'pv-vote-row--pending' : ''}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
            >
              <div className="pv-vote-avatar">
                {vote ? (
                  profileImage ? <img src={profileImage} alt={nomineeName} /> : initial
                ) : (
                  <i className="bi bi-clock"></i>
                )}
              </div>
              <div className="pv-vote-info">
                <div className="pv-vote-cat">{cat.name}</div>
                {vote ? (
                  <>
                    <div className="pv-vote-name">{nomineeName}</div>
                    <div className="pv-vote-time">
                      {new Date(vote.votedAt).toLocaleDateString()} {new Date(vote.votedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </>
                ) : (
                  <div className="pv-vote-name" style={{ color: '#9CA3AF' }}>Not voted yet</div>
                )}
              </div>
              {!vote && (
                <a href={`/vote/category/${cat._id}`} className="pv-vote-link" onClick={(e) => { e.preventDefault(); navigate(`/vote/category/${cat._id}`); }}>
                  Vote now
                </a>
              )}
            </motion.div>
          );
        })}
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
