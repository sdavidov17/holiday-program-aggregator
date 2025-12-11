import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { api } from '~/utils/api';

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const { session_id } = router.query;
  const [redirectTimer, setRedirectTimer] = useState(10);

  // Check subscription status
  const { data: subscriptionStatus } = api.subscription.getSubscriptionStatus.useQuery(
    undefined,
    {
      enabled: !!session?.user,
      refetchInterval: 2000, // Check every 2 seconds
    },
  );

  useEffect(() => {
    // Countdown timer
    const timer = setInterval(() => {
      setRedirectTimer((prev) => {
        if (prev <= 1) {
          void router.push('/profile');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Subscription Successful - Holiday Program Aggregator</title>
      </Head>
      <main
        className="flex min-h-screen flex-col items-center justify-center"
        style={{ background: 'linear-gradient(to bottom, #2e026d, #15162c)' }}
      >
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <div
            className="rounded-lg p-8 text-center"
            style={{
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              border: '2px solid rgba(34, 197, 94, 0.5)',
              maxWidth: '500px',
            }}
          >
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Holiday Program Aggregator!
            </h1>
            <p className="text-lg text-gray-300 mb-6">Your payment was successful!</p>

            {/* Webhook status indicator */}
            <div
              className="mb-6 p-4 rounded"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              {subscriptionStatus?.hasSubscription ? (
                <div className="text-green-400">✅ Subscription is active and ready to use!</div>
              ) : (
                <div className="text-yellow-400">
                  ⏳ Setting up your subscription...
                  <br />
                  <span className="text-sm text-gray-400">
                    (This may take a moment if webhooks are not configured)
                  </span>
                </div>
              )}
            </div>

            {session_id && <p className="text-xs text-gray-500 mb-4">Session ID: {session_id}</p>}
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition-all"
                style={{
                  backgroundColor: '#7c3aed',
                  textDecoration: 'none',
                }}
              >
                Go to Dashboard
              </Link>
              <Link
                href="/profile"
                className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition-all"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #7c3aed',
                  textDecoration: 'none',
                }}
              >
                View Profile
              </Link>
            </div>
            <p className="text-sm text-gray-400 mt-6">
              Redirecting to your profile in {redirectTimer} seconds...
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
