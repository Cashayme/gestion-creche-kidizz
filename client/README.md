# Frontend de Gestion de Crèche - Explication du Code

Ce document explique le fonctionnement interne du code du frontend de l'application de gestion de crèche.

## Architecture Globale

Le projet utilise Vue 3 avec Composition API, Pinia pour la gestion de l'état, Vue Router pour la navigation, et Vuetify pour l'interface utilisateur. L'application suit une architecture modulaire basée sur les composants.

## Flux de Données Principal

1. Les interactions utilisateur dans les composants Vue déclenchent des actions.
2. Ces actions appellent des méthodes dans les stores Pinia.
3. Les stores effectuent des requêtes API via Axios.
4. Les données reçues sont stockées dans les stores et reflétées dans les composants.
5. Les composants se mettent à jour en fonction des changements d'état dans les stores.

## Modules Principaux

### Module Utilisateur (stores/user.ts)

- **Entité**: `User` (id, username, email)
- **Fonctionnalités clés**:
  - Login et enregistrement d'utilisateur
  - Gestion de la session utilisateur
  - Stockage local des informations utilisateur

```typescript
export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
  }),
  actions: {
    async login(username: string): Promise<boolean> {
      try {
        const response = await apiClient.get<User>(`/user?username=${username}`)
        this.currentUser = response.data
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser))
        return true
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return false
      }
    },
    // ... autres actions
  },
})
```

### Module Crèche (stores/daycare.ts)

- **Entité**: `Daycare` (id, name)
- **Fonctionnalités clés**:
  - Récupération de la liste des crèches
  - Création et suppression de crèches

```typescript
export const useDaycareStore = defineStore('daycare', {
  state: () => ({
    daycares: [] as Daycare[],
  }),
  actions: {
    async fetchDaycares() {
      try {
        const response = await apiClient.get<Daycare[]>('/child-cares')
        this.daycares = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des crèches:', error)
      }
    },
    // ... autres actions
  },
})
```

### Module Enfant (stores/child.ts)

- **Entité**: `Child` (id, first_name, last_name, relations avec Daycare)
- **Fonctionnalités clés**:
  - Récupération des enfants d'une crèche
  - Ajout et retrait d'enfants d'une crèche

```typescript
export const useChildStore = defineStore('child', {
  state: () => ({
    children: [] as Child[],
  }),
  actions: {
    async fetchChildren(daycareId: number) {
      try {
        const response = await apiClient.get<Child[]>(`/child-care/${daycareId}/children`)
        this.children = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des enfants:', error)
      }
    },
    // ... autres actions
  },
})
```

## Logique Métier Clé

### Authentification (pages/login.vue)

```vue
<script lang="ts">
export default defineComponent({
  setup() {
    const handleSubmit = async () => {
      if (!isNewUser.value) {
        const success = await userStore.login(username.value)
        if (success) {
          router.push('/daycares')
        } else {
          isNewUser.value = true
        }
      } else {
        const success = await userStore.register(username.value, email.value)
        if (success) {
          router.push('/daycares')
        }
      }
    }
    // ...
  }
})
</script>
```

### Gestion des Crèches (pages/daycares.vue)

```vue
<script lang="ts">
export default defineComponent({
  setup() {
    const createDaycare = async () => {
      if (userStore.currentUser) {
        await daycareStore.createDaycare(newDaycareName.value, userStore.currentUser.username)
        newDaycareName.value = ''
        showCreateForm.value = false
      }
    }

    const deleteDaycare = async (id: number) => {
      if (userStore.currentUser) {
        await daycareStore.deleteDaycare(id, userStore.currentUser.username)
      }
    }

    onMounted(() => {
      daycareStore.fetchDaycares()
    })
    // ...
  }
})
</script>
```

### Gestion des Enfants (pages/[id].vue)

```vue
<script lang="ts">
export default defineComponent({
  setup() {
    const addChild = async () => {
      if (userStore.currentUser) {
        await childStore.addChild(newChild.value, userStore.currentUser.username)
        newChild.value = { first_name: '', last_name: '', daycare_id: '' }
        showCreateForm.value = false
        await childStore.fetchChildren(daycareId)
      }
    }

    const removeChild = async (childId: number) => {
      if (userStore.currentUser) {
        await childStore.removeChild(daycareId, childId, userStore.currentUser.username)
        await childStore.fetchChildren(daycareId)
      }
    }
    // ...
  }
})
</script>
```

## Gestion des Requêtes API (api/axios.ts)

```typescript
const apiClient = axios.create({
  baseURL: 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  config => {
    const username = localStorage.getItem('username')
    if (username) {
      config.headers['X-Auth'] = username
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)
```

## Routage et Navigation (router/index.ts)

```typescript
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/daycares',
    },
    ...setupLayouts(routes),
  ],
})

router.beforeEach((to, from, next) => {
  const publicPages: string[] = ['/login']
  const authRequired: boolean = !publicPages.includes(to.path)
  const loggedIn: string | null = localStorage.getItem('currentUser')

  if (authRequired && !loggedIn) {
    return next('/login')
  }

  next()
})
```

## Points d'Extension

- Ajout de nouveaux modules : Créer un nouveau store Pinia et les composants Vue associés
- Modification des règles métier : Adapter la logique dans les stores et les composants concernés
- Ajout de nouvelles fonctionnalités UI : Étendre les composants existants ou créer de nouveaux composants

Cette structure frontend permet une séparation claire des préoccupations, facilitant la maintenance et l'évolution de l'application. Les stores Pinia centralisent la logique métier et la gestion de l'état, tandis que les composants Vue se concentrent sur l'interface utilisateur et les interactions.