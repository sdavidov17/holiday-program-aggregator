import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ExpirationNoticeEmailProps {
  userName: string;
  expiredDate: string;
  renewalUrl: string;
}

export default function ExpirationNoticeEmail({
  userName,
  expiredDate,
  renewalUrl,
}: ExpirationNoticeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has expired</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Subscription Expired</Heading>
          <Text style={text}>Hi {userName},</Text>
          <Text style={text}>
            Your Holiday Program Aggregator subscription expired on <strong>{expiredDate}</strong>.
          </Text>
          <Text style={text}>You no longer have access to premium features including:</Text>
          <Text style={list}>
            • Program search and discovery
            <br />• Advanced filters and maps
            <br />• Email notifications
            <br />• Saved preferences
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={renewalUrl}>
              Renew Now to Restore Access
            </Button>
          </Section>
          <Text style={text}>
            We'd love to have you back! Renew today to regain immediate access to all premium
            features.
          </Text>
          <Text style={text}>
            Best regards,
            <br />
            The Holiday Programs Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 20px 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  padding: '0',
  margin: '30px 0',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
};

const list = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  marginLeft: '10px',
};

const buttonContainer = {
  padding: '27px 0 27px',
};

const button = {
  backgroundColor: '#3B82F6',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};
