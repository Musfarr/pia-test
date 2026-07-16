import SkeletonListPage from '../components/SkeletonListPage';

export default function JuryAssignment() {
  return (
    <SkeletonListPage
      title="Jury Assignment"
      subtitle="Assign Creator Jury and Executive Jury members to your categories"
      columns={['Juror', 'Type', 'Assigned Categories', 'Actions']}
      emptyMessage="No jury members assigned yet"
    />
  );
}
