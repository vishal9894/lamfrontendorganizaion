import OptimizedDataTable from '../components/OptimizedDataTable';
import { useStreams, useDeleteStream } from '../hooks/useApiQueries';

const OptimizedViewStream = () => {
  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">{value}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => (
        <div className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <OptimizedDataTable
        useQueryHook={useStreams}
        useDeleteHook={useDeleteStream}
        queryKey={['streams']}
        title="Streams"
        columns={columns}
        actions={['view', 'edit', 'delete']}
        showBulkActions={true}
        showFilters={true}
        exportable={true}
      />
    </div>
  );
};

export default OptimizedViewStream;
