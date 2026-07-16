// Jury scoring rubric shown on the rating screen.
// Must stay in sync with the backend copy at src/constants/juryCriteria.js.
// Total across all criteria = 100.
export const JURY_CRITERIA = [
  { key: 'impact', label: 'Impact', description: 'Measures real-world influence and audience impact', max: 25 },
  { key: 'contentQuality', label: 'Content Quality', description: 'Originality, creativity, storytelling, production', max: 20 },
  { key: 'audienceRelevance', label: 'Audience Relevance', description: 'Connection with audience and community', max: 15 },
  { key: 'authenticityCredibility', label: 'Authenticity & Credibility', description: 'Trustworthiness and authenticity of engagement', max: 15 },
  { key: 'categoryFit', label: 'Category Fit', description: 'Alignment with category purpose and values', max: 15 },
  { key: 'overallImpression', label: 'Overall Jury Impression', description: 'Overall professional judgment', max: 10 },
];

export const JURY_MAX_TOTAL = JURY_CRITERIA.reduce((sum, c) => sum + c.max, 0); // 100

export const emptyCriteriaScores = () =>
  JURY_CRITERIA.reduce((acc, c) => ({ ...acc, [c.key]: 0 }), {});
