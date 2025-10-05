# Effet de levier A → B

Un simulateur React + TypeScript + Chart.js pour analyser l'impact d'une baisse de prix du produit A sur les ventes complémentaires du produit B (immédiat et différé sur 3 ans).

## 📋 Vue d'ensemble

Ce simulateur permet de modéliser l'effet de levier commercial : une baisse du prix de A augmente ses ventes, qui génèrent des ventes complémentaires de B. L'outil calcule la VAN (valeur actualisée nette) et détermine le taux d'attache nécessaire pour atteindre le break-even.

### Modèle de pricing dual (Produit A)

Le simulateur distingue deux types de prix pour le produit A :
- **Prix fond de rayon** : prix affiché, utilisé pour calculer l'élasticité (impact sur volumes)
- **Prix de vente moyen** : prix réel encaissé (après remises volume, négociations), utilisé pour calculer l'impact marge

Cette distinction reflète la réalité commerciale où le prix affiché diffère souvent du prix moyen réellement pratiqué.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev
```

Ouvrez ensuite [http://localhost:5173/LeverEffect/](http://localhost:5173/LeverEffect/) pour accéder à l'interface.

## 📊 Fonctionnalités

### Inputs du modèle

**Produit A (produit principal avec baisse de prix)**
- Prix fond de rayon baseline et nouveau
- Prix de vente moyen baseline et nouveau
- Volume de ventes (année N)
- Coût unitaire
- Élasticité prix (sensibilité du volume aux variations de prix)
- Override Δ Volume (optionnel, pour forcer une variation de volume)

**Produit B (produit complémentaire)**
- Prix de vente
- Coût unitaire
- Taux d'attache N, N+1, N+2, N+3 (% de clients A qui achètent B)

**Paramètres financiers**
- Taux d'actualisation (pour calcul VAN)

### Logique de calcul

1. **Impact sur produit A**
   - Δ Volume A = Volume baseline × Élasticité × (Δ Prix fond de rayon / Prix fond de rayon baseline)
   - Δ Marge A = (Δ Volume A × Marge unitaire A) - (Volume baseline × Δ Prix de vente moyen)

2. **Impact sur produit B**
   - Pour chaque année : Volume B = Δ Volume A × Taux d'attache
   - Marge B actualisée = (Volume B × Marge unitaire B) / (1 + taux)^année

3. **VAN et Break-even**
   - VAN = Δ Marge A + Σ(Marges B actualisées)
   - Break-even = Taux d'attache nécessaire pour VAN = 0

### Visualisations

- **Waterfall** : Cascade d'impacts sur la marge (Δ marge A, +B N..N+3, Total)
- **Cohortes B** : Contribution des ventes B par cohorte et par année
- **Tornado de sensibilité** : Impact des variations de paramètres sur la VAN
- **Courbe break-even** : Taux d'attache requis selon le niveau de remise
- **Scénarios multiples** : Comparaison de 3 scénarios de remise (-3%, -7%, -12%)

### KPIs affichés

- Δ ventes A (unités)
- Δ marge A (année N)
- Break-even attache (%)
- VAN (Δ marge actualisée N..N+3)
- Cumul nominal (non actualisé)

## 🛠 Scripts disponibles

- `npm run dev` : Lance Vite en mode développement
- `npm run build` : Compile TypeScript et génère les assets de production
- `npm run preview` : Sert le build de production pour vérification
- `npm run lint` : Exécute ESLint sur tout le projet
- `npm run test` : Exécute les tests unitaires (Vitest)

## 📁 Structure du projet

```
/src
  /charts         # Composants de visualisation (Chart.js)
  /sim            # Logique de simulation et calculs
    core.ts       # Fonctions principales (simulate, npv, sensitivity, breakevenCurve)
    __tests__/    # Tests unitaires
  App.tsx         # Composant principal
  types.ts        # Types TypeScript
/docs
  00_product-vision.md  # Vision produit détaillée
```

## 📚 Documentation

Pour plus de détails sur le modèle métier et les calculs, consultez [docs/00_product-vision.md](docs/00_product-vision.md).

## 🚢 Déploiement

Le projet est configuré pour être déployé automatiquement sur GitHub Pages via GitHub Actions à chaque push sur `main`.

```bash
# Build manuel
npm run build

# Le résultat est disponible dans dist/
```

## 🧪 Tests

```bash
npm run test
```

Les tests couvrent les fonctions de calcul principales (simulation, VAN, sensibilité, break-even).

## 📝 Historique des modifications

- **v1.1** (2025-10-05) : Implémentation du modèle de pricing dual (prix fond de rayon vs prix vente moyen)
- **v1.0** : Version initiale avec modèle simplifié

## 📄 Licence

ISC
