import { PrismaClient } from '@prisma/client';

let prisma: any;
try {
  prisma = new PrismaClient();
} catch (error: any) {
  console.error("PRISMA INITIALIZATION ERROR:", error);
  prisma = {} as any;
}

export default prisma as PrismaClient;
