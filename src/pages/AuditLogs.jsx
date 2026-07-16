import SkeletonListPage from '../components/SkeletonListPage';

export default function AuditLogs() {
  return (
    <SkeletonListPage
      title="Audit Logs"
      subtitle="Login, creation, and rating activity across the platform"
      columns={['Timestamp', 'User', 'Action', 'Target', 'Details']}
      emptyMessage="No log entries recorded yet"
    />
  );
}
