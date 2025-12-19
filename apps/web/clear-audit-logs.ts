
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Truncating AuditLog table...');
    await prisma.auditLog.deleteMany({});
    console.log('Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
