import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

interface Child {
  child: {
    creator_id: number,
    id: number;
    first_name: string;
    last_name: string;
  }
  childId: number,
  daycareId: number,
  id: number
}

export const useChildStore = defineStore('child', {
  state: () => ({
    children: [] as Child[],
  }),
  actions: {
    async fetchChildren (daycareId: number) {
      try {
        const response = await apiClient.get<Child[]>(
          `/child-care/${daycareId}/children`
        )
        this.children = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des enfants:', error)
      }
    },
    async addChild (
      child: { first_name: string; last_name: string, daycare_id: string },
      username: string
    ) {
      try {
        const response = await apiClient.post<Child>('/child', child, {
          headers: { 'X-Auth': username },
        })
        this.children.push(response.data)
      } catch (error) {
        console.error("Erreur lors de l'ajout de l'enfant:", error)
      }
    },
    async removeChild (daycareId: number, childId: number, username: string) {
      try {
        await apiClient.delete(`/child-care/${daycareId}/child/${childId}`, {
          headers: { 'X-Auth': username },
        })
        this.children = this.children.filter(child => child.id !== childId)
      } catch (error) {
        console.error("Erreur lors du retrait de l'enfant:", error)
      }
    },
  },
})
