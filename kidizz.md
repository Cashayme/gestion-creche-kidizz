# Bienvenue chez Kidizz

## Résumé

Nous allons configurer un petit projet capable de gérer simplement l’affectation d’enfant dans des crèches.

Le projet devra être effectué :
- En Vue 3 SPA côté client
- Nest.js côté serveur, avec TypeORM+Moteur SQL de son choix (SQLite, Postgres, …) pour la partie BDD

Le langage utilisé sera le TypeScript.
Hormis ces points, la configuration, les bibliothèques utilisées et le setup de projet sont à votre discrétion.

Les deux dépôts sont à publier sur un dépôt GitHub/GitLab/autre gestionnaire de votre choix.

## Modèle

Dans notre base de données, nous allons pouvoir stocker des crèches, et des enfants seront affectés à ces crèches.

De plus, nous allons avoir un stockage basique de l’utilisateur de l’application, afin de tracer qui effectue quelle modification.

Le schéma relationnel proposé est celui-ci :

- Utilisateur
  - Possède un e-mail et un nom d’utilisateur
- Crèche
  - Possède un nom
  - référence l’ID de l’utilisateur créateur
- Enfant
  - Possède un prénom, un nom
  - référence l’ID de l’utilisateur créateur
  - Est affecté à 1 à N structures

## 1) Création d'une API standard

### Utilisateur

- Un endpoint `GET /user` prenant en paramètre « username » et retournant l’utilisateur trouvé avec cet e-mail
- Un endpoint `PUT /user` prenant en corps « email » et « username » enregistrant (ou met à jour) un utilisateur pour l’email donné

### Crèche

- `GET /child-cares` -> Liste toutes les crèches
- `POST /child-care` -> Enregistre une nouvelle crèche
- `DELETE /child-care/:id` -> Supprime une crèche
  - Un utilisateur n'a pas le droit de supprimer une crèche si elle a été créée par quelqu'un d'autre que lui
- Les endpoints `POST` et `DELETE` doivent valider l'utilisateur courant via un header HTTP `X-Auth: <username>`, où `<username>` est un nom d'utilisateur valide en base de données
- L'ID de l'utilisateur courant sauvegardé dans l'entité lors d'une création est déduit via ce header

### Enfant

- `GET /child-care/:id/children` -> Liste les enfants dans une crèche
- `POST /child` -> Enregistre un nouvel enfant.
- `DELETE /child-care/:childCareId/child/:childId` -> Supprime l'affectation d'un enfant à une structure
  - Si l'enfant n'a plus aucune affectation après suppression de celle-ci, il doit être supprimé
  - Un utilisateur n'a pas le droit de supprimer une affectation si l'enfant a été créé par quelqu'un d'autre que lui
- Les endpoints `POST` et `DELETE` doivent valider l'utilisateur courant via un header HTTP `X-Auth: <username>`, où `<username>` est un nom d'utilisateur valide en base de données
- L'ID de l'utilisateur courant sauvegardé dans l'entité est déduit via ce header


## 2) Création d'un client web

Le client web doit être en mesure de manipuler ces entités, en accord avec l'API décrite.

1) Connexion

- Au démarrage de l’application Vue, on demande à l’utilisateur de rentrer son nom d’utilisateur
- Si l’utilisateur existe, on le « connecte » => on stocke son nom d’utilisateur et on l’affiche en en-tête de page
- Si il n’existe pas, on demande son e-mail, on créé l’utilisateur puis on le « connecte »

2) Listing des crèches

Une fois connecté, nous souhaitons lister les crèches de l’application.

- Proposer une interface simple qui liste les crèches enregistrées
- Nous pouvons créer une nouvelle crèche depuis ce listing
- Nous pouvons supprimer une crèche depuis ce listing
- Un lien permet d’aller sur la page de la crèche

3) Listing des enfants

Depuis la page d'une crèche, lister ses enfants.

- Proposer une interface simple qui liste les enfants enregistrés dans cette crèche
- Nous pouvons créer un nouvel enfant depuis ce listing
- Nous pouvons supprimer l'affectation de l'enfant depuis ce listing


## 3) Fonctionnalité : Export des données enfant

Le service support a souvent besoin d'un export des enfants présents en base de données, parfois pour une crèche donnée, parfois sur toute la base.

Vous décidez d'automatiser cette tâche en créant un nouvel endpoint : `GET /children/export.csv` retournant un fichier CSV.

- Le fichier ne doit pas contenir de duplicata, même si l'enfant est sur plusieurs structures
- Le fichier doit être généré "à la volée", en *streaming* depuis la base de données. Si il y a 13K enfants en base, on ne veut pas tous les avoir en mémoire en même temps !
- Le fichier doit être ordonné par nom de famille (A>Z)
- L'endpoint prend un paramètre optionnel `childCareId` filtrant avec les données d'une crèche en particulier si il est spécifié

1) Sur la page listing des crèches, proposer au dessus de la liste un lien "exporter" exportant toutes les données enfant de la base
2) Sur la page listing des crèches, par ligne d'une crèche, proposer un lien "exporter" exportant toutes les données enfant de la crèche


## 4) Fonctionnalité : Alerte de modification

Lorsqu'une structure est supprimée, les enfants présents dans cette structure perdent une affectation.

Afin d'informer les utilisateurs de votre application qu'une action est peut-être nécessaire, nous décidons de leur envoyer un e-mail.

Les utilisateurs informés seront *tous les utilisateurs ayant créé un enfant dans cette structure, excepté l'initiateur de la suppression*.

Pour simuler l'envoi d'un e-mail, nous vous proposons ce *no-op* asynchrone :

```ts
function informStructureDeletion(userEmail: string): Promise<void> {
  // wait between 1 and 7 seconds
  const secondsToWait = Math.trunc(Math.random() * 7) + 1;

  return new Promise<void>(resolve => {
    setTimeout(() => {
      console.log(userEmail, 'informed!');
      resolve();
    }, secondsToWait * 1000);
  });
}
```

Attention cependant !
Pour ne pas surcharger notre serveur d'envoi d'e-mail, vous devez vous assurer d'envoyer au moins 3 e-mails à la fois maximum.