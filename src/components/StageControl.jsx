import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateCategoryStage } from '../hooks/useQueries';

// Stage definitions — must match backend STAGE_ORDER
const STAGES = [
  { key: 'setup', label: 'Setup', icon: 'bi-gear', color: '#6B7280' },
  { key: 'creator_rating', label: 'Creator Jury Rating', icon: 'bi-pencil-square', color: '#5006ba' },
  { key: 'executive_rating', label: 'Executive Jury Rating', icon: 'bi-award', color: '#D97706' },
  { key: 'public_voting', label: 'Public Voting', icon: 'bi-people', color: '#059669' },
  { key: 'completed', label: 'Completed', icon: 'bi-check-circle', color: '#2563EB' },
];

const STAGE_KEYS = STAGES.map((s) => s.key);

/**
 * Reusable stage control widget.
 * Shows the current stage as a stepper + an "Advance" button to move to the next stage.
 * Also allows jumping to a specific stage via the stepper dots.
 *
 * Props:
 *   category — the category object (must have _id and stage)
 *   compact  — if true, renders a smaller inline variant
 */
export default function StageControl({ category, compact = false }) {
  const queryClient = useQueryClient();
  const updateStage = useUpdateCategoryStage();
  const [error, setError] = useState('');

  if (!category) return null;

  const currentIdx = STAGE_KEYS.indexOf(category.stage);
  const isLast = currentIdx === STAGES.length - 1;
  const currentStage = STAGES[currentIdx] || STAGES[0];

  const handleAdvance = async () => {
    if (isLast) return;
    const nextStage = STAGE_KEYS[currentIdx + 1];
    setError('');
    try {
      await updateStage.mutateAsync({ id: category._id, stage: nextStage });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['my-category'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const handleJumpTo = async (stage) => {
    if (stage === category.stage) return;
    setError('');
    try {
      await updateStage.mutateAsync({ id: category._id, stage });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['my-category'] });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
    }
  };

  if (compact) {
    return (
      <div className="d-fex align-items-center gap-2 flx-wrap">
        <span className="clt-badge" style={{ backgroundColor: `${currentStage.color}15`, color: currentStage.color }}>
          <i className={`bi ${currentStage.icon} me-1`}></i>
          {currentStage.label}
        </span>
        {/* {!isLast && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={handleAdvance}
            disabled={updateStage.isPending}
            style={{ borderRadius: '8px', fontSize: '13px' }}
          >
            {updateStage.isPending ? '...' : (<><i className="bi bi-arrow-right me-1"></i>Advance to {STAGES[currentIdx + 1].label}</>)}
          </button>
        )} */}
        {error && <span style={{ color: '#DC2626', fontSize: '12px' }}>{error}</span>}
      </div>
    );
  }

  return (
    <div>
      {/* Stepper */}
      <div className="d-flex align-items-center gap-1 flex-wrap mb-3">
        {STAGES.map((s, i) => {
          const isCurrent = i === currentIdx;
          const isPast = i < currentIdx;
          return (
            <React.Fragment key={s.key}>
              <button
                type="button"
                onClick={() => handleJumpTo(s.key)}
                disabled={updateStage.isPending}
                className="btn btn-sm p-0 border-0 bg-transparent"
                title={`Set stage: ${s.label}`}
                style={{ outline: 'none' }}
              >
                <span
                  className="d-flex align-items-center gap-1 px-2 py-1"
                  style={{
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? s.color : isPast ? '#9CA3AF' : '#D1D5DB',
                    background: isCurrent ? `${s.color}10` : 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <i className={`bi ${s.icon}`}></i>
                  {!compact && s.label}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <div style={{ width: '20px', height: '2px', background: isPast ? s.color : '#E5E7EB' }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Advance button */}
      <div className="d-flex align-items-center gap-3">
        {!isLast ? (
          <button
            type="button"
            className="cat-form-submit"
            onClick={handleAdvance}
            disabled={updateStage.isPending}
            style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}
          >
            {updateStage.isPending ? (
              <><output className="spinner-border spinner-border-sm me-2"></output>Updating…</>
            ) : (
              <><i className="bi bi-arrow-right me-2"></i>Advance to {STAGES[currentIdx + 1].label}</>
            )}
          </button>
        ) : (
          <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <i className="bi bi-check-circle me-1"></i>Category completed
          </span>
        )}
        {error && <span style={{ color: '#DC2626', fontSize: '13px' }}>{error}</span>}
      </div>
    </div>
  );
}
