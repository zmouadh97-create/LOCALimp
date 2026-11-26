import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './db';

const key = new TextEncoder().encode(process.env.SESSION_SECRET);

export async function createSession(userId) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setExpirationTime('7d').sign(key);
  (await cookies()).set('session', token, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 3600, secure: process.env.NODE_ENV === 'production',
  });
}

export async function deleteSession() {
  (await cookies()).delete('session');
}

export const getUser = cache(async () => {
  const token = (await cookies()).get('session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return await prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, role: true } });
  } catch {
    return null;
  }
});

export async function requireUser(...roles) {
  const user = await getUser();
  if (!user) redirect('/login');
  if (roles.length && !roles.includes(user.role)) redirect('/reports');
  return user;
}
