import Link from 'next/link';
import { AdminLayout } from '~/components/AdminLayout';
import { api } from '~/utils/api';

export default function AdminDashboard() {
  const { data: providers } = api.provider.getAll.useQuery();
  const { data: session } = api.user.me.useQuery();
  const { data: userStats } = api.admin.getUserStats.useQuery();

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Welcome Card */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Welcome Back!</h3>
          <p className="mt-2 text-gray-600">Logged in as: {session?.email}</p>
          <p className="text-sm text-gray-500">Role: {session?.role}</p>
        </div>

        {/* Providers Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Providers</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">{providers?.length || 0}</p>
          <p className="text-sm text-gray-500">Total providers in system</p>
          <Link
            href="/admin/providers"
            className="mt-4 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View all →
          </Link>
        </div>

        {/* Users Stats */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Users</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{userStats?.totalUsers || 0}</p>
          <p className="text-sm text-gray-500">Total users ({userStats?.adminUsers || 0} admins)</p>
          <Link
            href="/admin/users"
            className="mt-4 inline-block text-sm font-medium text-green-600 hover:text-green-800"
          >
            Manage users →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-2">
            <Link
              href="/admin/providers/new"
              className="block w-full rounded bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Add New Provider
            </Link>
            <Link
              href="/admin/providers"
              className="block w-full rounded border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Providers
            </Link>
            <Link
              href="/admin/users"
              className="block w-full rounded border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Manage Users
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Providers */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Recent Providers</h3>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {providers?.slice(0, 5).map((provider) => (
                <tr key={provider.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {provider.businessName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span
                      className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        provider.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {provider.isPublished ? 'Published' : 'Draft'}
                    </span>
                    {provider.isVetted && (
                      <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        Vetted
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {new Date(provider.createdAt).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <Link
                      href={`/admin/providers/${provider.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!providers || providers.length === 0) && (
            <div className="px-6 py-8 text-center text-gray-500">
              No providers yet.{' '}
              <Link href="/admin/providers/new" className="text-blue-600 hover:text-blue-800">
                Add your first provider
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
