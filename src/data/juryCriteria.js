// Jury scoring rubric shown on the rating screen.
// Must stay in sync with the backend copy at src/constants/juryCriteria.js.
//
// Each criterion is scored on a 0-100 scale (raw) by the juror.
// The backend converts it to a weighted contribution:
//     weighted = (raw / 100) * maxPoints
//
// Creator Jury total max = 30 points
// Executive Jury total max = 40 points
// Public voting total max = 30 points (handled separately)
// Grand total = 100 points

export const CREATOR_JURY_CRITERIA = [
  { key: 'authenticity', label: 'Authenticity', description: 'Genuineness and originality of the creator\'s voice', maxPoints: 7.5 },
  { key: 'contentQuality', label: 'Quality of Content', description: 'Production value, storytelling, and craft', maxPoints: 5 },
  { key: 'creativeThinking', label: 'Creative Thinking', description: 'Innovation and originality in concept and execution', maxPoints: 5 },
  { key: 'knowledgeUnderstanding', label: 'Knowledge and Understanding', description: 'Depth of understanding of the category and audience', maxPoints: 5 },
  { key: 'audienceCommunity', label: 'Audience Community', description: 'Engagement and community building around content', maxPoints: 7.5 },
];

export const EXECUTIVE_JURY_CRITERIA = [
  { key: 'impact', label: 'Impact', description: 'Real-world influence and measurable audience impact', maxPoints: 7 },
  { key: 'authenticity', label: 'Authenticity', description: 'Trustworthiness and authenticity of engagement', maxPoints: 7 },
  { key: 'audienceConnect', label: 'Audience Connect', description: 'Strength of connection with the audience', maxPoints: 7 },
  { key: 'creativeThinking', label: 'Creative Thinking', description: 'Innovation and originality in approach', maxPoints: 6 },
  { key: 'knowledgeUnderstanding', label: 'Knowledge and Understanding', description: 'Expertise and depth in the field', maxPoints: 6 },
  { key: 'audienceCommunity', label: 'Audience Community', description: 'Community engagement and loyalty', maxPoints: 7 },
];

export const CRITERIA_BY_STAGE = {
  creator: CREATOR_JURY_CRITERIA,
  executive: EXECUTIVE_JURY_CRITERIA,
};

export const STAGE_MAX_POINTS = {
  creator: 30,
  executive: 40,
  public: 30,
};

// Maps the normalized frontend role to the scoring stage.
export const ROLE_TO_STAGE = {
  creator_jury: 'creator',
  executive_jury: 'executive',
};

// Returns the criteria list for a given normalized role, or empty array.
export const getCriteriaForRole = (normalizedRole) =>
  CRITERIA_BY_STAGE[ROLE_TO_STAGE[normalizedRole]] || [];

// Returns the max weighted points for a given normalized role's stage.
export const getMaxPointsForRole = (normalizedRole) =>
  STAGE_MAX_POINTS[ROLE_TO_STAGE[normalizedRole]] || 0;

// Returns an empty scores object keyed by criterion key for the given stage.
export const emptyCriteriaScores = (stage) =>
  (CRITERIA_BY_STAGE[stage] || []).reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {});

// Legacy exports (kept for backward compatibility with any old imports).
export const JURY_CRITERIA = CREATOR_JURY_CRITERIA;
export const JURY_MAX_TOTAL = STAGE_MAX_POINTS.creator;
