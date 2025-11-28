# Frontend Node.js (sans Next.js)

Ce dossier propose une alternative à `front/` : même intention (un point d’entrée UI pour Transcendance) mais uniquement avec **Node.js**, **TypeScript** et **Tailwind CSS**.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Lance en parallèle le serveur HTTP Node (TS) et la compilation Tailwind en mode watch. |
| `npm run build` | Construit le CSS et transpile le serveur vers `dist/`. |
| `npm start` | Démarre le serveur sur le port `4000` à partir des artefacts compilés. |

## Structure rapide

- `src/server.ts` : serveur HTTP Node minimaliste qui sert `public/` et expose `/health`.
- `src/styles/tailwind.css` : point d’entrée Tailwind (base/components/utilities).
- `public/` : HTML statique et assets générés (`public/assets/app.css` est produit par Tailwind, ignoré par git).

## Tailwind

Tailwind scanne `public/**/*.html` et tous les fichiers TypeScript sous `src/`. Ajoutez simplement vos nouveaux écrans HTML ou vos composants server-side, relancez `npm run dev`, et le CSS se mettra à jour automatiquement.

