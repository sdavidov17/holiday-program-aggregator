import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { api } from '~/utils/api';

const SubscriptionMonitor: NextPage = () => {
  const { data: session } = useSession();
  const [lastRun, setLastRun] = useState<Date | null>(null);

  // In a real app, this would fetch from a monitoring API
  // For now, we'll use mock data
  const [metrics, setMetrics] = useState({
    totalActive: 0,
    expiringNext7Days: 0,
    expiredLast7Days: 0,
    lastCronRun: null as Date | null,
    cronStatus: 'unknown' as 'success' | 'failed' | 'unknown',
  });

  // Mock refresh - in production this would fetch real data
  const refreshMetrics = () => {
    setLastRun(new Date());
    setMetrics({
      totalActive: Math.floor(Math.random() * 1000) + 500,
      expiringNext7Days: Math.floor(Math.random() * 50) + 10,
      expiredLast7Days: Math.floor(Math.random() * 30) + 5,
      lastCronRun: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
      cronStatus: Math.random() > 0.1 ? 'success' : 'failed',
    });
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  // Only allow admin users - check email domain properly
  const userEmail = session?.user?.email || '';
  const emailDomain = userEmail.split('@')[1];
  const isAdminDomain = emailDomain === 'clearroute.io';

  if (!isAdminDomain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin access required</p>
          <Link href="/profile" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            Return to Profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Subscription Monitor - Admin</title>
        <meta name="description" content="Monitor subscription lifecycle" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Subscription Monitor</h1>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              Back to Profile
            </Link>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Active Subscriptions</h3>
              <p className="text-3xl font-bold text-green-600">{metrics.totalActive}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Expiring in 7 Days</h3>
              <p className="text-3xl font-bold text-yellow-600">{metrics.expiringNext7Days}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Expired Last 7 Days</h3>
              <p className="text-3xl font-bold text-red-600">{metrics.expiredLast7Days}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Cron Status</h3>
              <p
                className={`text-3xl font-bold ${
                  metrics.cronStatus === 'success'
                    ? 'text-green-600'
                    : metrics.cronStatus === 'failed'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {metrics.cronStatus.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Last Run Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Cron Job Information</h2>
            <div className="space-y-2">
              <div>
                <span className="font-medium">Last Run:</span>{' '}
                {metrics.lastCronRun ? metrics.lastCronRun.toLocaleString() : 'Never'}
              </div>
              <div>
                <span className="font-medium">Schedule:</span> Daily at 9:00 AM Sydney time
              </div>
              <div>
                <span className="font-medium">Next Run:</span>{' '}
                {metrics.lastCronRun
                  ? new Date(metrics.lastCronRun.getTime() + 86400000).toLocaleString()
                  : 'Unknown'}
              </div>
            </div>

            <button
              onClick={refreshMetrics}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Refresh Metrics
            </button>
          </div>

          {/* Alert Conditions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Alert Conditions</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span>Email delivery rate above 95%</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span>Processing time under 30 seconds</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span>No cron failures in last 24 hours</span>
              </div>
            </div>
          </div>

          {/* Note about demo */}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This is a demo monitoring dashboard with mock data. In
              production, this would connect to real monitoring services like Datadog, New Relic, or
              CloudWatch.
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default SubscriptionMonitor;
