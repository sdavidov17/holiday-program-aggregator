import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { api } from '~/utils/api';

export default function TestProviderPage() {
  const { data: session, status } = useSession();
  const {
    data: providers,
    error,
    isLoading,
  } = api.provider.getAll.useQuery(undefined, { enabled: session?.user?.role === 'ADMIN' });

  if (status === 'loading') return <div>Loading session...</div>;
  if (!session)
    return (
      <div>
        Not authenticated. <Link href="/auth/signin">Sign in</Link>
      </div>
    );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Provider Test Page</h1>

      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>User: {session.user.email}</p>
        <p>Role: {session.user.role}</p>
      </div>

      {session.user.role !== 'ADMIN' ? (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          You need ADMIN role to access providers. Current role: {session.user.role}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Providers:</h2>
          {isLoading && <p>Loading providers...</p>}
          {error && <p className="text-red-600">Error: {error.message}</p>}
          {providers && (
            <div>
              <p>Total providers: {providers.length}</p>
              <ul className="list-disc pl-5">
                {providers.map((p) => (
                  <li key={p.id}>
                    {p.businessName} - {p.isPublished ? 'Published' : 'Draft'}
                  </li>
                ))}
              </ul>
              <div className="mt-4 space-x-4">
                <Link href="/admin/providers" className="text-blue-600 hover:underline">
                  Go to Admin Providers Page
                </Link>
                <Link href="/admin/providers/new" className="text-blue-600 hover:underline">
                  Add New Provider
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
