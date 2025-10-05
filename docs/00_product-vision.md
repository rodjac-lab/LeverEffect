# Product Vision – Effet de levier A → B

## Problème
Décider des baisses de prix de A en intégrant les ventes complémentaires de B (immédiat N et différé N+1..N+3).

## Solution

### Inputs du modèle

**Produit A (produit principal avec baisse de prix)**
- Prix fond de rayon de A (prix affiché, baseline)
- Prix de vente moyen de A (reflète les remises volume, négociations, etc.)
- Nouveau prix fond de rayon de A (après baisse)
- Nouveau prix de vente moyen de A
- Volume de ventes A (année N, baseline)
- Coût unitaire de A (ou marge unitaire A)
- Élasticité prix de A (sensibilité du volume à la variation de prix)

**Produit B (produit complémentaire)**
- Prix de vente de B
- Coût unitaire de B (ou marge unitaire B)
- Taux d'attache N, N+1, N+2, N+3 (% de clients A qui achètent B chaque année)

**Paramètres financiers**
- Taux d'actualisation (pour calcul VAN)

### Logique de calcul

1. **Impact sur produit A**
   - Δ Prix fond de rayon = Nouveau prix fond de rayon - Prix fond de rayon baseline
   - Δ Prix de vente moyen = Nouveau prix de vente moyen - Prix de vente moyen baseline
   - Δ Volume A = Volume baseline × Élasticité × (Δ Prix fond de rayon / Prix fond de rayon baseline)
   - Δ Marge A = (Δ Volume A × Marge unitaire A) - (Volume baseline × Δ Prix de vente moyen)

2. **Impact sur produit B (ventes complémentaires)**
   - Pour chaque année N, N+1, N+2, N+3 :
     - Volume B = Δ Volume A × Taux d'attache
     - Marge B = Volume B × Marge unitaire B
     - Marge B actualisée = Marge B / (1 + taux)^année

3. **VAN et Break-even**
   - VAN = Δ Marge A + Σ(Marges B actualisées)
   - Break-even attache = Taux d'attache nécessaire pour VAN = 0

### Outputs (Visualisations & KPIs)

**Visualisations**
- Waterfall (Δ marge A, +B N..N+3, Total)
- Heatmap de cohortes (ou barres empilées)
- Tornado de sensibilité (impact sur VAN)
- Courbe de break-even (taux d'attache requis)
- Petits multiples (scénarios −3/−7/−12%)

**KPIs**
- VAN (Δ marge actualisée N..N+3)
- % d'attache cumulé requis (break-even)
- Δ marge A (immédiat), Δ marges B (par année)
- Sensibilité de la VAN (élasticité, attach, marge B, taux d'actualisation)
