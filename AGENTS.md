# AGENTS.md

## Projet

Ce dépôt est un fork de `https://github.com/w0rng/amnezia-wg-easy`, destiné à devenir un projet autonome d'interface Web d'administration pour AmneziaWG / WireGuard, avec une évolution progressive vers un packaging Node.js standard et une migration incrémentale de JavaScript vers TypeScript.

## Objectif principal

- Stabiliser et moderniser le projet.
- Remettre en ordre le packaging Node.js.
- Simplifier l'exécution locale et Docker.
- Migrer progressivement le code vers TypeScript sans réécriture massive.

## Principes de travail

- Ne pas réorganiser l'arborescence sans nécessité.
- Préserver le fonctionnement à chaque étape.
- Faire des changements petits, vérifiables et isolés.
- Éviter les refactorings larges non demandés.
- Prioriser la lisibilité et la maintenabilité.

## Règles pour l'agent

- Toujours proposer un plan avant d'implémenter des modifications larges.
- Quand une tâche est ambiguë, demander une clarification avant d'agir.
- Ne pas modifier plusieurs sujets indépendants dans le même lot de changements.
- Préférer les correctifs simples et traçables.
- Ajouter ou mettre à jour la documentation lorsque le comportement change.
- Si une modification touche au packaging, vérifier aussi les scripts d'exécution et la documentation associée.
- Si une modification touche au typage, privilégier une migration incrémentale.

## Stratégie TypeScript

- Autoriser JavaScript et TypeScript à coexister.
- Convertir les fichiers progressivement.
- Commencer par les modules feuille et les frontières typées.
- Éviter une migration “big bang”.
- Garder le projet exécutable à chaque étape.

## Définitions de done

Une tâche est considérée comme terminée seulement si :

- le code modifié fonctionne,
- les tests pertinents passent ou l'absence de tests est explicitement signalée,
- la documentation utile est mise à jour,
- le changement est limité à ce qui était demandé.

## Style de réponse attendu de l'agent

- Réponses courtes, factuelles, orientées action.
- Si plusieurs options existent, proposer la meilleure et expliquer brièvement pourquoi.
- Lister explicitement les risques ou dépendances si elles existent.
