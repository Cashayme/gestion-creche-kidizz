<template>
  <v-app>
    <v-btn outlined @click="logout">
      <v-icon left>mdi-logout</v-icon>
      Déconnexion
    </v-btn>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script lang="ts" setup>
  import { useUserStore } from '@/stores/user'
  const userStore = useUserStore()
  const router = useRouter()
  const logout = () => {
    userStore.logout()
    router.push('/login')
  }

  userStore.loadUserFromStorage()

</script>
