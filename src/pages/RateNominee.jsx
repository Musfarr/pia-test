import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNominee, useMyScore, useSettings } from '../hooks/useQueries';
import { useAuth } from '../context/AuthProvider';
import { normalizeRole } from '../util/roles';
import { saveJuryScore } from '../util/api';
import { getCriteriaForRole, ROLE_TO_STAGE, getMaxPointsForRole, emptyCriteriaScores } from '../data/juryCriteria';
import PlatformDataView from '../components/PlatformDataView';

// Maps juror role to the platform stage that must be active for scoring
const REQUIRED_STAGE = {
  creator_jury: 'creator_rating',
  executive_jury: 'executive_rating',
};

export default function RateNominee() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const { data: nominee, isLoading: nomineeLoading } = useNominee(id);
  const { data: existingScore, isLoading: scoreLoading } = useMyScore(id);
  const { data: settings } = useSettings();

  const requiredStage = REQUIRED_STAGE[role];
  const currentStage = settings?.currentStage || 'setup';
  const scoringOpen = requiredStage && currentStage === requiredStage;

  // Role-specific criteria + scoring stage
  const scoringStage = ROLE_TO_STAGE[role];
  const criteria = getCriteriaForRole(role);
  const stageMaxPoints = getMaxPointsForRole(role);

  const [scores, setScores] = useState(() => emptyCriteriaScores(scoringStage));
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  // Hydrate form when existing score loads
  useEffect(() => {
    if (!scoreLoading && existingScore) {
      const next = emptyCriteriaScores(scoringStage);
      if (existingScore.criteriaScores) {
        for (const c of criteria) {
          next[c.key] = Number(existingScore.criteriaScores[c.key]) || 0;
        }
      }
      setScores(next);
      setComments(existingScore.comments || '');
    }
  }, [scoreLoading, existingScore, scoringStage, criteria]);

  // Avg of raw scores (0-100) — shown to the juror as their overall rating
  const avgScore = useMemo(
    () => criteria.length
      ? criteria.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0) / criteria.length
      : 0,
    [scores, criteria]
  );

  // Weighted total (the juror's contribution toward the final 100-point total)
  const weightedTotal = useMemo(
    () => criteria.reduce(
      (sum, c) => sum + ((Number(scores[c.key]) || 0) / 100) * c.maxPoints,
      0
    ),
    [scores, criteria]
  );

  const handleSliderChange = (key, value) => {
    setScores((prev) => ({ ...prev, [key]: Number(value) }));
    setSavedMsg('');
  };

  const handleSubmit = async () => {
    setError('');
    setSaving(true);
    try {
      await saveJuryScore({
        nomineeId: id,
        criteriaScores: scores,
        comments,
      });
      queryClient.invalidateQueries({ queryKey: ['my-score', id] });
      queryClient.invalidateQueries({ queryKey: ['my-nominees'] });
      setSavedMsg('Score submitted successfully');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit score');
    } finally {
      setSaving(false);
    }
  };

  if (nomineeLoading) {
    return (
      <div className="container-fluid px-3">
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
        </div>
      </div>
    );
  }

  const avgColor = avgScore >= 80 ? '#059669' : avgScore >= 60 ? '#5006ba' : avgScore >= 40 ? '#D97706' : '#DC2626';

  return (
    <div className="container-fluid px-3">

      {/* Scoring closed banner */}
      {!scoringOpen && requiredStage && (
        <motion.div
          className="alert d-flex align-items-center gap-2 mb-3"
          style={{
            borderRadius: '12px', fontSize: '13px',
            background: '#FEF3C7', color: '#92400E', border: '1px solid #FDE68A', padding: '12px 16px',
          }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <i className="bi bi-lock-fill" style={{ fontSize: '16px' }}></i>
          <span>
            Scoring is currently <strong>closed</strong>. The platform is in the{' '}
            <strong>{currentStage.replace(/_/g, ' ')}</strong> stage.
            Your role can only score during the <strong>{requiredStage.replace(/_/g, ' ')}</strong> stage.
            You can review the nominee's data but cannot submit scores right now.
          </span>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <Link to=".." relative="path" className="clt-action-btn" title="Back">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h6 className="cat-form-title mb-1">Rate: {nominee?.name || 'Nominee'}</h6>
              <p className="cat-form-subtitle mb-0">
                {nominee?.categoryId?.name && (
                  <span className="clt-badge me-2" style={{ backgroundColor: '#EEF4FF', color: '#5006ba' }}>
                    {nominee.categoryId.name}
                  </span>
                )}
                {nominee?.season && (
                  <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
                    Season {nominee.season}
                  </span>
                )}
              </p>
            </div>
          </div>
          {existingScore?.submittedAt && (
            <span className="clt-badge" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
              <i className="bi bi-check-circle me-1"></i>
              Submitted {new Date(existingScore.submittedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </motion.div>

      <div className="row g-4">
        {/* Left: nominee platform data (read-only) */}
        <div className="col-12 col-lg-7">
          <PlatformDataView nomineeId={id} />
        </div>

        {/* Right: scoring panel */}
        <div className="col-12 col-lg-5">
          <motion.div
            className="card clt-card"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="cat-form-title mb-0">
                  <i className="bi bi-star me-2"></i>Scoring Rubric
                </h6>
                <div className="text-end">
                  <div style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Avg Score
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: avgColor, lineHeight: 1 }}>
                    {Math.round(avgScore)}<span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 400 }}>/100</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>
                    Weighted: {weightedTotal.toFixed(1)}/{stageMaxPoints}
                  </div>
                </div>
              </div>

              {scoreLoading ? (
                <div className="text-center py-4">
                  <output className="spinner-border text-primary"></output>
                </div>
              ) : (
                <>
                  {/* Sliders — each criterion scored 0-100, step 10 */}
                  <div className="d-flex flex-column gap-3">
                    {criteria.map((c) => {
                      const value = Number(scores[c.key]) || 0;
                      const pct = value; // 0-100 scale
                      return (
                        <div key={c.key}>
                          <div className="d-flex justify-content-between align-items-baseline mb-1">
                            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                              {c.label}
                              {/* <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400, marginLeft: '4px' }}>
                                (max {c.maxPoints} pts)
                              </span> */}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba' }}>
                              {value}
                            </span>
                          </div>
                          <input
                            type="range"
                            className="form-range"
                            min={0}
                            max={100}
                            step={10}
                            value={value}
                            disabled={!scoringOpen}
                            onChange={(e) => handleSliderChange(c.key, e.target.value)}
                            style={{
                              '--value-pct': `${pct}%`,
                              accentColor: '#5006ba',
                              opacity: scoringOpen ? 1 : 0.6,
                            }}
                          />
                          <p className="mb-0" style={{ fontSize: '14px', color: '#9CA3AF' }}>
                            {c.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Comments */}
                  <div className="cat-form-field mt-4">
                    <label className="cat-form-label d-block mb-2">Comments (optional)</label>
                    <textarea
                      className="cat-form-input"
                      rows={3}
                      placeholder="Notes about this nominee's performance…"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Status + submit */}
                  {error && (
                    <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '13px' }}>
                      {error}
                    </div>
                  )}
                  {savedMsg && (
                    <div className="alert alert-success py-2 mt-3 mb-0" style={{ fontSize: '13px' }}>
                      <i className="bi bi-check-lg me-1"></i>{savedMsg}
                    </div>
                  )}
                  <button
                    type="button"
                    className="cat-form-submit mt-3"
                    onClick={handleSubmit}
                    disabled={saving || !scoringOpen}
                    style={!scoringOpen ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                  >
                    {saving ? (
                      <><output className="spinner-border spinner-border-sm me-2"></output>Submitting…</>
                    ) : scoringOpen ? (
                      <><i className="bi bi-check-lg me-2"></i>Submit Score</>
                    ) : (
                      <><i className="bi bi-lock me-2"></i>Scoring Closed</>
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
