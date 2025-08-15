import Link from 'next/link';
import { useState } from 'react';
import { AdminLayout } from '~/components/AdminLayout';
import { api } from '~/utils/api';

export default function ProvidersListPage() {
  const [includeUnpublished, setIncludeUnpublished] = useState(true);
  const [includeUnvetted, setIncludeUnvetted] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: providers,
    refetch,
    isLoading,
  } = api.provider.getAll.useQuery({
    includeUnpublished,
    includeUnvetted,
  });

  const toggleVetting = api.provider.toggleVetting.useMutation({
    onSuccess: () => {
      void refetch();
      setSuccessMessage('Vetting status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      alert(`Error updating vetting status: ${error.message}`);
    },
  });

  const togglePublishing = api.provider.togglePublishing.useMutation({
    onSuccess: () => {
      void refetch();
      setSuccessMessage('Publishing status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      alert(`Error updating publishing status: ${error.message}`);
    },
  });

  const deleteProvider = api.provider.delete.useMutation({
    onSuccess: () => {
      void refetch();
      setSuccessMessage('Provider deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (error) => {
      alert(`Error deleting provider: ${error.message}`);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteProvider.mutate({ id });
    }
  };

  return (
    <AdminLayout title="Manage Providers">
      {successMessage && (
        <div className="mb-4 rounded bg-green-50 p-4 text-green-800">{successMessage}</div>
      )}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeUnpublished}
              onChange={(e) => setIncludeUnpublished(e.target.checked)}
              className="mr-2"
            />
            Show unpublished
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={includeUnvetted}
              onChange={(e) => setIncludeUnvetted(e.target.checked)}
              className="mr-2"
            />
            Show unvetted
          </label>
        </div>
        <Link
          href="/admin/providers/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add New Provider
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading providers...</div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Programs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {providers?.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {provider.businessName}
                      </div>
                      {provider.email && (
                        <div className="text-sm text-gray-500">{provider.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {provider.suburb && provider.state ? (
                      <div>
                        {provider.suburb}, {provider.state}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not specified</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {provider.programs.length} programs
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVetting.mutate({ id: provider.id })}
                        disabled={toggleVetting.isPending || togglePublishing.isPending}
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          provider.isVetted
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        } hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {provider.isVetted ? '✓ Vetted' : 'Not Vetted'}
                      </button>
                      <button
                        onClick={() => togglePublishing.mutate({ id: provider.id })}
                        disabled={
                          (!provider.isVetted && !provider.isPublished) ||
                          toggleVetting.isPending ||
                          togglePublishing.isPending
                        }
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          provider.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        } hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {provider.isPublished ? '✓ Published' : 'Draft'}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/providers/${provider.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(provider.id, provider.businessName)}
                        disabled={deleteProvider.isPending}
                        className="text-red-600 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deleteProvider.isPending ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!providers || providers.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-500">
              No providers found.{' '}
              <Link href="/admin/providers/new" className="text-blue-600 hover:text-blue-800">
                Add your first provider
              </Link>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
