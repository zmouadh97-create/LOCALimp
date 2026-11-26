# LocalImpact

Plateforme de signalement et de suivi des problèmes du quotidien sur un campus : matériel défectueux, accessibilité, éclairage, propreté, informatique.

**Stack :** Next.js 15 (App Router, Server Components, Server Actions), React 19, Prisma + SQLite, Zod, sessions JWT (jose) en cookie httpOnly, bcrypt.

## Installation

```bash
npm install
cp .env.example .env
npx prisma generate
npm run db:setup
npm run dev
```

### Configuration (`.env`)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Chemin de la base SQLite (`file:./dev.db`) |
| `SESSION_SECRET` | Clé de signature des sessions (longue chaîne aléatoire) |

## Comptes de démonstration

Mot de passe pour tous les comptes : `Impact2026!`

| Rôle | Nom | Email |
|---|---|---|
| Administrateur | Amira Ben Salem | admin@localimpact.tn |
| Responsable | Sami Trabelsi | responsable@localimpact.tn |
| Utilisateur | Leïla Mansour | utilisateur@localimpact.tn |

## Fonctionnalités

- Inscription / connexion, trois rôles (utilisateur, responsable, administrateur). Les nouveaux comptes sont « utilisateur » ; l'admin change les rôles dans **Utilisateurs**.
- Création d'un signalement : titre, description, catégorie, lieu et photo facultative (1 Mo max).
- Liste avec recherche, filtres (catégorie, lieu, statut) et tri par nombre de soutiens.
- Soutien d'un signalement : **une seule fois par utilisateur** (clé primaire `(userId, reportId)` en base).
- Attribution d'un signalement à un responsable (administrateur).
- Suivi séquentiel : nouveau → pris en charge → en cours → résolu. Seuls l'administrateur et le responsable attribué peuvent changer le statut. La résolution exige une description de l'intervention.
- Historique daté et signé de chaque action (création, attribution, changement de statut).
- Commentaires.
- **Pages** : Vue d'ensemble, Signalements, Carte, Mes signalements (tous) · File d'intervention et Pilotage (responsable, admin) · Utilisateurs (admin). Le menu s'adapte au rôle et chaque page est aussi protégée côté serveur.
- **Tableau de bord (Pilotage)** : répartition par statut et par catégorie, délai moyen de résolution (global et par catégorie), volume créés/résolus sur 8 semaines.
- **Tous les chiffres affichés sont calculés depuis la base**, y compris ceux de la page de connexion. Aucune valeur n'est codée en dur.
- **Carte** : plan simplifié du campus. Les lieux sont une liste fixe (`LOCATIONS` dans `lib/constants.js`) avec une position sur le plan. La couleur d'un point dépend des statuts des signalements de ce lieu.
- **Priorisation (étiquette URGENT)** : un signalement non résolu est urgent s'il concerne la *Sécurité* ou l'*Accessibilité* (risque pour les personnes), ou s'il a au moins 3 soutiens (impact collectif). La File d'intervention trie les urgents d'abord, puis les plus anciens.

### Fonctionnalité originale : détection de doublons

Quand l'utilisateur remplit le titre ou le lieu d'un nouveau signalement, l'application cherche les signalements non résolus qui y ressemblent (mots du titre, lieu) et les propose. L'utilisateur peut alors **soutenir** l'existant au lieu de créer un doublon. Les soutiens servent ensuite à **prioriser** (tri « Plus soutenus »).

## Organisation du code

```
app/actions.js          Server Actions : toute la logique métier et les contrôles de rôle
app/login, app/register Connexion et inscription (layout → components/AuthShell.js)
app/dashboard, reports, map, my-reports, responsible, pilotage, admin
                        Pages connectées ; leur layout.js réutilise components/AppShell.js (menu + en-tête)
components/             Composants réutilisables (ActionForm, ReportList, ReportRow, StatCard, Bars, StatusBadge, NavLinks…)
lib/auth.js             Session et protection des pages (requireUser)
lib/constants.js        Catégories, statuts, rôles et schémas de validation Zod
prisma/schema.prisma    Modèle de données
```

**Sécurité :** chaque page et chaque Server Action appelle `requireUser(...rôles)` côté serveur. Masquer un bouton dans l'interface n'est jamais la seule protection.

**Validation :** côté client avec les attributs HTML (`required`, `minLength`…), côté serveur avec Zod.

## Limites connues

- SQLite convient au développement et à la démo. Pour un déploiement sur Vercel (système de fichiers non persistant), passer à PostgreSQL : changer `provider` dans `schema.prisma` et `DATABASE_URL`.
- Les photos sont stockées en base (data URL). C'est simple, mais ça ne passe pas à l'échelle. Un stockage objet serait préférable.
- La détection de doublons repose sur une recherche par mots-clés, sans analyse sémantique.
- Pas de notifications, d'invitation par e-mail ni de réinitialisation de mot de passe.
- La carte est un plan schématique, sans vraies coordonnées GPS. Ajouter un lieu, c'est ajouter une entrée dans `LOCATIONS`.
- La recherche SQLite (`contains`) ne distingue pas la casse uniquement pour les caractères ASCII.


