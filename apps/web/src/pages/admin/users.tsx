import Head from 'next/head';
import { useState } from 'react';
import { AdminGuard } from '~/components/AdminGuard';
import { AdminLayout } from '~/components/AdminLayout';
import { api } from '~/utils/api';

export default function AdminUsersPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading, refetch } = api.admin.getUsers.useQuery();
  const { data: stats } = api.admin.getUserStats.useQuery();

  const updateRole = api.admin.updateUserRole.useMutation({
    onSuccess: () => {
      void refetch();
      setSelectedUserId(null);
      alert('User role updated successfully');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const deleteUser = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      void refetch();
      alert('User deleted successfully');
    },
    onError: (error: any) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleRoleChange = (userId: string, newRole: 'USER' | 'ADMIN') => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser.mutate({ userId });
    }
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <Head>
          <title>User Management - Admin</title>
          <meta name="description" content="Manage users and roles" />
        </Head>

        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '30px' }}>User Management</h1>

          {/* Stats Cards */}
          {stats && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#f0f8ff',
                  borderRadius: '8px',
                  border: '1px solid #d1e7ff',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  Total Users
                </h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.totalUsers}
                </p>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fff0f0',
                  borderRadius: '8px',
                  border: '1px solid #ffd1d1',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  Admin Users
                </h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.adminUsers}
                </p>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#f0fff0',
                  borderRadius: '8px',
                  border: '1px solid #d1ffd1',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  Verified Users
                </h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.verifiedUsers}
                </p>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#fffef0',
                  borderRadius: '8px',
                  border: '1px solid #ffefd1',
                }}
              >
                <h3 style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                  New (30 days)
                </h3>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                  {stats.recentUsers}
                </p>
              </div>
            </div>
          )}

          {/* Users Table */}
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #ddd',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '15px 20px',
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #ddd',
              }}
            >
              <h2 style={{ margin: 0 }}>All Users</h2>
            </div>

            {isLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>
            ) : users && users.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Email
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Role
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Verified
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'left',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Created
                      </th>
                      <th
                        style={{
                          padding: '12px',
                          textAlign: 'center',
                          borderBottom: '2px solid #ddd',
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: any) => (
                      <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{user.email}</td>
                        <td style={{ padding: '12px' }}>{user.name || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.id, e.target.value as 'USER' | 'ADMIN')
                            }
                            disabled={updateRole.isPending && selectedUserId === user.id}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '4px',
                              border: '1px solid #ccc',
                              backgroundColor: user.role === 'ADMIN' ? '#fff0f0' : 'white',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="USER">User</option>
                            <option value="ADMIN">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {user.emailVerified ? (
                            <span style={{ color: '#28a745' }}>✓ Verified</span>
                          ) : (
                            <span style={{ color: '#6c757d' }}>Not verified</span>
                          )}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteUser.isPending}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#c82333';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc3545';
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '20px', textAlign: 'center' }}>No users found</div>
            )}
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}
