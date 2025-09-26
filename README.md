# Effet de levier A → B

Un simulateur React + Chart.js pour explorer l'impact d'une baisse de prix du produit A sur les ventes complémentaires du produit B.

## Démarrage rapide

```bash
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173 pour accéder à l'interface.

## Scripts

- `npm run dev` : lance Vite en mode développement.
- `npm run build` : compile TypeScript et génère les assets de production.
- `npm run preview` : sert le build de production pour vérification.
- `npm run lint` : exécute ESLint sur tout le projet.
- `npm run test` : exécute les tests unitaires (Vitest).

## Visuels & KPIs

- **Waterfall** : Δ marge A, marges B (N..N+3) et total cumulé.
- **Cohortes** : contribution des nouvelles ventes B par vague d'attache.
- **Tornado** : sensibilité de la VAN aux paramètres clés.
- **Break-even** : courbe du taux d'attache requis selon la remise appliquée.
- **Petits multiples** : trois scénarios de remise (−3 %, −7 %, −12 %).

KPIs présentés : variation de volume A, Δ marge A, taux d'attache break-even, VAN actualisée et cumul nominal.

## Build

```bash
npm run build
```

Le résultat est disponible dans `dist/`.

## Preview de production

```bash
npm run preview
```

## Tests

```bash
npm run test
```

## Screenshot

_Ajoutez ici une capture lorsque disponible._
