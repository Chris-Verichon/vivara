# 🌻 Projet Vivàra
### Spécification Technique & Fonctionnelle
*Une plateforme pour écrire sa vie*

---

## 1. Vision du Projet

Le Projet Vivàra est une plateforme web personnelle et privée. Elle permet de raconter sa vie à travers des photos, vidéos et textes, organisés sur une timeline visuelle et une carte du monde interactive.

> L'expérience doit être douce, intuitive et émotionnelle — pas un simple outil, mais un journal de vie vivant.

### 1.1 Intention & Philosophie

- Privé et personnel — la plateforme n'est pas publique
- Accessible à toute la famille si souhaité (rôles futurs)
- Simple à utiliser pour une personne non-technique
- Beau, chaleureux, qui donne envie de revenir
- Pérenne — construit pour durer et s'enrichir au fil des années

---

## 2. Stack Technique

| Couche | Technologie |
|---|---|
| Frontend | Next.js 14 (App Router) |
| UI Components | shadcn/ui + Tailwind CSS |
| Backend / BDD | Supabase (PostgreSQL + Auth + Storage) |
| Hébergement | Vercel |
| Animations | Framer Motion |
| Carte monde | react-simple-maps ou Mapbox GL JS (free tier) |
| Upload media | Supabase Storage (S3-compatible) |
| Video player | react-player |
| Fonts | Google Fonts — Playfair Display + Inter |

---

## 3. Charte Graphique

### 3.1 Palette

| Rôle | Valeur |
|---|---|
| Fond principal | `#FAF7F2` — blanc lin cassé, chaleureux |
| Texte principal | `#1A1A1A` — noir doux |
| Rose accent | `#F4B8C1` — rose pâle délicat |
| Rose foncé | `#C9748A` — pour les titres et highlights |
| Gris doux | `#888888` — textes secondaires |
| Fond cartes | `#FFFFFF` avec ombre douce |

### 3.2 Typographie

| Usage | Police |
|---|---|
| Titres / Headings | Playfair Display — serif élégant |
| Corps de texte | Inter — sans-serif lisible |
| Taille base | 16px / line-height 1.7 |

### 3.3 Principes Visuels

- Beaucoup d'espace blanc — jamais surchargé
- Ombres douces : `box-shadow: 0 4px 24px rgba(0,0,0,0.06)`
- Coins arrondis généreux : `border-radius: 16px`
- Animations subtiles au scroll et au hover
- Icônes Lucide React — fine et élégante

---

## 4. Pages & Fonctionnalités

### 4.1 Page d'Accueil — Animation Tournesol

La page d'accueil est une expérience visuelle d'entrée. Elle s'inspire du site [dolsten.com](https://www.dolsten.com/) : une animation plein écran immersive qui s'ouvre comme un rideau avant de laisser place à la navigation.

#### Animation au chargement

- Un tournesol SVG animé apparaît au centre de l'écran sur fond lin
- Les pétales s'ouvrent un à un avec une animation douce (Framer Motion, stagger 0.1s par pétale)
- Le cœur du tournesol pulse légèrement, comme une respiration
- Après ~2.5s, le tournesol se réduit en haut à gauche et devient le logo du site
- Le contenu de la page s'élève en fondu (fade + translateY)

> **Option :** afficher le prénom ou un mot doux (ex: « Bienvenue, Maman ») au cœur du tournesol pendant l'animation.

#### Contenu de la page d'accueil

- Hero section avec une phrase d'accueil personnalisée
- 3 cartes d'entrée cliquables : **Timeline • Carte du Monde • Galerie**
- Derniers souvenirs ajoutés (grid de 3 entrées récentes)
- Citation ou mot du jour — éditable depuis le dashboard

---

### 4.2 Timeline — Le Chemin de Vie

La timeline est le cœur de la plateforme. Elle représente visuellement la vie sous forme d'un chemin sinueux qui traverse les années, comme une route de vie.

#### Design du chemin sinueux

- SVG responsive d'un chemin ondulé de gauche à droite (ou top-bottom sur mobile)
- Chaque année est représentée par un nœud sur le chemin : un cercle avec l'année inscrite
- Les années avec du contenu ont un nœud plus grand, coloré en rose pâle
- Les années sans contenu ont un petit nœud gris discret
- Hover sur un nœud : légère animation de scale + tooltip avec le nombre de souvenirs
- Clic sur un nœud : ouverture d'un panneau latéral (drawer) ou navigation vers la page de l'année

#### Page d'une année

- En-tête : l'année en grand (Playfair Display, 80px), avec un sous-titre optionnel éditable
- Grid masonry des souvenirs de cette année (photos, vidéos, textes)
- Chaque souvenir est une carte avec : image/vidéo, titre, date précise, description courte
- Bouton « Ajouter un souvenir » visible si l'utilisatrice est connectée

#### Navigation

- Flèches gauche/droite pour passer d'une année à l'autre
- Depuis la timeline, scroll horizontal (desktop) ou vertical (mobile)
- Bouton « Retour à la timeline » toujours visible

---

### 4.3 Carte du Monde — World Map

Un onglet dédié affiche une carte du monde interactive avec des clusters visuels sur les pays visités.

#### Fonctionnement

- Carte du monde en style minimaliste (fond lin, pays en gris doux, océans en blanc)
- Les pays ayant du contenu sont mis en surbrillance rose pâle
- Une bulle montre le nombre de souvenirs par pays
- Hover : le pays se teinte légèrement en rose + tooltip (nom + nb souvenirs)
- Clic sur un pays : panneau avec tous les souvenirs de ce pays, filtrable par année

#### Détail technique

- Librairie recommandée : `react-simple-maps` avec topojson
- Chaque souvenir a un champ `country_code` (ISO 3166-1 alpha-2) en base de données
- Agrégation côté Supabase : `SELECT country_code, COUNT(*) GROUP BY country_code`

---

### 4.4 Galerie Globale

- Vue masonry de tous les souvenirs, tous pays et années confondus
- Filtres : par année, par pays, par type (photo / vidéo / texte)
- Tri : chronologique, anti-chronologique, aléatoire
- Clic sur une carte : ouverture d'une modale lightbox full-screen
- Dans la lightbox : navigation gauche/droite, description complète, date, lieu

---

### 4.5 Ajout d'un Souvenir

L'interface d'ajout doit être simple, guidée et rapide. Priorité à l'expérience mobile.

#### Formulaire de création

- **Titre** (obligatoire)
- **Date** — date picker, obligatoire — détermine l'année sur la timeline
- **Description / Histoire** — textarea rich, optionnel
- **Pays** — autocomplete sur liste ISO, optionnel
- **Upload** — photos (multiple, drag & drop + clic), vidéos, ou souvenir texte seul
- **Tags** — libres, optionnels (ex: famille, voyage, fête)

#### Upload média

- Images : compression automatique côté client avant upload (`browser-image-compression`)
- Taille max image : 10 MB après compression
- Vidéos : upload direct vers Supabase Storage, taille max 200 MB
- Génération automatique d'une miniature pour les vidéos
- Stockage : Supabase Storage dans un bucket privé `memories`

---

### 4.6 Authentification

- Auth via Supabase Auth — email + mot de passe
- Pas d'inscription publique — l'admin crée les comptes manuellement
- Session persistante (remember me par défaut)
- Page `/login` sobre et élégante avec le logo tournesol
- Redirect automatique vers `/timeline` après connexion
- Row Level Security (RLS) Supabase activé sur toutes les tables

---

## 5. Base de Données Supabase

### 5.1 Table : `memories`

| Colonne | Type & Description |
|---|---|
| `id` | `uuid` PK, `default gen_random_uuid()` |
| `user_id` | `uuid` FK → `auth.users` |
| `title` | `text NOT NULL` |
| `description` | `text` |
| `memory_date` | `date NOT NULL` — détermine l'année sur la timeline |
| `country_code` | `varchar(2)` — ISO 3166-1 alpha-2 (ex: FR, IT, MA) |
| `country_name` | `text` — nom lisible du pays |
| `tags` | `text[]` — tableau de tags |
| `type` | `enum: photo \| video \| text` |
| `created_at` | `timestamptz DEFAULT now()` |
| `updated_at` | `timestamptz DEFAULT now()` |

### 5.2 Table : `media_files`

| Colonne | Type & Description |
|---|---|
| `id` | `uuid` PK |
| `memory_id` | `uuid` FK → `memories` |
| `storage_path` | `text` — chemin dans Supabase Storage |
| `file_type` | `enum: image \| video` |
| `mime_type` | `text` (ex: image/jpeg, video/mp4) |
| `size_bytes` | `bigint` |
| `width` | `int` — pour les images |
| `height` | `int` — pour les images |
| `thumbnail_path` | `text` — miniature pour les vidéos |
| `position` | `int` — ordre d'affichage |
| `created_at` | `timestamptz DEFAULT now()` |

### 5.3 Table : `site_config`

| Colonne | Type & Description |
|---|---|
| `key` | `text` PK (ex: welcome_message, owner_name) |
| `value` | `text` |
| `updated_at` | `timestamptz DEFAULT now()` |

### 5.4 Politiques RLS

- `SELECT memories` : authentifié uniquement (ou public si famille)
- `INSERT / UPDATE / DELETE memories` : `user_id = auth.uid()` uniquement
- Bucket Storage `memories` : accès privé, URLs signées

---

## 6. Structure du Projet Next.js

```
app/
  (auth)/
    login/page.tsx
  (app)/
    layout.tsx              ← layout principal avec navbar
    page.tsx                ← page d'accueil avec animation tournesol
    timeline/
      page.tsx              ← la timeline sinueuse
      [year]/page.tsx       ← souvenirs d'une année
    world/page.tsx          ← carte du monde
    gallery/page.tsx        ← galerie globale
    memory/
      new/page.tsx          ← formulaire ajout
      [id]/page.tsx         ← détail d'un souvenir
      [id]/edit/page.tsx    ← édition

components/
  ui/                       ← composants shadcn
  sunflower/                ← animation tournesol
  timeline/                 ← chemin sinueux SVG
  world-map/                ← carte interactive
  memory-card/              ← carte souvenir
  lightbox/                 ← visionneuse fullscreen
  upload/                   ← dropzone + preview

lib/
  supabase/                 ← client + server clients
  utils.ts
  types.ts                  ← types TypeScript
```

---

## 7. Variables d'Environnement

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # côté serveur uniquement
```

---

## 8. Expérience Mobile

- Design mobile-first — tout doit fonctionner parfaitement sur iPhone
- Timeline en scroll vertical sur mobile (le chemin devient une ligne verticale)
- Carte du monde : pinch-to-zoom natif, tap pour sélectionner un pays
- Upload photo depuis la galerie ou la caméra (`input accept="image/*,video/*" capture`)
- Navigation bottom bar sur mobile (Timeline, Monde, Galerie, +Ajouter)

---

## 9. Évolutions Futures (Phase 2)

- Mode famille — partage avec d'autres membres (rôles viewer / editor)
- Réactions et commentaires sur les souvenirs
- Export PDF d'une année ou de l'intégralité
- Notifications anniversaire (ex: « Il y a 30 ans, tu étais à Paris... »)
- Mode présentation plein écran pour projeter lors de réunions de famille
- API publique pour intégration avec Google Photos ou iCloud

---

## 10. Checklist de Démarrage

### Supabase
- [ ] Créer un projet Supabase
- [ ] Créer les tables `memories`, `media_files`, `site_config`
- [ ] Activer RLS + créer les politiques
- [ ] Créer le bucket Storage `memories` (private)
- [ ] Créer le premier compte utilisateur via Supabase Auth

### Next.js / Vercel
- [ ] `npx create-next-app@latest life-project --typescript --tailwind --app`
- [ ] `npx shadcn@latest init`
- [ ] `npm install @supabase/supabase-js @supabase/ssr`
- [ ] `npm install framer-motion react-simple-maps react-player browser-image-compression`
- [ ] Configurer les variables d'environnement dans Vercel
- [ ] Déployer sur Vercel (connecter le repo GitHub)

---

*🌻 Avec amour, pour ses 60 ans.*
