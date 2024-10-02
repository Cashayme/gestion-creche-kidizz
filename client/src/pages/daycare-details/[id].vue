<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Détails de la crèche</h1>
        <h2 class="text-h5 mb-3">Liste des enfants</h2>
        <v-btn class="mb-4" color="primary" @click="showCreateForm = true">
          Ajouter un enfant
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="childStore.children"
    >
      <template #item.actions="{ item }">
        <v-btn
          color="error"
          :disabled="item.child && !(Number(userStore.currentUser?.id) === item.child.creator_id)"
          small
          @click="removeChild(item.childId)"
        >
          Retirer de la crèche
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="showCreateForm" max-width="500px">
      <v-card>
        <v-card-title>Ajouter un enfant</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newChild.first_name"
            label="Prénom de l'enfant"
          />
          <v-text-field
            v-model="newChild.last_name"
            label="Nom de l'enfant"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="addChild">Ajouter</v-btn>
          <v-btn color="error" @click="showCreateForm = false">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn class="mt-5" color="primary" outlined @click="goToDaycares">
      <v-icon left>mdi-arrow-left</v-icon>
      Retourner à la liste des crèches
    </v-btn>
  </v-container>
</template>

<script lang="ts">
  import { useChildStore } from '@/stores/child'
  import { useUserStore } from '@/stores/user'
  interface RouteParams {
    id: string;
  }
  export default defineComponent({
    setup () {
      const router = useRouter()
      const route = useRoute()
      const id = (route.params as RouteParams).id
      const childStore = useChildStore()
      const userStore = useUserStore()
      const showCreateForm = ref(false)
      const daycareId = Number(id)
      const newChild = ref({ first_name: '', last_name: '', daycare_id: id })

      const headers = [
        { title: 'Prénom', key: 'child.first_name' },
        { title: 'Nom', key: 'child.last_name' },
        { title: 'Actions', key: 'actions', sortable: false },
      ]

      const goToDaycares = () => {
        router.push('/daycares') // Rediriger vers la page /daycares
      }

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

      onMounted(() => {
        childStore.fetchChildren(daycareId)
      })

      return {
        childStore,
        userStore,
        showCreateForm,
        newChild,
        headers,
        addChild,
        goToDaycares,
        removeChild,
      }
    },
  })
</script>
