
import { auditLogger } from './src/utils/auditLogger';
import { db } from './src/server/db';

async function verifyAuditLog() {
    console.log('Testing AuditLogger persistence...');
    const testEmail = 'audit-test@example.com';

    await auditLogger.logEvent(
        'AUTH_LOGIN_FAILED',
        { correlationId: 'test-correlation-id' },
        {
            email: testEmail,
            result: 'failure',
            errorMessage: 'Invalid password (test)',
            ipAddress: '127.0.0.1',
        }
    );

    console.log('Log event sent. Verifying DB...');

    const logs = await db.auditLog.findMany({
        where: { email: testEmail },
    });

    if (logs.length > 0) {
        console.log('✅ Audit log found in DB:', logs[0]);
    } else {
        console.error('❌ No audit log found!');
        process.exit(1);
    }
}

verifyAuditLog()
    .catch(console.error)
    .finally(() => db.$disconnect());
