import type { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { SubscriptionCard } from '~/components/SubscriptionCard';
import { getServerAuthSession } from '~/server/auth';

export default function SubscriptionPage() {
  return (
    <>
      <Head>
        <title>Manage Subscription - Holiday Program Aggregator</title>
        <meta name="description" content="Manage your subscription" />
      </Head>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: '30px' }}>
          <Link
            href="/profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#007bff',
              textDecoration: 'none',
              marginBottom: '20px',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Profile
          </Link>
          <h1>Manage Subscription</h1>
          <p>View and manage your subscription details</p>
        </div>

        <div>
          <SubscriptionCard />

          <div
            style={{
              marginTop: '40px',
              backgroundColor: '#f8f9fa',
              padding: '30px',
              borderRadius: '8px',
            }}
          >
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '600' }}>
              Frequently Asked Questions
            </h2>

            <details
              style={{
                marginBottom: '15px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                What&apos;s included in my subscription?
              </summary>
              <p style={{ color: '#4b5563', lineHeight: '1.6', marginBottom: '12px' }}>
                Your annual subscription includes:
              </p>
              <ul style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px' }}>
                <li>Unlimited searches for holiday programs</li>
                <li>Save and organize your favorite programs</li>
                <li>Email notifications when new programs match your preferences</li>
                <li>Advanced search filters and sorting options</li>
                <li>Priority customer support</li>
              </ul>
            </details>

            <details
              style={{
                marginBottom: '15px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                Can I cancel my subscription anytime?
              </summary>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Yes! You can cancel your subscription at any time. When you cancel, you&apos;ll
                continue to have access to premium features until the end of your current billing
                period. After that, your account will revert to the free tier.
              </p>
            </details>

            <details
              style={{
                marginBottom: '15px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                How do I update my payment method?
              </summary>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                If your payment fails or you need to update your card, you&apos;ll see an option to
                update your payment method on this page. Click the &quot;Update Payment Method&quot;
                button and you&apos;ll be redirected to our secure payment processor.
              </p>
            </details>

            <details
              style={{
                marginBottom: '15px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                Will I be notified before renewal?
              </summary>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Yes, we&apos;ll send you an email reminder 7 days before your subscription renews,
                giving you time to make any changes if needed.
              </p>
            </details>

            <details
              style={{
                marginBottom: '15px',
                padding: '16px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <summary
                style={{
                  fontWeight: '600',
                  fontSize: '16px',
                  color: '#1f2937',
                  marginBottom: '8px',
                }}
              >
                What happens to my saved data if I cancel?
              </summary>
              <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
                Your saved programs and preferences will remain in your account even if you cancel.
                You can resubscribe at any time to regain access to premium features.
              </p>
            </details>
          </div>

          <div
            style={{
              marginTop: '40px',
              textAlign: 'center',
              padding: '20px',
              backgroundColor: '#f0f8ff',
              borderRadius: '8px',
            }}
          >
            <h3>Need Help?</h3>
            <p>
              If you have any questions or issues with your subscription, our support team is here
              to help.
            </p>
            <a
              href="mailto:support@holidayprograms.com.au"
              style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </>
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

  return {
    props: {},
  };
}
