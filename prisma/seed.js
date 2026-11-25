// Données de démonstration : npm run db:setup (ou node prisma/seed.js)
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 86400000);

async function main() {
  await prisma.$transaction([
    prisma.history.deleteMany(), prisma.comment.deleteMany(), prisma.support.deleteMany(),
    prisma.report.deleteMany(), prisma.user.deleteMany(),
  ]);
  const password = await bcrypt.hash('Impact2026!', 10);
  const admin = await prisma.user.create({ data: { name: 'Amira Ben Salem', email: 'admin@localimpact.tn', password, role: 'ADMIN' } });
  const resp = await prisma.user.create({ data: { name: 'Sami Trabelsi', email: 'responsable@localimpact.tn', password, role: 'RESPONSABLE' } });
  const user = await prisma.user.create({ data: { name: 'Leïla Mansour', email: 'utilisateur@localimpact.tn', password } });

  // Crée un signalement en rejouant son parcours : chaque étape est inscrite dans l'historique
  const steps = ['PRIS_EN_CHARGE', 'EN_COURS', 'RESOLU'];
  const labels = { NOUVEAU: 'Nouveau', PRIS_EN_CHARGE: 'Pris en charge', EN_COURS: 'En cours', RESOLU: 'Résolu' };
  async function report({ status = 'NOUVEAU', age, supporters = [], resolution, ...data }) {
    const reached = steps.slice(0, steps.indexOf(status) + 1);
    const history = [{ action: 'Signalement créé', authorId: user.id, createdAt: daysAgo(age) }];
    if (reached.length) history.push({ action: `Attribué à ${resp.name}`, authorId: admin.id, createdAt: daysAgo(age - 0.2) });
    let prev = 'NOUVEAU';
    reached.forEach((s, i) => {
      history.push({ action: `Statut : ${labels[prev]} → ${labels[s]}`, authorId: resp.id, createdAt: daysAgo(age - 0.5 - i) });
      prev = s;
    });
    await prisma.report.create({ data: {
      ...data, status, authorId: user.id, createdAt: daysAgo(age),
      assigneeId: reached.length ? resp.id : null,
      ...(status === 'RESOLU' && { resolution, resolvedAt: daysAgo(age - 0.5 - (reached.length - 1)) }),
      supports: { create: supporters.map((u) => ({ userId: u.id })) },
      history: { create: history },
    } });
  }

  await report({ title: "Main courante desserrée dans l'escalier", description: "La main courante de l'escalier principal bouge et risque de céder.",
    category: 'Sécurité', location: 'Bâtiment A', status: 'RESOLU', age: 20, supporters: [resp, admin], resolution: 'Fixations remplacées et main courante resserrée.' });
  await report({ title: 'Vidéoprojecteur hors service en salle A12', description: "Le vidéoprojecteur de la salle A12 n'affiche plus aucune image.",
    category: 'Matériel', location: 'Bâtiment A', status: 'PRIS_EN_CHARGE', age: 6, supporters: [admin] });
  await report({ title: 'Corbeilles saturées derrière la résidence', description: 'Les corbeilles ne sont plus vidées depuis plusieurs jours.',
    category: 'Propreté', location: 'Résidence universitaire', age: 2, supporters: [resp] });
  await report({ title: 'Connexion Wi-Fi instable à la bibliothèque', description: 'Le Wi-Fi se coupe toutes les dix minutes en salle de lecture.',
    category: 'Informatique', location: 'Bibliothèque', status: 'RESOLU', age: 12, supporters: [resp, admin], resolution: "Borne Wi-Fi défectueuse remplacée." });
  await report({ title: "Rampe d'accès bloquée au bâtiment B", description: "Des vélos garés empêchent l'accès en fauteuil roulant.",
    category: 'Accessibilité', location: 'Bâtiment B', status: 'PRIS_EN_CHARGE', age: 4 });
  await report({ title: 'Éclairage défectueux près du parking principal', description: "Trois lampadaires sont éteints, la zone est très sombre le soir.",
    category: 'Éclairage', location: 'Parking principal', status: 'EN_COURS', age: 8, supporters: [user, resp, admin] });

  await prisma.comment.create({ data: { content: 'Le problème est-il présent tous les jours ?', authorId: resp.id, reportId: (await prisma.report.findFirst({ where: { category: 'Accessibilité' } })).id } });
  console.log('Base initialisée avec les comptes de démonstration.');
}

main().finally(() => prisma.$disconnect());
