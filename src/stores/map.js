import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useMapStore = defineStore('map', () => {
  const mapAllData = ref([])

  const fetchMapData = async () => {
    const res = await axios.get('/user/locations')
    mapAllData.value = res.data.data
  }

  return {
    mapAllData,
    fetchMapData,
  }
})
