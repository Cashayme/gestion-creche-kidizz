<template>
  <v-container>
    <v-row>
      <v-col>
        <h1 class="text-h4 mb-4">Liste des crèches</h1>
        <p>Connecté en tant que : {{ userStore.currentUser?.username }}</p>
        <v-btn class="mb-4 mr-2" color="primary" @click="showCreateForm = true">
          Créer une nouvelle crèche
        </v-btn>
        <v-btn class="mb-4" color="secondary" :href="`http://localhost:3001/children/export.csv`">
          Exporter toutes les données enfant
        </v-btn>
      </v-col>
    </v-row>

    <v-data-table
      class="elevation-1"
      :headers="headers"
      :items="daycareStore.daycares"
    >
      <template #item.actions="{ item }">
        <v-btn
          class="mr-2"
          color="primary"
          small
          :to="`/daycare-details/${item.id}`"
        >
          Voir détails
        </v-btn>
        <v-btn
          class="mr-2"
          color="error"
          small
          @click="deleteDaycare(item.id)"
        >
          Supprimer
        </v-btn>
        <v-btn
          color="secondary"
          :href="`http://localhost:3001/children/export.csv?childCareId=${item.id}`"
          small
        >
          Exporter
        </v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="showCreateForm" max-width="500px">
      <v-card>
        <v-card-title>Créer une nouvelle crèche</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="newDaycareName"
            label="Nom de la nouvelle crèche"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="primary" @click="createDaycare">Créer</v-btn>
          <v-btn color="error" @click="showCreateForm = false">Annuler</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
  import { useDaycareStore } from '@/stores/daycare'
  import { useUserStore } from '@/stores/user'

  export default defineComponent({
    setup () {
      const daycareStore = useDaycareStore()
      const userStore = useUserStore()
      const showCreateForm = ref(false)
      const newDaycareName = ref('')

      const headers = [
        { title: 'Nom', key: 'name' },
        { title: 'Actions', key: 'actions', sortable: false },
      ]

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

      return { daycareStore, userStore, showCreateForm, newDaycareName, createDaycare, deleteDaycare, headers }
    },
  })
</script>
