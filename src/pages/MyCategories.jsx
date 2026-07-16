import SkeletonListPage from '../components/SkeletonListPage';

export default function MyCategories() {
  return (
    <SkeletonListPage
      title="My Categories"
      subtitle="Categories assigned to you for management"
      columns={['Category', 'Season', 'Stage', 'Status']}
      emptyMessage="No categories assigned to you yet"
    />
  );
}
