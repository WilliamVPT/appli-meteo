# Installation de l'application

### Prérequis :
- PHP 8.2
- Composer installé
- Node.js et npm installés
- MySQL installé et configuré

---

### Étapes d'installation :
1. Clonez le projet ou extrayez le package.
2. Installez les dépendances backend avec Composer :
   ```bash
   composer install
   ```
3. Installez les dépendances frontend avec npm :
   ```bash
   npm install
   ```
4. Configurez le fichier .env du backend :
   ```makefile
   DATABASE_URL="mysql://[user]:[password]@[host]:3306/[database_name]"
   ```
   et la configuration des jetons :
   ```makefile
   JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
   JWT_PASSPHRASE=your_passphrase_here
   ```
5. Importez la base de données :
   ```bash
   mysql -u [utilisateur] -p [nom_base] < dump.sql
   ```
6. Lancez le serveur symfony :
   ```bash
   symfony serve
   ```
7. Compilez les assets du frontend :
   ```bash
   npm start
   ```
