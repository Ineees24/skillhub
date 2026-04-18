SkillHub 

Plateforme collaborative mettant  en relation formateur et apprenant
Elle permet à des formateurs de gérer leurs formations (créer, modifier, supprimer) via un dashboard dédié.

Technologies utilisées

Frontend
- React + Vite
- React Router DOM
- Axios

Backend
- Laravel 11
- JWT Authentication (tymon/jwt-auth)
- MySQL

Installation et lancement

Prérequis
- PHP 8.2+
- Composer
- Node.js + npm
- MySQL

Backend (Laravel)

```bash
1. Aller dans le dossier backend
cd backend

2. Installer les dépendances
composer install

3. Générer la clé JWT
php artisan jwt:secret

6. Configurer la base de données dans .env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=skillhublaravel
DB_USERNAME=root
DB_PASSWORD=

7. Lancer les migrations
php artisan migrate

8. Lancer le serveur
php artisan serve
```

Le backend sera accessible sur : `http://127.0.0.1:8000`

Frontend (React)

```bash
1. Aller dans le dossier frontend
cd frontend

2. Installer les dépendances
npm install

3. Lancer le serveur de développement
npm run dev
```

Le frontend sera accessible sur : `http://localhost:5173`

Tests

Les tests sont écrits avec PHPUnit (Laravel).

```bash
# Lancer tous les tests
php artisan test
```

Le fichier `.env.testing` utilise une base SQLite en mémoire pour ne pas affecter la base de données principale.

Structure des fichiers

```
EC04/
│
├── backend/                        
│   ├── app/
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       ├── AuthController.php        pour le Login, register, logout, me
│   │   │       └── FormationController.php  pour le CRUD formations + catégories
│   │   ├── Models/
│   │   │   ├── User.php                       Modèle utilisateur (JWT)
│   │   │   ├── Formation.php                 Modèle formation
│   │   │   └── CategorieFormation.php        Modèle catégorie
│   │   └── Providers/
│   │       └── AppServiceProvider.php        Config SQLite pour les tests
│   ├── bootstrap/
│   │   └── app.php                           Gestion des exceptions JWT (401/403)
│   ├── database/
│   │   ├── factories/
│   │   │   ├── UserFactory.php
│   │   │   ├── FormationFactory.php
│   │   │   └── CategorieFormationFactory.php
│   │   └── migrations/
│   │       ├── create_users_table.php
│   │       ├── create_categorieformation_table.php
│   │       └── create_formation_table.php
│   ├── routes/
│   │   └── api.php                           Toutes les routes API
│   ├── tests/
│   │   ├── Unit/
│   │   │   ├── UserTest.php                  Tests unitaires modèle User
│   │   │   └── FormationTest.php             Tests unitaires modèle Formation
│   │   └── Feature/
│   │       ├── AuthTest.php                  Tests routes auth
│   │       └── FormationTest.php             Tests routes formations
│   ├── .env                                  
│   ├── .env.testing                          Variables pour les tests (SQLite)
│   └── openapi.yaml                          Documentation API
│
└── frontend/                       Application React
    └── src/
        ├── pages/
        │   └── DashboardFormateur.jsx        
        ├── services/
        │   ├── axios.js                      Instance Axios + intercepteur JWT
        │   └── authService.js               Login, logout, gestion localStorage
        └── components/
            └── Footer.jsx
```
Authentification

L'API utilise JWT (JSON Web Token).

1. Se connecter via `POST /api/login` pour obtenir un token
2. Inclure le token dans chaque requête : `Authorization: Bearer <token>`
3. Le token est stocké dans le `localStorage` et ajouté automatiquement par l'intercepteur Axios

 Comptes de formateur

| Email | Mot de passe | Rôle |

| formateur@test.com | 123456 | FORMATEUR |
| emma.laurent@gmail.com | 123456 | FORMATEUR |
