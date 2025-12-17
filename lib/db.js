import { PrismaClient } from '@prisma/client';
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma_v2 ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma_v2 = prisma;
