export const dashboardMetrics = [
  { label: 'Total Nominees', value: '2,847', change: '+12.5%', positive: true, spark: [42, 48, 44, 58, 55, 68, 64, 76, 81], color: '#5006ba' },
  { label: 'Total Jurors', value: '1,936', change: '+8.2%', positive: true, spark: [30, 42, 38, 50, 46, 56, 62, 59, 70], color: '#5006ba' },
  { label: 'Total Categories', value: '911', change: '+16.4%', positive: true, spark: [18, 22, 20, 29, 34, 32, 41, 47, 52], color: '#5006ba' },
  // { label: 'Avg. Resolution Time', value: '3m 42s', change: '-6.8%', positive: true, spark: [64, 60, 62, 55, 57, 49, 46, 44, 41], color: '#5006ba' },
  // { label: 'Total Minutes', value: '8,429.5', change: '+10.1%', positive: true, spark: [48, 51, 47, 60, 62, 59, 71, 74, 80], color: '#5006ba' },
];

export const conversationTrend = [
  { date: 'Mon', voice_calls: 184, web: 82, total: 266 },
  { date: 'Tue', voice_calls: 221, web: 96, total: 317 },
  { date: 'Wed', voice_calls: 198, web: 102, total: 300 },
  { date: 'Thu', voice_calls: 246, web: 118, total: 364 },
  { date: 'Fri', voice_calls: 279, web: 132, total: 411 },
  { date: 'Sat', voice_calls: 208, web: 89, total: 297 },
  { date: 'Sun', voice_calls: 231, web: 115, total: 346 },
];

export const channelDistribution = [
  { name: 'Voice', value: 68, icon: 'bi-telephone', color: '#376AB3' },
  { name: 'Web', value: 32, icon: 'bi-globe2', color: '#86C7B1' },
];

export const aiPerformance = [
  { key: 'resolved_by_ai', label: 'Resolved by AI', value: 74, count: 2107, color: '#376AB3' },
  { key: 'escalated_to_agent', label: 'Escalated to Agent', value: 18, count: 512, color: '#4FAA94' },
  { key: 'other', label: 'Other', value: 8, count: 228, color: '#86C7B1' },
];

export const sentimentAnalytics = {
  total: 2847,
  distribution: [
    { name: 'Positive', value: 61, count: 1737, color: '#376AB3' },
    { name: 'Neutral', value: 26, count: 740, color: '#4FAA94' },
    { name: 'Negative', value: 13, count: 370, color: '#86C7B1' },
  ],
};

export const topIntents = [
  { name: 'Food', pct: 31 },
  { name: 'Gaming', pct: 24 },
  { name: 'Fitness', pct: 19 },
  { name: 'Lifestyle', pct: 14 },
  { name: 'Travel', pct: 12 },
];

export const resolutionRate = {
  resolution_rate: 87,
  avg_time: '3m 42s',
  resolved_count: 2477,
  rate_change: 5.6,
};

export const conversations = [
  { id: 1, customer: 'Ayesha Khan', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Billing support', sentiment: 'positive', duration: 248, time: 'Today, 10:42 AM', recording_text: 'Caller: I need help understanding my latest bill.\nAgent: I can help explain the charges on your latest statement.\nCaller: Thank you, that clears it up.', summary: 'The customer requested clarification on their monthly bill. The AI agent explained the applicable charges and the conversation was resolved.' },
  { id: 2, customer: 'Omar Siddiqui', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Account inquiry', sentiment: 'neutral', duration: 176, time: 'Today, 10:18 AM', recording_text: 'Caller: What is the current status of my account?\nAgent: Your account is active and all services are available.', summary: 'The customer checked account status. No follow-up was required.' },
  { id: 3, customer: 'Sara Ahmed', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Technical help', sentiment: 'positive', duration: 321, time: 'Today, 9:54 AM', recording_text: 'Caller: My service keeps disconnecting.\nAgent: Let us refresh your connection and verify the service settings.\nCaller: It is working now.', summary: 'The AI agent guided the customer through a connection refresh and confirmed that service was restored.' },
  { id: 4, customer: 'Bilal Hussain', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Plan upgrade', sentiment: 'positive', duration: 204, time: 'Today, 9:21 AM', recording_text: 'Caller: I want to compare available plans.\nAgent: Here are the plans that best match your current usage.', summary: 'The customer reviewed plan options and received an upgrade recommendation.' },
  { id: 5, customer: 'Hina Malik', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Account inquiry', sentiment: 'negative', duration: 287, time: 'Today, 8:47 AM', recording_text: 'Caller: I cannot access my account.\nAgent: I will help you reset access securely.\nCaller: I can sign in now.', summary: 'The AI agent helped the customer restore account access after a verification step.' },
  { id: 6, customer: 'Zain Raza', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Billing support', sentiment: 'neutral', duration: 143, time: 'Yesterday, 5:36 PM', recording_text: 'Caller: When is my next payment due?\nAgent: Your next payment is due on the 15th of this month.', summary: 'The customer received their next payment date.' },
  { id: 7, customer: 'Mariam Ali', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Technical help', sentiment: 'positive', duration: 265, time: 'Yesterday, 4:58 PM', recording_text: 'Caller: I need help configuring my service.\nAgent: I will walk you through the required settings.', summary: 'The customer completed service configuration with AI guidance.' },
  { id: 8, customer: 'Hamza Tariq', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Other', sentiment: 'neutral', duration: 112, time: 'Yesterday, 4:10 PM', recording_text: 'Caller: I have a general question about your service.\nAgent: I am happy to help with that.', summary: 'The customer received general product information.' },
  { id: 9, customer: 'Noor Fatima', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Plan upgrade', sentiment: 'positive', duration: 298, time: 'Yesterday, 3:42 PM', recording_text: 'Caller: Can I add more data to my plan?\nAgent: I can show you the available data add-ons.', summary: 'The customer selected a suitable data add-on.' },
  { id: 10, customer: 'Usman Iqbal', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Account inquiry', sentiment: 'neutral', duration: 154, time: 'Yesterday, 2:26 PM', recording_text: 'Caller: Where can I update my contact details?\nAgent: You can update them from your profile settings.', summary: 'The customer received instructions for updating profile information.' },
  { id: 11, customer: 'Iqra Shah', handled_by: 'Creator Jury', channel: 'Lifestyle', channel_label: 'Voice', intent: 'Billing support', sentiment: 'positive', duration: 231, time: 'Yesterday, 1:18 PM', recording_text: 'Caller: Can you send me a copy of my invoice?\nAgent: Your invoice is available in your account documents.', summary: 'The customer was directed to their available invoice.' },
  { id: 12, customer: 'Danish Khan', handled_by: 'Executive Jury', channel: 'Gaming', channel_label: 'Web', intent: 'Technical help', sentiment: 'negative', duration: 344, time: 'Yesterday, 11:50 AM', recording_text: 'Caller: My application is not loading.\nAgent: Please try clearing the application cache and signing in again.\nCaller: That resolved the issue.', summary: 'The AI agent resolved an application loading issue through standard troubleshooting.' },
];

export const hourlyAnalytics = [
  { hour: 8, call_count: 74, avg_duration: 2.8 },
  { hour: 10, call_count: 128, avg_duration: 3.4 },
  { hour: 12, call_count: 156, avg_duration: 4.1 },
  { hour: 14, call_count: 142, avg_duration: 3.8 },
  { hour: 16, call_count: 119, avg_duration: 3.2 },
  { hour: 18, call_count: 91, avg_duration: 2.9 },
];
