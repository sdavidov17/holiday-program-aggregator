import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

export default function SubscriptionCancelled() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <>
      <Head>
        <title>Subscription Cancelled - Holiday Program Aggregator</title>
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center" style={{background: 'linear-gradient(to bottom, #2e026d, #15162c)'}}>
        <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
          <div className="rounded-lg p-8 text-center" style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px solid rgba(239, 68, 68, 0.5)', maxWidth: '500px'}}>
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Subscription Cancelled
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Your subscription process was cancelled. No charges were made to your account.
            </p>
            <p className="text-md text-gray-400 mb-8">
              We&apos;d love to have you join us! Our annual subscription gives you access to all premium features and helps you find the perfect holiday programs for your children.
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
                Try Again
              </Link>
              <Link
                href="/"
                className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition-all"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #7c3aed',
                  textDecoration: 'none',
                }}
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}