# Gestion de Crèche API - Explication du Code

Ce document explique le fonctionnement interne du code de l'API de gestion de crèche.

## Architecture Globale

Le projet suit une architecture modulaire basée sur NestJS. Chaque entité métier (utilisateur, crèche, enfant) a son propre module, qui encapsule les fonctionnalités CRUD et la logique métier associée.

## Flux de Données Principal

1. Les requêtes entrent via les contrôleurs (`*.controller.ts`)
2. Les contrôleurs délèguent le traitement aux services (`*.service.ts`)
3. Les services interagissent avec la base de données via les repositories TypeORM
4. Les données sont renvoyées au client, transformées si nécessaire

## Modules Principaux

### Module Utilisateur (`user`)

- **Entité**: `User` (id, email, username, relations avec Child et Daycare)
- **Fonctionnalités clés**:
  - Recherche d'utilisateur par username
  - Création/mise à jour d'utilisateur avec vérification d'email et gestion des conflits de username

### Module Crèche (`child-care`)

- **Entité**: `Daycare` (id, name, relation avec User et ChildDaycare)
- **Fonctionnalités clés**:
  - Création de crèche avec association au créateur
  - Suppression de crèche avec notification aux utilisateurs concernés
  - Vérification des droits de suppression

### Module Enfant (`child`)

- **Entités**: `Child` (id, first_name, last_name, relations avec User et ChildDaycare)
- **Fonctionnalités clés**:
  - Création d'enfant avec association à une crèche
  - Retrait d'un enfant d'une crèche
  - Gestion des affectations multiples via ChildDaycare

### Module Export (`export`)

- **Fonctionnalité**: Export des données enfants en CSV
- **Particularité**: Utilisation de streaming pour gérer efficacement de grands volumes de données

## Logique Métier Clé

### Création/Mise à jour d'Utilisateur (`UserService`)

```typescript
async createOrUpdate(userData: { email: string; username: string }): Promise<User> {
  // Vérification de l'email
  if (!this.isValidEmail(userData.email)) {
    throw new BadRequestException("L'adresse email fournie n'est pas valide");
  }
  
  // Recherche d'utilisateur existant
  let user = await this.userRepository.findOne({where: { email: userData.email }});
  
  if (user) {
    // Logique de mise à jour
  } else {
    // Logique de création
  }
  
  // Sauvegarde et retour
  return this.userRepository.save(user);
}
```

### Suppression de Crèche avec Notifications (`ChildCareService`)

```typescript
async remove(id: number, initiatorUsername: string): Promise<object> {
  // Récupération de la crèche et des enfants associés
  const childCare = await this.childCareRepository.findOne({/*...*/});
  
  // Identification des utilisateurs à notifier
  const usersToNotify = childCare.children
    .map(childDaycare => childDaycare.child.creator)
    .filter(/*...*/);
  
  // Suppression des associations ChildDaycare
  await this.childDaycareRepository.delete({daycare: {id: childCare.id}});
  
  // Suppression de la crèche
  await this.childCareRepository.remove(childCare);
  
  // Envoi des notifications par lots
  await this.sendNotificationsInBatches(usersToNotify.map(user => user.email));
  
  return { message: 'Crèche supprimée avec succès' };
}
```

### Export CSV avec Streaming (`ExportService`)

```typescript
async streamChildrenCsv(res: Response, childCareId?: number): Promise<void> {
  const queryBuilder = this.childRepository.createQueryBuilder(/*...*/);
  
  // Configuration du stream CSV
  const csvStream = csv.format({ headers: true, delimiter: ';' });
  csvStream.pipe(res);
  
  // Écriture des données dans le stream
  for (const child of children) {
    csvStream.write({
      ID: child.child_id,
      Prénom: child.child_first_name,
      // ...
    });
  }
  
  csvStream.end();
  
  // Attente de la fin du stream
  return new Promise<void>((resolve) => {
    csvStream.on('end', () => {
      res.end();
      resolve();
    });
  });
}
```

## Gestion de l'Authentification

L'authentification est gérée via un `AuthGuard` personnalisé qui vérifie la présence et la validité du header `X-Auth`.

## Middleware de Logging

Un middleware de logging est appliqué globalement pour enregistrer chaque requête :

```typescript
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}
```

## Configuration de la Base de Données

La connexion à la base de données SQLite est configurée dans `app.module.ts` :

```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: './db/kidizz.db',
  entities: [`${__dirname}/**/*.entity{.ts,.js}`],
  synchronize: false,
})
```

## Points d'Extension

- Ajout de nouvelles entités : Créer un nouveau module NestJS et l'entité TypeORM correspondante
- Modification des règles métier : Adapter la logique dans les services concernés
- Ajout de nouveaux endpoints : Étendre les contrôleurs existants ou créer de nouveaux contrôleurs

Ce README fournit un aperçu détaillé du fonctionnement interne du code, mettant en évidence les principaux flux de données, la logique métier clé, et les points d'extension potentiels.