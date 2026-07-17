import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useSettings, useUpdateGlobalStage } from '../hooks/useQueries';

// Stage definitions — must match backend STAGE_ENUM
const STAGES = [
  { key: 'setup', label: 'Setup', icon: 'bi-gear', color: '#6B7280', description: 'Nominees are visible but no one can score or vote.' },
  { key: 'creator_rating', label: 'Creator Jury Rating', icon: 'bi-pencil-square', color: '#5006ba', description: 'Only Creator Jury members can score nominees.' },
  { key: 'executive_rating', label: 'Executive Jury Rating', icon: 'bi-award', color: '#D97706', description: 'Only Executive Jury members can score finalists.' },
  { key: 'public_voting', label: 'Public Voting', icon: 'bi-people', color: '#059669', description: 'Only public voting is open. Creator & Executive Jury cannot score.' },
  { key: 'completed', label: 'Completed', icon: 'bi-check-circle', color: '#2563EB', description: 'Results are finalized. No scoring or voting allowed.' },
];

const STAGE_KEYS = STAGES.map((s) => s.key);

export default function Settings() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useSettings();
  const updateStage = useUpdateGlobalStage();

  const [pendingStage, setPendingStage] = useState(null); // stage awaiting confirmation
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentStage = settings?.currentStage || 'setup';
  const currentIdx = STAGE_KEYS.indexOf(currentStage);
  const currentStageDef = STAGES[currentIdx] || STAGES[0];

  const confirmChange = async () => {
    if (!pendingStage) return;
    setError('');
    setSuccess('');
    try {
      await updateStage.mutateAsync(pendingStage);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      const dir = STAGE_KEYS.indexOf(pendingStage) > currentIdx ? 'advanced to' : 'reverted to';
      const label = STAGES.find((s) => s.key === pendingStage)?.label;
      setSuccess(`Stage ${dir} "${label}"`);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stage');
    } finally {
      setPendingStage(null);
    }
  };

  const requestChange = (stageKey) => {
    if (stageKey === currentStage) return;
    setError('');
    setSuccess('');
    setPendingStage(stageKey);
  };

  if (isLoading) {
    return (
      <div className="container-fluid px-3">
        <div className="text-center py-5">
          <output className="spinner-border text-primary"></output>
          <p className="mb-0 mt-2" style={{ color: '#9CA3AF', fontSize: '14px' }}>Loading settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3">

      {/* Page header */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className="clt-avatar" style={{ background: '#5006ba15', color: '#5006ba' }}>
            <i className="bi bi-sliders"></i>
          </div>
          <div>
            <h6 className="cat-form-title mb-1">Platform Settings</h6>
            <p className="cat-form-subtitle mb-0">
              Control the global stage for all categories. This determines who can score and vote.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Current stage banner */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center"
              style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: `${currentStageDef.color}15`, color: currentStageDef.color, fontSize: '22px',
              }}
            >
              <i className={`bi ${currentStageDef.icon}`}></i>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Current Stage
              </span>
              <h6 className="mb-0" style={{ fontSize: '18px', fontWeight: 700, color: currentStageDef.color }}>
                {currentStageDef.label}
              </h6>
              <p className="mb-0" style={{ fontSize: '13px', color: '#6B7280' }}>{currentStageDef.description}</p>
            </div>
          </div>
          {settings?.updatedAt && (
            <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
              <i className="bi bi-clock-history me-1"></i>
              Updated {new Date(settings.updatedAt).toLocaleString()}
            </span>
          )}
        </div>
      </motion.div>

      {/* Stage stepper */}
      <motion.div
        className="card cat-form-card mb-4"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
      >
        <h6 className="cat-form-title mb-3">
          <i className="bi bi-diagram-3 me-2"></i>Stage Timeline
        </h6>

        {/* Stepper row */}
        <div className="d-flex align-items-center gap-1 flex-wrap mb-4">
          {STAGES.map((s, i) => {
            const isCurrent = i === currentIdx;
            const isPast = i < currentIdx;
            const isFuture = i > currentIdx;
            return (
              <React.Fragment key={s.key}>
                <button
                  type="button"
                  onClick={() => requestChange(s.key)}
                  disabled={updateStage.isPending}
                  className="btn btn-sm p-0 border-0 bg-transparent"
                  title={`Set stage: ${s.label}`}
                  style={{ outline: 'none' }}
                >
                  <span
                    className="d-flex flex-column align-items-center gap-1 px-3 py-2"
                    style={{
                      borderRadius: '12px',
                      border: isCurrent ? `2px solid ${s.color}` : '2px solid transparent',
                      background: isCurrent ? `${s.color}10` : 'transparent',
                      cursor: 'pointer',
                      minWidth: '90px',
                    }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isCurrent ? s.color : isPast ? `${s.color}40` : '#F3F4F6',
                        color: isCurrent ? '#fff' : isPast ? s.color : '#9CA3AF',
                        fontSize: '14px',
                      }}
                    >
                      <i className={`bi ${s.icon}`}></i>
                    </div>
                    <span style={{
                      fontSize: '11px', fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? s.color : isPast ? '#6B7280' : '#9CA3AF',
                      textAlign: 'center', whiteSpace: 'nowrap',
                    }}>
                      {s.label}
                    </span>
                  </span>
                </button>
                {i < STAGES.length - 1 && (
                  <div style={{
                    width: '24px', height: '2px',
                    background: isPast ? s.color : '#E5E7EB',
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Advance / Revert buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {currentIdx > 0 && (
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => requestChange(STAGE_KEYS[currentIdx - 1])}
              disabled={updateStage.isPending}
              style={{ borderRadius: '8px', fontSize: '13px' }}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Revert to {STAGES[currentIdx - 1].label}
            </button>
          )}
          {currentIdx < STAGES.length - 1 && (
            <button
              type="button"
              className="cat-form-submit"
              onClick={() => requestChange(STAGE_KEYS[currentIdx + 1])}
              disabled={updateStage.isPending}
              style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}
            >
              {updateStage.isPending ? (
                <><output className="spinner-border spinner-border-sm me-2"></output>Updating…</>
              ) : (
                <><i className="bi bi-arrow-right me-2"></i>Advance to {STAGES[currentIdx + 1].label}</>
              )}
            </button>
          )}
          {currentIdx === STAGES.length - 1 && (
            <span className="clt-badge" style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
              <i className="bi bi-check-circle me-1"></i>Platform completed
            </span>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-danger py-2 mt-3 mb-0" style={{ fontSize: '13px' }}>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success py-2 mt-3 mb-0" style={{ fontSize: '13px' }}>
            <i className="bi bi-check-lg me-1"></i>{success}
          </div>
        )}
      </motion.div>

      {/* Stage descriptions table */}
      <motion.div
        className="card cat-form-card"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
      >
        <h6 className="cat-form-title mb-3">
          <i className="bi bi-info-circle me-2"></i>Stage Reference
        </h6>
        <div  className="table-responsive">
          <table  className="table table-hover align-middle mb-0" >
            <thead>
              <tr className="clt-thead-row">
                <th className="clt-th">Stage</th>
                <th className="clt-th">Who Can Score / Vote</th>
              </tr>
            </thead>
            <tbody  >
              {STAGES.map((s) => {
                const who = {
                  setup: 'No one — nominees visible only',
                  creator_rating: 'Creator Jury only',
                  executive_rating: 'Executive Jury only',
                  public_voting: 'Public voters only (Jury cannot score)',
                  completed: 'No one — results finalized',
                };
                return (
                  <tr key={s.key} className="clt-row" style={s.key === currentStage ? { background: `${s.color}08` } : {}}>
                    <td className="py-3">
                      <span className="d-flex align-items-center gap-2">
                        <i className={`bi ${s.icon}`} style={{ color: s.color }}></i>
                        <span style={{ fontWeight: s.key === currentStage ? 700 : 500, color: s.key === currentStage ? s.color : '#111827' }}>
                          {s.label}
                        </span>
                        {s.key === currentStage && (
                          <span className="clt-badge" style={{ backgroundColor: `${s.color}15`, color: s.color, fontSize: '10px' }}>
                            ACTIVE
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 clt-cell">{who[s.key]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Confirmation modal */}
      {pendingStage && (
        <>
          <div
            className="modal-backdrop show"
            style={{ opacity: 0.5 }}
            onClick={() => setPendingStage(null)}
          />
          <div className="modal d-block" tabIndex="-1" onClick={() => setPendingStage(null)}>
            <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
              <div className="modal-content" style={{ borderRadius: '16px', border: 'none' }}>
                <div className="modal-body p-4">
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: '#FEF3C7', color: '#92400E', fontSize: '22px',
                      }}
                    >
                      <i className="bi bi-exclamation-triangle"></i>
                    </div>
                    <div>
                      <h6 className="mb-0" style={{ fontSize: '16px', fontWeight: 700 }}>
                        Confirm Stage Change
                      </h6>
                      <p className="mb-0" style={{ fontSize: '13px', color: '#6B7280' }}>
                        This affects all categories globally
                      </p>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>
                    {STAGE_KEYS.indexOf(pendingStage) > currentIdx ? 'Advance' : 'Revert'} from{' '}
                    <strong style={{ color: currentStageDef.color }}>{currentStageDef.label}</strong> to{' '}
                    <strong style={{ color: STAGES.find((s) => s.key === pendingStage)?.color }}>
                      {STAGES.find((s) => s.key === pendingStage)?.label}
                    </strong>?
                  </p>
                  <p style={{ fontSize: '13px', color: '#6B7280' }}>
                    {STAGES.find((s) => s.key === pendingStage)?.description}
                  </p>
                  <div className="d-flex gap-2 justify-content-end mt-4">
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => setPendingStage(null)}
                      style={{ borderRadius: '8px', fontSize: '13px' }}
                    >
                      Cancel
                    </button>
                    <button
                      className="cat-form-submit"
                      onClick={confirmChange}
                      disabled={updateStage.isPending}
                      style={{ width: 'auto', paddingLeft: '20px', paddingRight: '20px' }}
                    >
                      {updateStage.isPending ? (
                        <><output className="spinner-border spinner-border-sm me-2"></output>Confirming…</>
                      ) : (
                        <><i className="bi bi-check-lg me-2"></i>Confirm Change</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
