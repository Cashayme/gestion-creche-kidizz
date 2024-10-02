<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" sm="8">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>{{ isNewUser ? 'Inscription' : 'Connexion' }}</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="username"
                label="Nom d'utilisateur"
                prepend-icon="mdi-account"
                required
                type="text"
              />
              <v-text-field
                v-if="isNewUser"
                v-model="email"
                label="Email"
                prepend-icon="mdi-email"
                required
                type="email"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="handleSubmit">
              {{ isNewUser ? "S'inscrire" : 'Se connecter' }}
            </v-btn>
            <v-btn v-if="isNewUser" color="secondary" @click="toggleMode">
              Déjà un compte ?
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
  import { useUserStore } from '@/stores/user'

  export default defineComponent({
    setup () {
      const router = useRouter()
      const userStore = useUserStore()
      const username = ref('')
      const email = ref('')
      const isNewUser = ref(false)

      const handleSubmit = async () => {
        try {
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
        } catch (error) {
          console.error('Erreur lors de la connexion/inscription:', error)
        }
      }

      const toggleMode = () => {
        isNewUser.value = !isNewUser.value
      }

      return { username, email, isNewUser, handleSubmit, toggleMode }
    },
  })
</script>
