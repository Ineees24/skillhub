# SkillHub

Racine du projet pour le backend et le frontend SkillHub.

## Structure

- `skillhub-back/` backend Laravel
- `skillhub-front/` frontend React
- `.github/workflows/ci.yml` workflow GitHub Actions avec analyse Sonar
- `sonar-project.properties` configuration Sonar pour les deux applications

## Sonar

Configurez ces secrets du depot avant d'activer le workflow :

- `SONAR_TOKEN`
- `SONAR_HOST_URL`

## Docker

Utilisez `docker-compose.yml` a la racine pour lancer les deux services en local.
