import { useAuth } from '../context/AuthProvider';
import SkeletonListPage from '../components/SkeletonListPage';
import { normalizeRole } from '../util/roles';

export default function MyScores() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  const isExecutive = role === 'executive_jury';

  return (
    <SkeletonListPage
      title="My Scores"
      subtitle={isExecutive ? 'Your Executive Jury scoring submissions' : 'Your Creator Jury scoring submissions'}
      columns={['Nominee', 'Category', 'Total Score', 'Status', 'Submitted']}
      emptyMessage="You haven't scored any nominees yet"
    />
  );
}
