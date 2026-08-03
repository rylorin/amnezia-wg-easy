# MIGRATION_NOTES.md

## But

Documenter les observations techniques pendant la migration.

## Notes techniques

- Le projet actuel semble insuffisamment structuré pour un cycle de maintenance moderne.
- Le packaging devra être clarifié avant toute migration lourde.
- Le code JavaScript existant doit rester exécutable pendant la transition.
- Les dépendances et scripts seront probablement à corriger avant de commencer la migration TypeScript.

## Hypothèses de travail

- Le projet peut fonctionner avec un noyau Node.js standard.
- Les couches les plus utiles à typer en premier sont les frontières: config, routes, modèles, I/O système.
- Les modules feuilles sont de bons candidats pour une conversion initiale.

## Questions ouvertes

- Quel framework HTTP exact est le plus approprié à conserver ?
- Quelles parties relèvent encore strictement d'Amnezia ?
- Quelle part du code peut être extraite en bibliothèque réutilisable ?
