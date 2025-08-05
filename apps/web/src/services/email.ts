import { Resend } from 'resend';
import { env } from '~/env.mjs';
import RenewalReminderEmail from '../../emails/subscription-renewal-reminder';
import ExpirationNoticeEmail from '../../emails/subscription-expiration-notice';
import { render } from '@react-email/render';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface RenewalReminderData {
  userName: string;
  expirationDate: string;
  renewalUrl: string;
}

export interface ExpirationNoticeData {
  userName: string;
  expiredDate: string;
  renewalUrl: string;
}

export async function sendRenewalReminder(
  email: string,
  data: RenewalReminderData
): Promise<void> {
  if (!resend) {
    console.warn('Resend not configured, skipping email send');
    return;
  }

  const emailHtml = await render(RenewalReminderEmail(data));
  
  const { data: result, error } = await resend.emails.send({
    from: 'Holiday Programs <noreply@holidayprograms.com.au>',
    to: email,
    subject: 'Your subscription expires in 7 days',
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send renewal reminder: ${error.message}`);
  }
}

export async function sendExpirationNotice(
  email: string,
  data: ExpirationNoticeData
): Promise<void> {
  if (!resend) {
    console.warn('Resend not configured, skipping email send');
    return;
  }

  const emailHtml = await render(ExpirationNoticeEmail(data));
  
  const { data: result, error } = await resend.emails.send({
    from: 'Holiday Programs <noreply@holidayprograms.com.au>',
    to: email,
    subject: 'Your subscription has expired',
    html: emailHtml,
  });

  if (error) {
    throw new Error(`Failed to send expiration notice: ${error.message}`);
  }
}