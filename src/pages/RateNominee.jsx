import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useNominee, useMyScore } from '../hooks/useQueries';
import { saveJuryScore } from '../util/api';
import { JURY_CRITERIA, JURY_MAX_TOTAL, emptyCriteriaScores } from '../data/juryCriteria';
import PlatformDataView from '../components/PlatformDataView';

export default function RateNominee() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: nominee, isLoading: nomineeLoading } = useNominee(id);
  const { data: existingScore, isLoading: scoreLoading } = useMyScore(id);

  const [scores, setScores] = useState(emptyCriteriaScores());
  const [comments, setComments] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  // Hydrate form when existing score loads
  useEffect(() => {
    if (!scoreLoading && existingScore) {
      const next = emptyCriteriaScores();
      if (existingScore.criteriaScores) {
        for (const c of JURY_CRITERIA) {
          next[c.key] = Number(existingScore.criteriaScores[c.key]) || 0;
        }
      }
      setScores(next);
      setComments(existingScore.comments || '');
    }
  }, [scoreLoading, existingScore]);

  const totalScore = useMemo(
    () => JURY_CRITERIA.reduce((sum, c) => sum + (Number(scores[c.key]) || 0), 0),
    [scores]
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

  const totalColor = totalScore >= 80 ? '#059669' : totalScore >= 60 ? '#5006ba' : totalScore >= 40 ? '#D97706' : '#DC2626';

  return (
    <div className="container-fluid px-3">

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
                    Total
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: totalColor, lineHeight: 1 }}>
                    {totalScore}<span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 400 }}>/{JURY_MAX_TOTAL}</span>
                  </div>
                </div>
              </div>

              {scoreLoading ? (
                <div className="text-center py-4">
                  <output className="spinner-border text-primary"></output>
                </div>
              ) : (
                <>
                  {/* Sliders */}
                  <div className="d-flex flex-column gap-3">
                    {JURY_CRITERIA.map((c) => {
                      const value = Number(scores[c.key]) || 0;
                      const pct = (value / c.max) * 100;
                      return (
                        <div key={c.key}>
                          <div className="d-flex justify-content-between align-items-baseline mb-1">
                            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                              {c.label}
                              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400, marginLeft: '4px' }}>
                                / {c.max}
                              </span>
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#5006ba' }}>
                              {value}
                            </span>
                          </div>
                          <input
                            type="range"
                            className="form-range"
                            min={0}
                            max={c.max}
                            step={1}
                            value={value}
                            onChange={(e) => handleSliderChange(c.key, e.target.value)}
                            style={{
                              '--value-pct': `${pct}%`,
                              accentColor: '#5006ba',
                            }}
                          />
                          <p className="mb-0" style={{ fontSize: '11px', color: '#9CA3AF' }}>
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
                    disabled={saving}
                  >
                    {saving ? (
                      <><output className="spinner-border spinner-border-sm me-2"></output>Submitting…</>
                    ) : (
                      <><i className="bi bi-check-lg me-2"></i>Submit Score</>
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
