import { PrismaClient } from '@prisma/client';

// Une seule instance en développement (évite trop de connexions avec le hot reload)
const g = globalThis;
export const prisma = g.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') g.prisma = prisma;

// Inclusion commune : nombre de soutiens d'un signalement
export const withSupports = { _count: { select: { supports: true } } };
