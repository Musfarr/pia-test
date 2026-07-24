import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicShortlist, useCastVote } from '../../hooks/usePublicQueries';
import NomineeVoteCard from '../../components/public/NomineeVoteCard';
import VoteConfirmSheet from '../../components/public/VoteConfirmSheet';
import VoteSuccessOverlay from '../../components/public/VoteSuccessOverlay';

export default function PublicCategoryShortlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = usePublicShortlist(id);
  const voteMutation = useCastVote();

  const [selectedId, setSelectedId] = useState(null);
  const [showSheet, setShowSheet] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [voteError, setVoteError] = useState('');

  const category = data?.category || {};
  const nominees = data?.nominees || [];
  const hasVoted = data?.hasVoted || false;
  const votedNomineeId = data?.votedNomineeId || null;
  const currentStage = data?.currentStage || 'setup';

  const selectedNominee = nominees.find((n) => n._id === selectedId);
  const votedNominee = nominees.find((n) => String(n._id) === String(votedNomineeId));

  // Reset selection when data changes
  useEffect(() => {
    setSelectedId(null);
    setShowSheet(false);
    setVoteError('');
  }, [id]);

  const handleSelect = (nomineeId) => {
    setSelectedId(nomineeId);
  };

  const handleConfirm = async () => {
    setVoteError('');
    try {
      await voteMutation.mutateAsync({ categoryId: id, nomineeId: selectedId });
      setShowSheet(false);
      setShowSuccess(true);
      // Auto-dismiss after 1.4s → back to categories
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/vote');
      }, 1400);
    } catch (err) {
      setVoteError(err.response?.data?.message || 'Failed to submit vote');
    }
  };

  if (isLoading) {
    return (
      <div className="pv-nominee-list">
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="pv-skel" style={{ height: '72px' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header with back button */}
      <div className="pv-section-header">
        <button className="pv-back-btn" onClick={() => navigate('/vote')}>
          <i className="bi bi-chevron-left"></i>
        </button>
        <div>
          <h2 className="pv-section-title">{category.name || 'Category'}</h2>
          <p className="pv-section-sub">Pick your favorite — you can only vote once.</p>
        </div>
      </div>

      {/* Already voted banner */}
      {hasVoted && (
        <div className="pv-banner pv-banner--locked">
          <i className="bi bi-check-circle-fill"></i>
          <span>You already voted in this category. Your vote: <strong>{votedNominee?.name || '—'}</strong></span>
        </div>
      )}

      {/* Stage not open banner */}
      {currentStage !== 'public_voting' && !hasVoted && (
        <div className="pv-banner pv-banner--info">
          <i className="bi bi-info-circle-fill"></i>
          <span>Voting is not currently open for this category.</span>
        </div>
      )}

      {/* Nominee list */}
      <div className="pv-nominee-list">
        {nominees.map((nominee, i) => (
          <NomineeVoteCard
            key={nominee._id}
            nominee={nominee}
            index={i}
            selected={selectedId === nominee._id}
            voted={String(votedNomineeId) === String(nominee._id)}
            locked={hasVoted && String(votedNomineeId) !== String(nominee._id)}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {nominees.length === 0 && (
        <div className="pv-gate">
          <i className="bi bi-inbox pv-gate-icon"></i>
          <h2 className="pv-gate-title">Shortlist Not Ready</h2>
          <p className="pv-gate-text">The shortlist for this category isn't ready yet. Check back soon.</p>
        </div>
      )}

      {/* Sticky bottom action bar — only when a selection is made and not yet voted */}
      <AnimatePresence>
        {selectedId && !hasVoted && !showSheet && (
          <motion.div
            className="pv-action-bar"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="pv-action-info">
              <div className="pv-action-avatar">
                {selectedNominee?.profileImage ? (
                  <img src={selectedNominee.profileImage} alt="" />
                ) : (
                  selectedNominee?.name?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <span className="pv-action-name">{selectedNominee?.name}</span>
            </div>
            <button className="pv-action-btn" onClick={() => setShowSheet(true)}>
              Confirm Vote
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation bottom sheet */}
      <VoteConfirmSheet
        open={showSheet}
        nominee={selectedNominee}
        categoryName={category.name}
        loading={voteMutation.isPending}
        error={voteError}
        onConfirm={handleConfirm}
        onCancel={() => { setShowSheet(false); setVoteError(''); }}
      />

      {/* Success overlay */}
      <AnimatePresence>
        {showSuccess && (
          <VoteSuccessOverlay
            nomineeName={selectedNominee?.name}
            categoryName={category.name}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
