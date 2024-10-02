import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

interface Daycare {
  id: number;
  name: string;
}

export const useDaycareStore = defineStore('daycare', {
  state: () => ({
    daycares: [] as Daycare[],
    currentDaycare: null as Daycare | null,
  }),
  actions: {
    async fetchDaycares () {
      try {
        const response = await apiClient.get<Daycare[]>('/child-cares')
        this.daycares = response.data
      } catch (error) {
        console.error('Erreur lors de la récupération des crèches:', error)
      }
    },
    async createDaycare (name: string, username: string) {
      try {
        const response = await apiClient.post<Daycare>(
          '/child-care',
          { name },
          {
            headers: { 'X-Auth': username },
          }
        )
        this.daycares.push(response.data)
      } catch (error) {
        console.error('Erreur lors de la création de la crèche:', error)
      }
    },
    async deleteDaycare (id: number, username: string) {
      try {
        await apiClient.delete(`/child-care/${id}`, {
          headers: { 'X-Auth': username },
        })
        this.daycares = this.daycares.filter(daycare => daycare.id !== id)
      } catch (error) {
        console.error('Erreur lors de la suppression de la crèche:', error)
      }
    },
  },
})
