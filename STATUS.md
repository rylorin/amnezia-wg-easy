# STATUS.md

## État actuel

- Phase 0 (audit) : faite
- Phase 1 (packaging) : faite — package.json consolidé, dépendances à la racine, TypeScript installé, build produit dist/
- Phase 2 (instrumentation) : faite — middleware HTTP log, bannière de démarrage, health endpoint, error handler, logs WireGuard
- Migration h3 v2 : implémentée avec `h3@2.0.1-rc.26`, validation de base effectuée
- Phase 4 (Docker) : en Dockerfile simplifié (base amneziawg-go, exécution via npx), docker-compose.yml mis à jour : faite

## En cours

- Polishing

## Prochaines étapes

- Phase 3 (TypeScript) : reportée

## Blocages

- Aucun bloquant

## Notes

N/A
