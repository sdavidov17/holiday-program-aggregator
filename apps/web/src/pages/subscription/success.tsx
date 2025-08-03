import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function SubscriptionSuccess() {
  const router = useRouter();
  const { data: session } = useSession();
  const { session_id } = router.query;

  useEffect(() => {
    // Redirect to home after 5 seconds
    const timer = setTimeout(() => {
      void router.push("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Subscription Successful - Holiday Program Aggregator</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center" style={{background: 'linear-gradient(to bottom, #2e026d, #15162c)'}}>
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <div className="rounded-lg p-8 text-center" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '2px solid rgba(34, 197, 94, 0.5)', maxWidth: '500px'}}>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to Holiday Program Aggregator!
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Your subscription has been activated successfully. You now have full access to all our premium features.
            </p>
            <p className="text-sm text-gray-400 mb-6">
              {session_id && `Session ID: ${session_id}`}
            </p>
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
              Redirecting to dashboard in 5 seconds...
            </p>
          </div>
        </div>
      </main>
    </>
  );
}