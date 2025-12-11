import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useState } from 'react';
import { getServerAuthSession } from '~/server/auth';
import { db } from '~/server/db';
import { api } from '~/utils/api';

interface ProfileProps {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: 'USER' | 'ADMIN';
    emailVerified: Date | null;
    createdAt: Date;
    accounts: {
      provider: string;
      type: string;
    }[];
    subscription: {
      status: string;
      currentPeriodEnd: Date | null;
      cancelAtPeriodEnd: boolean;
    } | null;
  };
}

export default function Profile({ user }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState('');
  const [notifications, setNotifications] = useState(true);

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditing(false);
      alert('Profile updated successfully!');
    },
    onError: (error) => {
      alert(`Error updating profile: ${error.message}`);
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      name,
    });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            {user.role === 'ADMIN' && (
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                Admin
              </span>
            )}
          </div>

          <div className="flex items-start space-x-6">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              // biome-ignore lint/performance/noImgElement: External user images require Next.js Image config changes
              <img
                src={user.image}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.name || 'User'}</h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notifications}
                    onChange={(e) => setNotifications(e.target.checked)}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Receive email notifications about new programs
                  </span>
                </label>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Full Name</span>
                <span className="font-medium">{user.name || 'Not set'}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Email Address</span>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{user.email}</span>
                  {user.emailVerified && (
                    <span className="text-green-600" title="Email verified">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Email Verified</span>
                <span className="font-medium">
                  {user.emailVerified ? (
                    <span className="text-green-600">✓ Verified</span>
                  ) : (
                    <span className="text-yellow-600">Pending verification</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Account Type</span>
                <span className="font-medium capitalize">{user.role}</span>
              </div>

              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Connected Accounts</span>
                <div className="flex space-x-2">
                  {user.accounts.length > 0 ? (
                    user.accounts.map((account, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-sm capitalize">
                        {account.provider}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">Password only</span>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h3>

          {user.subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status</span>
                <span
                  className={`font-medium capitalize ${
                    user.subscription.status === 'active'
                      ? 'text-green-600'
                      : user.subscription.status === 'trialing'
                        ? 'text-blue-600'
                        : 'text-gray-600'
                  }`}
                >
                  {user.subscription.status}
                </span>
              </div>

              {user.subscription.currentPeriodEnd && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {user.subscription.cancelAtPeriodEnd ? 'Expires on' : 'Renews on'}
                  </span>
                  <span className="font-medium">
                    {formatDate(user.subscription.currentPeriodEnd)}
                  </span>
                </div>
              )}

              {user.subscription.cancelAtPeriodEnd && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    Your subscription will not renew after the current period ends.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 mb-4">You don&apos;t have an active subscription.</p>
          )}

          <Link
            href="/subscription"
            className="inline-block px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 mt-4"
          >
            Manage Subscription →
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>

          <div className="space-y-3">
            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Admin Panel</p>
                    <p className="text-sm text-gray-600">Manage users and providers</p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            )}

            <Link
              href="/providers"
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Browse Providers</p>
                  <p className="text-sm text-gray-600">Find holiday programs</p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center justify-between p-3 border border-red-200 rounded-md hover:bg-red-50 text-red-600"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-red-500">End your session</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getServerAuthSession({ req: context.req, res: context.res });

  if (!session) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Fetch additional user data
  const userData = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      emailVerified: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
          type: true,
        },
      },
      subscriptions: {
        where: {
          status: {
            in: ['active', 'trialing'],
          },
        },
        select: {
          status: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!userData) {
    return {
      redirect: {
        destination: '/auth/signin',
        permanent: false,
      },
    };
  }

  // Serialize dates
  const user = {
    ...userData,
    emailVerified: userData.emailVerified?.toISOString() || null,
    createdAt: userData.createdAt.toISOString(),
    subscription: userData.subscriptions[0]
      ? {
          ...userData.subscriptions[0],
          currentPeriodEnd: userData.subscriptions[0].currentPeriodEnd?.toISOString() || null,
        }
      : null,
  };

  return {
    props: {
      user: JSON.parse(JSON.stringify(user)),
    },
  };
}
