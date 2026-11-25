'use server';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { createSession, deleteSession, requireUser } from '@/lib/auth';
import { registerSchema, loginSchema, reportSchema, commentSchema, NEXT_STATUS, STATUSES } from '@/lib/constants';

const firstError = (r) => ({ error: r.error.issues[0].message });

/* ---------- Authentification ---------- */

export async function register(_prev, formData) {
  const r = registerSchema.safeParse(Object.fromEntries(formData));
  if (!r.success) return firstError(r);
  if (await prisma.user.findUnique({ where: { email: r.data.email } })) return { error: 'Email déjà utilisé' };
  const user = await prisma.user.create({
    data: { ...r.data, password: await bcrypt.hash(r.data.password, 10) }, // rôle USER par défaut
  });
  await createSession(user.id);
  redirect('/reports');
}

export async function login(_prev, formData) {
  const r = loginSchema.safeParse(Object.fromEntries(formData));
  if (!r.success) return firstError(r);
  const user = await prisma.user.findUnique({ where: { email: r.data.email } });
  if (!user || !(await bcrypt.compare(r.data.password, user.password))) return { error: 'Identifiants incorrects' };
  await createSession(user.id);
  redirect('/reports');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

/* ---------- Signalements ---------- */

export async function createReport(_prev, formData) {
  const user = await requireUser();
  const r = reportSchema.safeParse(Object.fromEntries(formData));
  if (!r.success) return firstError(r);

  // Photo facultative, stockée en base (data URL) pour rester simple
  let photo = null;
  const file = formData.get('photo');
  if (file && file.size > 0) {
    if (!file.type.startsWith('image/')) return { error: 'La photo doit être une image' };
    if (file.size > 1024 * 1024) return { error: 'Photo : 1 Mo maximum' };
    photo = `data:${file.type};base64,${Buffer.from(await file.arrayBuffer()).toString('base64')}`;
  }

  const report = await prisma.report.create({
    data: { ...r.data, photo, authorId: user.id, history: { create: { action: 'Signalement créé', authorId: user.id } } },
  });
  redirect(`/reports/${report.id}`);
}

// Fonctionnalité originale : détection de doublons pendant la saisie
export async function findSimilar(title, location) {
  await requireUser();
  const words = title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  if (!words.length) return [];
  return prisma.report.findMany({
    where: {
      status: { not: 'RESOLU' },
      OR: [...words.map((w) => ({ title: { contains: w } })), ...(location ? [{ location: { contains: location.trim() } }] : [])],
    },
    select: { id: true, title: true, location: true, _count: { select: { supports: true } } },
    take: 5,
  });
}

export async function supportReport(reportId) {
  const user = await requireUser();
  // La clé primaire (userId, reportId) garantit un seul soutien par utilisateur
  await prisma.support.create({ data: { userId: user.id, reportId } }).catch(() => {});
  revalidatePath(`/reports/${reportId}`);
}

export async function addComment(reportId, _prev, formData) {
  const user = await requireUser();
  const r = commentSchema.safeParse(Object.fromEntries(formData));
  if (!r.success) return firstError(r);
  await prisma.comment.create({ data: { content: r.data.content, reportId, authorId: user.id } });
  revalidatePath(`/reports/${reportId}`);
  return {};
}

export async function assignReport(reportId, _prev, formData) {
  const admin = await requireUser('ADMIN');
  const assignee = await prisma.user.findUnique({ where: { id: Number(formData.get('assigneeId')) } });
  if (assignee?.role !== 'RESPONSABLE') return { error: 'Choisissez un responsable' };
  await prisma.report.update({
    where: { id: reportId },
    data: { assigneeId: assignee.id, history: { create: { action: `Attribué à ${assignee.name}`, authorId: admin.id } } },
  });
  revalidatePath(`/reports/${reportId}`);
  return { ok: 'Signalement attribué' };
}

export async function changeStatus(reportId, _prev, formData) {
  const user = await requireUser();
  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return { error: 'Signalement introuvable' };

  // Seul l'administrateur ou le responsable attribué peut changer le statut
  const allowed = user.role === 'ADMIN' || (user.role === 'RESPONSABLE' && report.assigneeId === user.id);
  if (!allowed) return { error: 'Action non autorisée' };

  const next = NEXT_STATUS[report.status];
  if (!next || formData.get('status') !== next) return { error: 'Transition de statut invalide' };

  const resolution = String(formData.get('resolution') ?? '').trim();
  if (next === 'RESOLU' && resolution.length < 10) return { error: "Décrivez l'intervention (10 caractères minimum)" };

  await prisma.report.update({
    where: { id: reportId },
    data: {
      status: next,
      ...(next === 'RESOLU' && { resolution, resolvedAt: new Date() }),
      history: { create: { action: `Statut : ${STATUSES[report.status]} → ${STATUSES[next]}`, authorId: user.id } },
    },
  });
  revalidatePath(`/reports/${reportId}`);
  return { ok: 'Statut mis à jour' };
}

/* ---------- Administration ---------- */

export async function updateRole(userId, _prev, formData) {
  const admin = await requireUser('ADMIN');
  const role = formData.get('role');
  if (!['USER', 'RESPONSABLE', 'ADMIN'].includes(role)) return { error: 'Rôle invalide' };
  if (userId === admin.id) return { error: 'Vous ne pouvez pas modifier votre propre rôle' };
  await prisma.user.update({ where: { id: userId }, data: { role } });
  revalidatePath('/admin/users');
  return { ok: 'Rôle mis à jour' };
}
