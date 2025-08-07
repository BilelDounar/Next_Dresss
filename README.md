# Dresss

**Dresss** est une application web communautaire inspirée de TikTok, entièrement dédiée à la mode. Elle permet aux utilisateurs de partager leurs tenues, découvrir celles des autres, et interagir via likes, commentaires, partages et favoris.

Développée dans le cadre du titre professionnel **Développeur Web et Web Mobile (DWWM)**, cette plateforme vise à répondre à une problématique simple mais fréquente : *"Comment vais-je m’habiller aujourd’hui ?"*

---

## 🛠️ Stack technique

### Front-end
- **React.js** + **Next.js** (App Router)
- **Tailwind CSS** + **ShadCN UI**
- **Storybook** (documentation des composants)
- Design responsive mobile-first

### Back-end
- **Node.js** + **Express**
- API REST sécurisée (JWT)
- Validation des données, middleware CORS, Bcrypt, etc.

### Base de données
- **PostgreSQL** (données structurées : utilisateurs, préférences)
- **MongoDB** (contenus souples : publications, interactions, commentaires)

---

## ⚙️ Installation locale

### Prérequis
- Node.js (v18 ou +)
- pnpm ou npm
- Base PostgreSQL + MongoDB (en local ou via services cloud)

### Variables d’environnement à créer `.env.local` :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dresss
MONGO_URI=mongodb://localhost:27017/dresss
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_MONGO=http://localhost:5000
```

### Installation

```bash
git clone https://github.com/BilelDounar/Next_Dresss.git
cd Next_Dresss
pnpm install
# ou
npm install
```

### Lancement en développement

```bash
pnpm dev
# ou
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

### Lancement de Storybook

```bash
pnpm storybook
# ou
npm run storybook
```

---

## 🚀 Fonctionnalités principales

- Carrousel vertical de publications (type TikTok)
- Création de publication (images, description, articles associés)
- Interactions sociales : likes, commentaires, partages, favoris
- Profil utilisateur (infos, publications, abonnements)
- Recherche d’utilisateurs
- Authentification via JWT
- Responsive mobile et desktop

---

## 🔧 À venir (TODO)

- Authentification via Google/ Apple
- Fonctionnalité de partage
- Feed  ‘Suivi’
- Notification système


