import { z } from 'zod';

export const CATEGORIES = ['Matériel', 'Accessibilité', 'Éclairage', 'Propreté', 'Informatique', 'Sécurité'];

export const LOCATIONS = [
  { name: 'Bâtiment A', x: 22, y: 30 },
  { name: 'Bâtiment B', x: 48, y: 22 },
  { name: 'Bibliothèque', x: 75, y: 35 },
  { name: 'Résidence universitaire', x: 30, y: 72 },
  { name: 'Restaurant universitaire', x: 58, y: 55 },
  { name: 'Parking principal', x: 82, y: 78 },
];
export const LOCATION_NAMES = LOCATIONS.map((l) => l.name);

export const STATUSES = { NOUVEAU: 'Nouveau', PRIS_EN_CHARGE: 'Pris en charge', EN_COURS: 'En cours', RESOLU: 'Résolu' };
export const NEXT_STATUS = { NOUVEAU: 'PRIS_EN_CHARGE', PRIS_EN_CHARGE: 'EN_COURS', EN_COURS: 'RESOLU' };
export const ROLES = { USER: 'Utilisateur', RESPONSABLE: 'Responsable', ADMIN: 'Administrateur' };

export const URGENT_CATEGORIES = ['Sécurité', 'Accessibilité'];
export const URGENT_SUPPORTS = 3;
export const isUrgent = (r) =>
  r.status !== 'RESOLU' && (URGENT_CATEGORIES.includes(r.category) || r._count.supports >= URGENT_SUPPORTS);

export const avgDelay = (list) =>
  list.length ? (list.reduce((s, r) => s + (r.resolvedAt - r.createdAt), 0) / list.length / 86400000).toFixed(1).replace('.', ',') + ' j' : '—';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nom : 2 caractères minimum'),
  email: z.string().trim().toLowerCase().email('Email invalide'),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
});
export const loginSchema = registerSchema.pick({ email: true }).extend({ password: z.string().min(1, 'Mot de passe requis') });
export const reportSchema = z.object({
  title: z.string().trim().min(5, 'Titre : 5 caractères minimum').max(100),
  description: z.string().trim().min(10, 'Description : 10 caractères minimum').max(2000),
  category: z.enum(CATEGORIES, { message: 'Catégorie invalide' }),
  location: z.enum(LOCATION_NAMES, { message: 'Lieu invalide' }),
});
export const commentSchema = z.object({ content: z.string().trim().min(2, 'Commentaire trop court').max(1000) });
