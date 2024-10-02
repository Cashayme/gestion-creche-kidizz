import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

interface User {
  id: string;
  username: string;
  email: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    currentUser: null as User | null,
  }),
  actions: {
    async login (username: string): Promise<boolean> {
      try {
        const response = await apiClient.get<User>(
          `/user?username=${username}`
        )
        this.currentUser = response.data
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser)) // Stocker l'utilisateur complet
        return true
      } catch (error) {
        console.error('Erreur lors de la connexion:', error)
        return false
      }
    },
    async register (username: string, email: string): Promise<boolean> {
      try {
        const response = await apiClient.put<User>('/user', {
          username,
          email,
        })
        this.currentUser = response.data
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser)) // Stocker l'utilisateur complet
        return true
      } catch (error) {
        console.error("Erreur lors de l'enregistrement:", error)
        return false
      }
    },
    logout () {
      this.currentUser = null
      localStorage.removeItem('currentUser')
    },
    loadUserFromStorage () {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        this.currentUser = JSON.parse(storedUser)
      }
    },
  },
})
