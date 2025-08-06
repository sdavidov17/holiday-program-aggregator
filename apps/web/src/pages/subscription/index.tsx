import { type GetServerSidePropsContext } from "next";
import { getServerAuthSession } from "~/server/auth";
import Head from "next/head";
import Link from "next/link";
import { SubscriptionCard } from "~/components/SubscriptionCard";
import styles from "./subscription.module.css";

export default function SubscriptionPage() {
  return (
    <>
      <Head>
        <title>Manage Subscription - Holiday Program Aggregator</title>
        <meta name="description" content="Manage your subscription" />
      </Head>

      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/profile" className={styles.backLink}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd"/>
            </svg>
            Back to Profile
          </Link>
          <h1>Manage Subscription</h1>
          <p>View and manage your subscription details</p>
        </div>

        <div className={styles.content}>
          <SubscriptionCard />

          <div className={styles.faq}>
            <h2>Frequently Asked Questions</h2>
            
            <details className={styles.faqItem}>
              <summary>What&apos;s included in my subscription?</summary>
              <p>Your annual subscription includes:</p>
              <ul>
                <li>Unlimited searches for holiday programs</li>
                <li>Save and organize your favorite programs</li>
                <li>Email notifications when new programs match your preferences</li>
                <li>Advanced search filters and sorting options</li>
                <li>Priority customer support</li>
              </ul>
            </details>

            <details className={styles.faqItem}>
              <summary>Can I cancel my subscription anytime?</summary>
              <p>Yes! You can cancel your subscription at any time. When you cancel, you&apos;ll continue to have access to premium features until the end of your current billing period. After that, your account will revert to the free tier.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>How do I update my payment method?</summary>
              <p>If your payment fails or you need to update your card, you&apos;ll see an option to update your payment method on this page. Click the &quot;Update Payment Method&quot; button and you&apos;ll be redirected to our secure payment processor.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>Will I be notified before renewal?</summary>
              <p>Yes, we&apos;ll send you an email reminder 7 days before your subscription renews, giving you time to make any changes if needed.</p>
            </details>

            <details className={styles.faqItem}>
              <summary>What happens to my saved data if I cancel?</summary>
              <p>Your saved programs and preferences will remain in your account even if you cancel. You can resubscribe at any time to regain access to premium features.</p>
            </details>
          </div>

          <div className={styles.support}>
            <h3>Need Help?</h3>
            <p>If you have any questions or issues with your subscription, our support team is here to help.</p>
            <a href="mailto:support@holidayprograms.com.au" className={styles.supportLink}>
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
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}