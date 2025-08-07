import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { SubscriptionStatus } from "@prisma/client";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  
  const { data: subscriptionStatus } = api.subscription.getSubscriptionStatus.useQuery(
    undefined,
    {
      enabled: !!session,
      retry: false,
    }
  );

  const createCheckoutSession = api.subscription.createCheckoutSession.useMutation({
    onSuccess: async (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleSubscribe = () => {
    createCheckoutSession.mutate({});
  };

  return (
    <>
      <Head>
        <title>Holiday Program Aggregator</title>
        <meta name="description" content="Find the perfect holiday programs for your children" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center" style={{background: 'linear-gradient(to bottom, #2e026d, #15162c)'}}>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <div className="absolute top-4 right-4">
            {session ? (
              <Link 
                href="/profile" 
                className="text-white hover:text-purple-300 transition-colors"
                style={{textDecoration: 'none'}}
              >
                Profile →
              </Link>
            ) : (
              <Link 
                href="/auth/signin" 
                className="text-white hover:text-purple-300 transition-colors"
                style={{textDecoration: 'none'}}
              >
                Sign In →
              </Link>
            )}
          </div>
          
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Holiday Program <span style={{color: '#c084fc'}}>Aggregator</span>
          </h1>
          <p className="text-xl text-white/90 mb-4">
            Find the perfect school holiday activities for your kids
          </p>
          
          {/* Subscription Status */}
          {session && (
            <div className="flex flex-col items-center gap-4">
              {subscriptionStatus?.hasSubscription && subscriptionStatus.status === SubscriptionStatus.ACTIVE ? (
                <div className="rounded-lg p-6 text-center" style={{backgroundColor: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.5)'}}>
                  <p className="text-lg text-white mb-2">✓ Active Subscription</p>
                  <p className="text-sm text-gray-300">
                    Valid until: {subscriptionStatus?.currentPeriodEnd ? 
                      new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString() : 
                      'N/A'}
                  </p>
                  {subscriptionStatus?.cancelAtPeriodEnd && (
                    <p className="text-sm text-yellow-400 mt-2">
                      Will cancel at period end
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-lg p-6 text-center" style={{backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.5)'}}>
                  <h2 className="text-2xl font-bold text-white mb-4">Get Full Access</h2>
                  <p className="text-gray-300 mb-6">
                    Subscribe to access all premium features and discover the best holiday programs for your children.
                  </p>
                  <button
                    onClick={handleSubscribe}
                    disabled={createCheckoutSession.isPending}
                    className="rounded-lg px-6 py-3 font-semibold text-white transition-all"
                    style={{
                      backgroundColor: '#7c3aed',
                      opacity: createCheckoutSession.isPending ? 0.7 : 1,
                      cursor: createCheckoutSession.isPending ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {createCheckoutSession.isPending ? 'Loading...' : 'Subscribe Now - $99/year'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Sign in prompt for non-authenticated users */}
          {!session && (
            <div className="rounded-lg p-6 text-center" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
              <h2 className="text-2xl font-bold text-white mb-4">Welcome!</h2>
              <p className="text-gray-300 mb-6">
                Sign in to start your subscription and discover amazing holiday programs.
              </p>
              <Link
                href="/auth/signin"
                className="inline-block rounded-lg px-6 py-3 font-semibold text-white transition-all"
                style={{
                  backgroundColor: '#7c3aed',
                  textDecoration: 'none',
                }}
              >
                Sign In to Get Started
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <div className="flex max-w-xs flex-col gap-4 rounded-xl p-4 text-white" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
              <h3 className="text-2xl font-bold">Features</h3>
              <ul className="text-lg list-disc list-inside">
                <li>Curated holiday programs</li>
                <li>Verified providers</li>
                <li>Location-based search</li>
                <li>Personalized recommendations</li>
              </ul>
            </div>
            <div className="flex max-w-xs flex-col gap-4 rounded-xl p-4 text-white" style={{backgroundColor: 'rgba(255, 255, 255, 0.1)'}}>
              <h3 className="text-2xl font-bold">Benefits</h3>
              <ul className="text-lg list-disc list-inside">
                <li>Save time searching</li>
                <li>Trusted reviews</li>
                <li>Email notifications</li>
                <li>Annual subscription</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}