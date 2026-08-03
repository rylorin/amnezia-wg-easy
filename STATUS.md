# STATUS.md

## État actuel

- Phase 0 (audit) : faite
- Phase 1 (packaging) : faite — package.json consolidé, dépendances à la racine, TypeScript installé, build produit dist/
- Phase 2 (instrumentation) : faite — middleware HTTP log, bannière de démarrage, health endpoint, error handler, logs WireGuard
- Phase 4 (Docker) : en cours — Dockerfile simplifié (base amneziawg-go, exécution via npx), docker-compose.yml mis à jour

## En cours

- Tests du Dockerfile par l'utilisateur

## Prochaines étapes

- Phase 3 (TypeScript) : reportée — l'utilisateur reviendra avec les résultats des tests Docker
- Vérifier la résolution de `publicDir` dans le contexte `npx`

## Blocages

- Aucun bloquant

## Notes

- `publicDir` dans `src/lib/Server.js` résout `path.resolve(__dirname, '..', 'www')` — à corriger en `resolve(__dirname, 'www')` si `www` est dans `dist/` (cas npx). Le fallback `/app/www` ne fonctionnera pas car npx n'installe pas dans `/app`.